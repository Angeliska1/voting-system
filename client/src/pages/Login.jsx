import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const data = await login(form.email, form.password)
      toast.success(`Welcome back, ${data.user.fullName.split(' ')[0]}!`)
      navigate(data.user.role === 'admin' ? '/admin' : '/elections')
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed'
      if (err.response?.data?.userId) {
        navigate('/verify-otp', { state: { userId: err.response.data.userId } })
      } else { setError(msg) }
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo"><span>🗳️</span><strong>VoteNG</strong></div>
        <h2>Welcome back</h2>
        <p>Sign in to access your voter account</p>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input name="email" type="email" className="form-control" value={form.email} onChange={handle} required placeholder="you@email.com"/>
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input name="password" type="password" className="form-control" value={form.password} onChange={handle} required placeholder="••••••••"/>
          </div>
          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p style={{textAlign:'center',marginTop:20,fontSize:14,color:'var(--gray-500)'}}>
          Don't have an account? <Link to="/register" style={{color:'var(--green-dark)',fontWeight:600}}>Register here</Link>
        </p>
        <div style={{marginTop:16,padding:12,background:'var(--gray-50)',borderRadius:8,fontSize:12,color:'var(--gray-500)'}}>
          <strong>Demo credentials:</strong><br/>
          Admin: admin@voteng.gov.ng / Admin@1234<br/>
          Voter: emeka@email.com / Voter@1234
        </div>
      </div>
    </div>
  )
}
