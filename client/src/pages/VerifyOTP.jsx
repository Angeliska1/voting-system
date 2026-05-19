import { useState, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function VerifyOTP() {
  const [otp, setOtp] = useState(['','','','','',''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const refs = useRef([])
  const location = useLocation()
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const { userId, email } = location.state || {}

  if (!userId) { navigate('/login'); return null }

  const handleChange = (i, val) => {
    if (!/^\d*$/.test(val)) return
    const next = [...otp]; next[i] = val.slice(-1); setOtp(next)
    if (val && i < 5) refs.current[i+1]?.focus()
  }
  const handleKeyDown = (i, e) => { if (e.key==='Backspace' && !otp[i] && i>0) refs.current[i-1]?.focus() }

  const submit = async (e) => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length !== 6) return setError('Please enter the complete 6-digit code.')
    setLoading(true); setError('')
    try {
      const { data } = await api.post('/auth/verify-otp', { userId, otp: code })
      localStorage.setItem('voteNgToken', data.token)
      localStorage.setItem('voteNgUser', JSON.stringify(data.user))
      setUser(data.user)
      toast.success('Account verified! Welcome to VoteNG 🎉')
      navigate('/elections')
    } catch (err) { setError(err.response?.data?.message || 'Verification failed.') }
    finally { setLoading(false) }
  }

  const resend = async () => {
    try { await api.post('/auth/resend-otp', { userId }); toast.success('New OTP sent!') }
    catch { toast.error('Could not resend OTP.') }
  }

  return (
    <div className="auth-page">
      <div className="auth-card" style={{textAlign:'center'}}>
        <div style={{fontSize:48,marginBottom:16}}>📧</div>
        <h2>Verify your account</h2>
        <p>We sent a 6-digit code to <strong>{email || 'your email'}</strong></p>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={submit}>
          <div className="otp-inputs">
            {otp.map((d,i) => (
              <input key={i} ref={el => refs.current[i]=el} className="otp-input form-control"
                value={d} onChange={e => handleChange(i,e.target.value)}
                onKeyDown={e => handleKeyDown(i,e)} maxLength={1} inputMode="numeric"
                style={{padding:0,textAlign:'center'}}/>
            ))}
          </div>
          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify Account'}
          </button>
        </form>
        <p style={{marginTop:20,fontSize:14,color:'var(--gray-500)'}}>
          Didn't receive the code?{' '}
          <button onClick={resend} style={{background:'none',border:'none',color:'var(--green-dark)',fontWeight:600,cursor:'pointer',fontSize:14}}>
            Resend OTP
          </button>
        </p>
      </div>
    </div>
  )
}
