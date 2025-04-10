import React, { useState } from 'react'
import './Navbar.css'
import { FaSearch, FaBell, FaBars } from 'react-icons/fa'
import { assets } from '../../assets/assets'

const Navbar = () => {
    const [searchQuery, setSearchQuery] = useState('')
    const [notifications, setNotifications] = useState(3)

    const handleSearch = (e) => {
        e.preventDefault()
        // Handle search functionality
        console.log('Searching for:', searchQuery)
    }

    return (
        <div className="navbar">
            <div className="navbar-left">
                <button className="navbar-mobile-menu">
                    <FaBars />
                </button>
                <a href="/" className="logo">Admin</a>
            </div>
            <div className="navbar-right">
                <div className="navbar-notifications">
                    <FaBell />
                    {notifications > 0 && (
                        <span className="badge">{notifications}</span>
                    )}
                </div>
                <div className="navbar-profile">
                    <img src={assets.profile_image} alt="Profile" />
                    <div className="navbar-profile-info">
                        <span className="navbar-profile-name">Admin</span>

                    </div>
                </div>
            </div>
        </div>
    )
}

export default Navbar
