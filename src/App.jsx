import React from 'react'
import Navbar from './components/Navbar/Navbar'
import Sidebar from './components/Sidebar/Sidebar'
import { Route, Routes } from 'react-router-dom'
import Add from './pages/Add/Add'
import List from './pages/List/List'
import Orders from './pages/Orders/Orders'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './App.css'

const App = () => {
  const url = "http://localhost:5000"

  return (
    <div className="app">
      <ToastContainer />
      <Navbar />
      <div className="app-content">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/add" element={<Add url={url}/>}></Route>
            <Route path="/list" element={<List url={url}/>}></Route>
            <Route path="/orders" element={<Orders url={url}/>}></Route>
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App
