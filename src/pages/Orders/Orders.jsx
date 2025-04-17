import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Order.css';

const Orders = ({ url }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'paid', 'shipping', 'delivered', 'cancelled'
  
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
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-orders">Không có đơn hàng nào</td>
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
                <span className={`value status-badge ${
                  selectedOrder.status === 'Đang chờ' ? 'pending' : 
                  selectedOrder.status === 'Đã thanh toán' ? 'paid' : 
                  selectedOrder.status === 'Đang giao' ? 'shipping' : 
                  selectedOrder.status === 'Đã giao' ? 'delivered' : 'cancelled'
                }`}>
                  {selectedOrder.status}
                </span>
              </div>
              <div className="detail-row">
                <span className="label">Thanh toán:</span>
                <span className={`value payment-badge ${selectedOrder.payment ? 'paid' : 'pending'}`}>
                  {selectedOrder.payment ? 'Đã thanh toán' : 'Chưa thanh toán'}
                </span>
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
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
