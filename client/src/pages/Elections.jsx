import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function Elections() {
  const [elections, setElections] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    api.get('/elections').then(({ data }) => { setElections(data.elections); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const hasVoted = (id) => user?.votedElections?.includes(id)

  if (loading) return <div className="page"><div className="spinner"/></div>

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>Elections</h1>
            <p style={{color:'var(--gray-500)',marginTop:4}}>Select an election to view details or cast your vote</p>
          </div>
        </div>
        {elections.length === 0 && (
          <div className="card" style={{textAlign:'center',padding:60}}>
            <div style={{fontSize:48,marginBottom:16}}>🗳️</div>
            <h3 style={{marginBottom:8}}>No elections available</h3>
            <p style={{color:'var(--gray-500)'}}>Check back later for upcoming elections.</p>
          </div>
        )}
        <div style={{display:'grid',gap:16}}>
          {elections.map(e => (
            <div key={e._id} className="card" style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:16}}>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:6}}>
                  <h3 style={{fontWeight:700,fontSize:18}}>{e.title}</h3>
                  <span className={`badge badge-${e.status}`}>{e.status}</span>
                  {hasVoted(e._id) && <span className="badge" style={{background:'#dbeafe',color:'#1d4ed8'}}>✓ Voted</span>}
                </div>
                <p style={{color:'var(--gray-500)',fontSize:14,marginBottom:6}}>{e.description}</p>
                <p style={{fontSize:13,color:'var(--gray-500)'}}>
                  📅 {new Date(e.startDate).toLocaleDateString('en-NG',{dateStyle:'medium'})} — {new Date(e.endDate).toLocaleDateString('en-NG',{dateStyle:'medium'})}
                  &nbsp;·&nbsp; 🗳️ {e.totalVotesCast} vote{e.totalVotesCast!==1?'s':''} cast
                </p>
                <div style={{marginTop:8,display:'flex',flexWrap:'wrap',gap:6}}>
                  {e.positions?.map(p => <span key={p} style={{background:'var(--gray-100)',color:'var(--gray-700)',padding:'3px 10px',borderRadius:20,fontSize:12}}>{p}</span>)}
                </div>
              </div>
              <div style={{display:'flex',gap:8,flexShrink:0}}>
                <Link to={`/results/${e._id}`} className="btn btn-secondary btn-sm">Results</Link>
                {e.status==='active' && !hasVoted(e._id) && <Link to={`/vote/${e._id}`} className="btn btn-primary btn-sm">Vote Now →</Link>}
                {hasVoted(e._id) && <span className="btn btn-sm" style={{background:'var(--green-light)',color:'var(--green-dark)',cursor:'default'}}>✓ Voted</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
