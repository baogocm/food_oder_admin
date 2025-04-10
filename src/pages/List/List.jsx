import React, { useEffect, useState } from 'react';
import './List.css';
import axios from 'axios';
import { toast } from 'react-toastify';

const List = () => {
  const [list, setList] = useState([]);
  const url = "https://food-order-backend-5afp.onrender.com";
  const fetchList = async () => {
    try {
      const response = await axios.get(`${url}/api/food/list`);
      if (response.data.success) {
        setList(response.data.data);
      } else {
        toast.error(response.data.message || "Lỗi khi lấy danh sách món ăn");
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách:", error);
      toast.error("Đã xảy ra lỗi khi lấy danh sách.");
    }
  };

  const removeFood = async (foodId) => {
    try {
      const response = await axios.post(`${url}/api/food/remove`, { id: foodId });
      if (response.data.success) {
        toast.success(response.data.message || "Đã xóa món ăn thành công!");
        await fetchList();
      } else {
        toast.error(response.data.message || "Lỗi khi xóa món ăn");
      }
    } catch (error) {
      console.error("Lỗi khi xóa món ăn:", error);
      toast.error("Đã xảy ra lỗi khi xóa mục.");
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <div className='list add flex-col'>
      <p>Danh Sách Tất Cả Món Ăn</p>
      <div className="list-table">
        <div className="list-table-format title">
          <b>Hình Ảnh</b>
          <b>Tên</b>
          <b>Danh Mục</b>
          <b>Giá</b>
          <b>Hành Động</b>
        </div>
        {list.length > 0 ? (
          list.map((item, index) => (
            <div key={index} className='list-table-format'>
              <img src={`${url}/images/${item.image}`} alt={item.name} />
              <p>{item.name}</p>
              <p>{item.category}</p>
              <p>${item.price}</p>
              <p onClick={() => removeFood(item._id)} className='cursor'>X</p>
            </div>
          ))
        ) : (
          <p>Không có món ăn nào.</p>
        )}
      </div>
    </div>
  );
};

export default List;
