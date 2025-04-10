import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Sidebar.css'
import { FaHome, FaList, FaPlus, FaShoppingCart, FaUser, FaBars, FaTimes } from 'react-icons/fa'

const Sidebar = () => {
    const [isActive, setIsActive] = useState(false)
    const location = useLocation()

    const toggleSidebar = () => {
        setIsActive(!isActive)
    }

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 1024) {
                setIsActive(false)
            }
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const menuItems = [
        { path: '/', icon: <FaHome />, label: 'Dashboard' },
        { path: '/list', icon: <FaList />, label: 'Danh sách' },
        { path: '/add', icon: <FaPlus />, label: 'Thêm mới' },
        { path: '/orders', icon: <FaShoppingCart />, label: 'Đơn hàng' }
    ]

    return (
        <>
            <button className="sidebar-toggle" onClick={toggleSidebar}>
                {isActive ? <FaTimes /> : <FaBars />}
            </button>
            <div className={`sidebar ${isActive ? 'active' : ''}`}>
                <div className="sidebar-header">
                    <h2>Admin Panel</h2>
                </div>
                <div className="sidebar-options">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`sidebar-option ${location.pathname === item.path ? 'active' : ''}`}
                            onClick={() => window.innerWidth <= 1024 && setIsActive(false)}
                        >
                            {item.icon}
                            <p>{item.label}</p>
                        </Link>
                    ))}
                </div>
                <div className="sidebar-footer">
                    <div className="profile">
                        <img src="https://via.placeholder.com/40" alt="Profile" />
                        <div className="profile-info">
                            <span className="profile-name">Admin</span>
                            <span className="profile-role">Quản trị viên</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Sidebar
