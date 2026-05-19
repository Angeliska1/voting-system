import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const handleLogout = () => { logout(); navigate('/') }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <span>🗳️</span> VoteNG
      </Link>
      <div className="navbar-links">
        {!user && <>
          <Link to="/elections">Elections</Link>
          <Link to="/login">Login</Link>
          <Link to="/register" style={{border:'1px solid rgba(255,255,255,0.5)',borderRadius:8,padding:'8px 14px',color:'#fff',textDecoration:'none'}}>Register</Link>
        </>}
        {user?.role === 'voter' && <>
          <Link to="/elections">Elections</Link>
          <span style={{color:'rgba(255,255,255,0.7)',fontSize:14}}>Hi, {user.fullName.split(' ')[0]}</span>
          <button onClick={handleLogout}>Logout</button>
        </>}
        {user?.role === 'admin' && <>
          <Link to="/admin">Admin Panel</Link>
          <Link to="/elections">Elections</Link>
          <span style={{color:'rgba(255,255,255,0.7)',fontSize:14}}>Admin</span>
          <button onClick={handleLogout}>Logout</button>
        </>}
      </div>
    </nav>
  )
}
