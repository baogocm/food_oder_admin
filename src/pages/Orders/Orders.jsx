import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Order.css';

const Orders = ({ url }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'paid', 'shipping', 'delivered', 'cancelled'
  const [updateLoading, setUpdateLoading] = useState(false); // Trạng thái đang cập nhật
  const [updateSuccess, setUpdateSuccess] = useState(null); // Thông báo cập nhật thành công
  const [deleteConfirm, setDeleteConfirm] = useState(null); // ID đơn hàng đang cần xác nhận xóa
  
  // Các trạng thái đơn hàng
  const orderStatuses = [
    { value: 'Đang chờ', label: 'Đang chờ' },
    { value: 'Đã thanh toán', label: 'Đã thanh toán' },
    { value: 'Đang giao', label: 'Đang giao' },
    { value: 'Đã giao', label: 'Đã giao' },
    { value: 'Đã hủy', label: 'Đã hủy' }
  ];
  
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const apiUrl = `${url || 'https://food-order-backend-5afp.onrender.com'}/api/order/list`;
      console.log("Đang gọi API:", apiUrl);
      
      const response = await axios.get(apiUrl);
      console.log("Kết quả từ API:", response.data);
      
      if (response.data.success) {
        console.log("Số lượng đơn hàng:", response.data.orders.length);
        setOrders(response.data.orders);
      } else {
        console.error("API trả về lỗi:", response.data.message);
        setError(response.data.message || 'Không thể tải danh sách đơn hàng');
      }
    } catch (error) {
      console.error('Lỗi khi tải đơn hàng:', error.response ? error.response.data : error.message);
      setError('Đã xảy ra lỗi khi tải danh sách đơn hàng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Hàm cập nhật trạng thái đơn hàng
  const updateOrderStatus = async (orderId, status, payment) => {
    setUpdateLoading(true);
    setUpdateSuccess(null);
    try {
      const apiUrl = `${url || 'https://food-order-backend-5afp.onrender.com'}/api/order/update-status`;
      
      // Lấy token từ localStorage (nếu cần)
      const token = localStorage.getItem('admin_token');
      
      const response = await axios.post(
        apiUrl, 
        { orderId, status, payment },
        { headers: token ? { token } : {} }
      );
      
      if (response.data.success) {
        // Cập nhật danh sách đơn hàng
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId 
              ? { ...order, status, payment } 
              : order
          )
        );
        
        // Nếu đang xem chi tiết đơn hàng này, cập nhật thông tin
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder({ ...selectedOrder, status, payment });
        }
        
        setUpdateSuccess(`Đã cập nhật trạng thái đơn hàng thành ${status}`);
        
        // Tự động ẩn thông báo sau 3 giây
        setTimeout(() => {
          setUpdateSuccess(null);
        }, 3000);
      } else {
        console.error("Lỗi cập nhật trạng thái:", response.data.message);
        alert("Lỗi khi cập nhật trạng thái đơn hàng: " + response.data.message);
      }
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
      alert("Đã xảy ra lỗi khi cập nhật trạng thái đơn hàng.");
    } finally {
      setUpdateLoading(false);
    }
  };

  // Hàm xóa đơn hàng
  const deleteOrder = async (orderId) => {
    try {
      setUpdateLoading(true);
      const apiUrl = `${url || 'https://food-order-backend-5afp.onrender.com'}/api/order/delete`;
      
      // Lấy token từ localStorage (nếu cần)
      const token = localStorage.getItem('admin_token');
      
      const response = await axios.post(
        apiUrl, 
        { orderId },
        { headers: token ? { token } : {} }
      );
      
      if (response.data.success) {
        // Xóa đơn hàng khỏi danh sách
        setOrders(prevOrders => prevOrders.filter(order => order._id !== orderId));
        
        // Nếu đang xem chi tiết đơn hàng này, đóng modal
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(null);
        }
        
        setUpdateSuccess("Đã xóa đơn hàng thành công");
        
        // Tự động ẩn thông báo sau 3 giây
        setTimeout(() => {
          setUpdateSuccess(null);
        }, 3000);
      } else {
        console.error("Lỗi xóa đơn hàng:", response.data.message);
        alert("Lỗi khi xóa đơn hàng: " + response.data.message);
      }
    } catch (error) {
      console.error("Lỗi xóa đơn hàng:", error);
      alert("Đã xảy ra lỗi khi xóa đơn hàng.");
    } finally {
      setUpdateLoading(false);
      setDeleteConfirm(null); // Xóa trạng thái xác nhận
    }
  };

  // Hàm xác nhận xóa đơn hàng
  const confirmDelete = (orderId) => {
    setDeleteConfirm(orderId);
  };

  // Hàm hủy xóa đơn hàng
  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  // Hàm định dạng ngày tháng
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Lọc đơn hàng theo trạng thái
  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => {
        if (filter === 'pending') return order.status === 'Đang chờ';
        if (filter === 'paid') return order.status === 'Đã thanh toán';
        if (filter === 'shipping') return order.status === 'Đang giao';
        if (filter === 'delivered') return order.status === 'Đã giao';
        if (filter === 'cancelled') return order.status === 'Đã hủy';
        return true;
      });

  // Hiển thị chi tiết đơn hàng khi click
  const handleOrderClick = (order) => {
    setSelectedOrder(order);
  };

  // Đóng modal chi tiết đơn hàng
  const closeOrderDetails = () => {
    setSelectedOrder(null);
  };

  if (loading) {
    return <div className="orders-loading">Đang tải dữ liệu đơn hàng...</div>;
  }

  if (error) {
    return <div className="orders-error">
      <p>{error}</p>
      <button onClick={fetchOrders} className="retry-button">Thử lại</button>
    </div>;
  }

  // Render các item trong đơn hàng
  const renderItems = (items) => {
    if (items && Array.isArray(items)) {
      // Nếu items là mảng phẳng chứa các sản phẩm
      if (items.length > 0 && typeof items[0] === 'object' && items[0].name) {
        return items.map((item, index) => (
          <div key={index} className="order-detail-item">
            <div className="item-name">{item.name}</div>
            <div className="item-quantity">SL: {item.quantity}</div>
            <div className="item-price">{item.price}đ</div>
          </div>
        ));
      } 
      // Nếu items là mảng lồng (mảng của mảng)
      else if (items.length > 0 && Array.isArray(items[0])) {
        return items[0].map((item, index) => (
          <div key={index} className="order-detail-item">
            <div className="item-name">{item.name}</div>
            <div className="item-quantity">SL: {item.quantity}</div>
            <div className="item-price">{item.price}đ</div>
          </div>
        ));
      }
    }
    
    return <div className="no-items">Không có thông tin sản phẩm</div>;
  };

  return (
    <div className="orders-container">
      <h1>Quản lý đơn hàng</h1>
      
      {updateSuccess && (
        <div className="update-success-message">
          {updateSuccess}
        </div>
      )}
      
      <div className="orders-filters">
        <button 
          className={filter === 'all' ? 'active' : ''} 
          onClick={() => setFilter('all')}
        >
          Tất cả
        </button>
        <button 
          className={filter === 'pending' ? 'active' : ''} 
          onClick={() => setFilter('pending')}
        >
          Đang chờ
        </button>
        <button 
          className={filter === 'paid' ? 'active' : ''} 
          onClick={() => setFilter('paid')}
        >
          Đã thanh toán
        </button>
        <button 
          className={filter === 'shipping' ? 'active' : ''} 
          onClick={() => setFilter('shipping')}
        >
          Đang giao
        </button>
        <button 
          className={filter === 'delivered' ? 'active' : ''} 
          onClick={() => setFilter('delivered')}
        >
          Đã giao
        </button>
        <button 
          className={filter === 'cancelled' ? 'active' : ''} 
          onClick={() => setFilter('cancelled')}
        >
          Đã hủy
        </button>
      </div>

      <div className="orders-count">
        Tổng số đơn hàng: <span>{filteredOrders.length}</span>
      </div>
      
      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Mã đơn hàng</th>
              <th>Ngày đặt</th>
              <th>Khách hàng</th>
              <th>Địa chỉ</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Thanh toán</th>
              <th>Thay đổi trạng thái</th>
              <th>Xóa</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr 
                  key={order._id} 
                  onClick={() => handleOrderClick(order)}
                  className={`order-row ${order.status === 'Đang chờ' ? 'pending' : 
                    order.status === 'Đã thanh toán' ? 'paid' : 
                    order.status === 'Đang giao' ? 'shipping' : 
                    order.status === 'Đã giao' ? 'delivered' : 'cancelled'}`}
                >
                  <td>#{order._id.substring(order._id.length - 8)}</td>
                  <td>{formatDate(order.date)}</td>
                  <td>
                    {order.address ? 
                      `${order.address.firstName} ${order.address.lastName}` : 
                      (order.userId && order.userId.name ? order.userId.name : 'Không xác định')}
                  </td>
                  <td>
                    {order.address ? 
                      `${order.address.city}, ${order.address.country}` : 
                      'Không có địa chỉ'}
                  </td>
                  <td className="order-amount">{order.amount}đ</td>
                  <td>
                    <span className={`status-badge ${
                      order.status === 'Đang chờ' ? 'pending' : 
                      order.status === 'Đã thanh toán' ? 'paid' : 
                      order.status === 'Đang giao' ? 'shipping' : 
                      order.status === 'Đã giao' ? 'delivered' : 'cancelled'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <span className={`payment-badge ${order.payment ? 'paid' : 'pending'}`}>
                      {order.payment ? 'Đã thanh toán' : 'Chưa thanh toán'}
                    </span>
                  </td>
                  <td 
                    className="order-actions" 
                    onClick={(e) => e.stopPropagation()} // Ngăn việc mở modal khi click vào dropdown
                  >
                    <select 
                      value={order.status}
                      onChange={(e) => {
                        // Cập nhật trạng thái thanh toán tự động dựa trên trạng thái đơn hàng
                        const newStatus = e.target.value;
                        const newPaymentStatus = 
                          newStatus === 'Đã thanh toán' || 
                          newStatus === 'Đang giao' || 
                          newStatus === 'Đã giao' 
                            ? true 
                            : order.payment;
                        
                        updateOrderStatus(order._id, newStatus, newPaymentStatus);
                      }}
                      disabled={updateLoading}
                      className="status-select"
                    >
                      {orderStatuses.map(status => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td 
                    className="order-actions delete-action" 
                    onClick={(e) => e.stopPropagation()}
                  >
                    {deleteConfirm === order._id ? (
                      <div className="delete-confirm">
                        <button 
                          onClick={() => deleteOrder(order._id)} 
                          className="confirm-delete-btn"
                          disabled={updateLoading}
                        >
                          Xác nhận
                        </button>
                        <button 
                          onClick={cancelDelete} 
                          className="cancel-delete-btn"
                          disabled={updateLoading}
                        >
                          Hủy
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => confirmDelete(order._id)} 
                        className="delete-btn"
                        disabled={updateLoading}
                      >
                        Xóa
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="no-orders">Không có đơn hàng nào</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal chi tiết đơn hàng */}
      {selectedOrder && (
        <div className="order-detail-modal">
          <div className="order-detail-content">
            <button className="close-button" onClick={closeOrderDetails}>&times;</button>
            
            <h2>Chi tiết đơn hàng #{selectedOrder._id.substring(selectedOrder._id.length - 8)}</h2>
            
            <div className="order-detail-section">
              <h3>Thông tin đơn hàng</h3>
              <div className="detail-row">
                <span className="label">Mã đơn hàng:</span>
                <span className="value">{selectedOrder._id}</span>
              </div>
              <div className="detail-row">
                <span className="label">Ngày đặt:</span>
                <span className="value">{formatDate(selectedOrder.date)}</span>
              </div>
              <div className="detail-row">
                <span className="label">Trạng thái:</span>
                <div className="value status-select-container">
                  <select 
                    value={selectedOrder.status}
                    onChange={(e) => {
                      const newStatus = e.target.value;
                      const newPaymentStatus = 
                        newStatus === 'Đã thanh toán' || 
                        newStatus === 'Đang giao' || 
                        newStatus === 'Đã giao' 
                          ? true 
                          : selectedOrder.payment;
                      
                      updateOrderStatus(selectedOrder._id, newStatus, newPaymentStatus);
                    }}
                    disabled={updateLoading}
                    className="status-select modal-select"
                  >
                    {orderStatuses.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="detail-row">
                <span className="label">Thanh toán:</span>
                <div className="value payment-select-container">
                  <select 
                    value={selectedOrder.payment ? "true" : "false"}
                    onChange={(e) => {
                      const newPaymentStatus = e.target.value === "true";
                      updateOrderStatus(selectedOrder._id, selectedOrder.status, newPaymentStatus);
                    }}
                    disabled={updateLoading}
                    className="payment-select modal-select"
                  >
                    <option value="true">Đã thanh toán</option>
                    <option value="false">Chưa thanh toán</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="order-detail-section">
              <h3>Thông tin khách hàng</h3>
              {selectedOrder.address ? (
                <>
                  <div className="detail-row">
                    <span className="label">Họ tên:</span>
                    <span className="value">{selectedOrder.address.firstName} {selectedOrder.address.lastName}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Email:</span>
                    <span className="value">{selectedOrder.address.email}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Số điện thoại:</span>
                    <span className="value">{selectedOrder.address.phone}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Địa chỉ:</span>
                    <span className="value">
                      {selectedOrder.address.address}, {selectedOrder.address.city}, {selectedOrder.address.state}, {selectedOrder.address.country}, {selectedOrder.address.zip}
                    </span>
                  </div>
                </>
              ) : (
                <div className="detail-row">
                  <span className="value">Không có thông tin khách hàng</span>
                </div>
              )}
            </div>
            
            <div className="order-detail-section">
              <h3>Sản phẩm đặt hàng</h3>
              <div className="order-items-list">
                {renderItems(selectedOrder.items)}
              </div>
            </div>
            
            <div className="order-detail-total">
              <div className="detail-row">
                <span className="label">Tổng tiền:</span>
                <span className="value total-amount">{selectedOrder.amount}đ</span>
              </div>
            </div>
            
            <div className="order-detail-actions">
              {deleteConfirm === selectedOrder._id ? (
                <div className="delete-confirm modal-delete-confirm">
                  <p>Bạn có chắc chắn muốn xóa đơn hàng này?</p>
                  <div className="delete-confirm-buttons">
                    <button 
                      onClick={() => deleteOrder(selectedOrder._id)} 
                      className="confirm-delete-btn"
                      disabled={updateLoading}
                    >
                      Xác nhận xóa
                    </button>
                    <button 
                      onClick={cancelDelete} 
                      className="cancel-delete-btn"
                      disabled={updateLoading}
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => confirmDelete(selectedOrder._id)} 
                  className="delete-btn modal-delete-btn"
                  disabled={updateLoading}
                >
                  Xóa đơn hàng
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
