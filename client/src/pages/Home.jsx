import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { user } = useAuth()
  return (
    <div>
      <div className="hero" style={{paddingTop:120}}>
        <div style={{fontSize:60,marginBottom:16}}>🗳️</div>
        <h1>Nigeria's Digital Voting Platform</h1>
        <p>Secure, transparent, and accessible elections powered by technology. Every vote counts.</p>
        <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
          {!user && <>
            <Link to="/register" className="btn btn-lg" style={{background:'#fff',color:'var(--green-dark)'}}>Register to Vote</Link>
            <Link to="/login" className="btn btn-lg" style={{background:'rgba(255,255,255,0.15)',color:'#fff',border:'1px solid rgba(255,255,255,0.4)'}}>Login</Link>
          </>}
          {user && <Link to="/elections" className="btn btn-lg" style={{background:'#fff',color:'var(--green-dark)'}}>View Elections</Link>}
        </div>
      </div>
      <div className="container" style={{padding:'60px 20px'}}>
        <h2 style={{textAlign:'center',fontSize:28,fontWeight:700,marginBottom:8}}>Why VoteNG?</h2>
        <p style={{textAlign:'center',color:'var(--gray-500)',marginBottom:40}}>Built with Nigeria's democratic values at its core</p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:24}}>
          {[
            {icon:'🔒',title:'Bank-Level Security',desc:'JWT authentication, OTP verification, and encrypted data protect every vote.'},
            {icon:'✅',title:'One Voter, One Vote',desc:'NIN and Voter Card verification ensure no duplicate voting, ever.'},
            {icon:'📊',title:'Live Results',desc:'Real-time election results as votes come in.'},
            {icon:'📋',title:'Full Audit Trail',desc:'Every action is logged for complete transparency and accountability.'},
          ].map(f => (
            <div key={f.title} className="card" style={{textAlign:'center'}}>
              <div style={{fontSize:40,marginBottom:12}}>{f.icon}</div>
              <h3 style={{fontWeight:700,marginBottom:8}}>{f.title}</h3>
              <p style={{color:'var(--gray-500)',fontSize:14}}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <div style={{background:'var(--green-dark)',color:'#fff',textAlign:'center',padding:'20px',fontSize:13,opacity:0.9}}>
        VoteNG — Final Year Project © {new Date().getFullYear()}. Built with React + Vite, Node.js & MongoDB.
      </div>
    </div>
  )
}
