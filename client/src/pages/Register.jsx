import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../api/axios'

const STATES = ['Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno','Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara']

export default function Register() {
  const [form, setForm] = useState({ fullName:'',email:'',phone:'',nin:'',voterCardNumber:'',password:'',confirmPassword:'',state:'',lga:'' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault(); setError('')
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.')
    if (form.nin.length !== 11) return setError('NIN must be exactly 11 digits.')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/register', form)
      toast.success('Registration successful! Check your email for the OTP.')
      navigate('/verify-otp', { state: { userId: data.userId, email: form.email } })
    } catch (err) { setError(err.response?.data?.message || 'Registration failed.') }
    finally { setLoading(false) }
  }

  return (
    <div className="auth-page" style={{paddingTop:80,paddingBottom:40,alignItems:'flex-start'}}>
      <div className="auth-card" style={{maxWidth:520,margin:'0 auto'}}>
        <div className="auth-logo"><span>🗳️</span><strong>VoteNG</strong></div>
        <h2>Create your voter account</h2>
        <p>You'll need your NIN and Voter Card Number to register</p>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Full name (as on voter card)</label>
            <input name="fullName" className="form-control" value={form.fullName} onChange={handle} required placeholder="e.g. Chukwuemeka Obi"/>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input name="email" type="email" className="form-control" value={form.email} onChange={handle} required/>
            </div>
            <div className="form-group">
              <label className="form-label">Phone number</label>
              <input name="phone" className="form-control" value={form.phone} onChange={handle} required placeholder="08012345678"/>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">NIN (11 digits)</label>
              <input name="nin" className="form-control" value={form.nin} onChange={handle} required maxLength={11} placeholder="12345678901"/>
            </div>
            <div className="form-group">
              <label className="form-label">Voter Card Number</label>
              <input name="voterCardNumber" className="form-control" value={form.voterCardNumber} onChange={handle} required placeholder="NG-LAG-001-2024"/>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">State</label>
              <select name="state" className="form-control" value={form.state} onChange={handle} required>
                <option value="">Select state</option>
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">LGA</label>
              <input name="lga" className="form-control" value={form.lga} onChange={handle} placeholder="Local Government Area"/>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Password</label>
              <input name="password" type="password" className="form-control" value={form.password} onChange={handle} required placeholder="Min 6 characters"/>
            </div>
            <div className="form-group">
              <label className="form-label">Confirm password</label>
              <input name="confirmPassword" type="password" className="form-control" value={form.confirmPassword} onChange={handle} required/>
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p style={{textAlign:'center',marginTop:20,fontSize:14,color:'var(--gray-500)'}}>
          Already registered? <Link to="/login" style={{color:'var(--green-dark)',fontWeight:600}}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
