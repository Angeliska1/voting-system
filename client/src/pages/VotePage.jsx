import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function VotePage() {
  const { electionId } = useParams()
  const navigate = useNavigate()
  const { refreshUser } = useAuth()
  const [election, setElection] = useState(null)
  const [candidates, setCandidates] = useState([])
  const [selections, setSelections] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const [elecRes, voteRes] = await Promise.all([
          api.get(`/elections/${electionId}`),
          api.get(`/votes/check/${electionId}`),
        ])
        setElection(elecRes.data.election)
        setCandidates(elecRes.data.candidates)
        setHasVoted(voteRes.data.hasVoted)
      } catch { toast.error('Could not load election.'); navigate('/elections') }
      finally { setLoading(false) }
    }
    load()
  }, [electionId, navigate])

  const byPosition = (pos) => candidates.filter(c => c.position === pos)
  const select = (position, candidateId) => setSelections(prev => ({ ...prev, [position]: candidateId }))
  const allSelected = election?.positions?.every(p => selections[p])

  const submit = async () => {
    if (!allSelected) return toast.error('Please select a candidate for every position.')
    setSubmitting(true)
    try {
      const votes = Object.entries(selections).map(([position, candidateId]) => ({ candidateId, position }))
      await api.post('/votes/cast', { electionId, votes })
      await refreshUser()
      toast.success('🎉 Your vote has been recorded!')
      navigate(`/results/${electionId}`)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to submit vote.') }
    finally { setSubmitting(false) }
  }

  if (loading) return <div className="page"><div className="spinner"/></div>
  if (!election) return null

  if (hasVoted) return (
    <div className="page"><div className="container" style={{maxWidth:560,textAlign:'center',paddingTop:60}}>
      <div style={{fontSize:64,marginBottom:16}}>✅</div>
      <h2>You have already voted</h2>
      <p style={{color:'var(--gray-500)',margin:'12px 0 24px'}}>Each voter may only vote once per election.</p>
      <button onClick={() => navigate(`/results/${electionId}`)} className="btn btn-primary">View Results</button>
    </div></div>
  )

  if (election.status !== 'active') return (
    <div className="page"><div className="container" style={{maxWidth:560,textAlign:'center',paddingTop:60}}>
      <div style={{fontSize:64,marginBottom:16}}>🔒</div>
      <h2>Election is {election.status}</h2>
      <button onClick={() => navigate('/elections')} className="btn btn-secondary" style={{marginTop:16}}>Back to Elections</button>
    </div></div>
  )

  return (
    <div className="page">
      <div className="container" style={{maxWidth:700}}>
        <div style={{marginBottom:28}}>
          <h1 style={{fontSize:24,fontWeight:700}}>{election.title}</h1>
          <p style={{color:'var(--gray-500)',marginTop:4}}>Select one candidate per position. You can only vote once.</p>
          <div className="alert alert-info" style={{marginTop:12}}>🔒 Your vote is anonymous. We only record that you voted, not who you voted for.</div>
        </div>
        <div style={{display:'flex',gap:8,marginBottom:24,flexWrap:'wrap'}}>
          {election.positions?.map(p => (
            <div key={p} style={{display:'flex',alignItems:'center',gap:6,padding:'6px 12px',borderRadius:20,background:selections[p]?'var(--green-light)':'var(--gray-100)',color:selections[p]?'var(--green-dark)':'var(--gray-500)',fontSize:13,fontWeight:600}}>
              {selections[p]?'✓':'○'} {p}
            </div>
          ))}
        </div>
        {election.positions?.map(position => (
          <div key={position} style={{marginBottom:32}}>
            <h3 style={{fontWeight:700,fontSize:18,marginBottom:12,paddingBottom:8,borderBottom:'2px solid var(--gray-100)'}}>{position}</h3>
            <div style={{display:'grid',gap:10}}>
              {byPosition(position).map(c => (
                <div key={c._id} className={`candidate-card${selections[position]===c._id?' selected':''}`} onClick={() => select(position,c._id)}>
                  <img src={c.image||`https://ui-avatars.com/api/?name=${encodeURIComponent(c.fullName)}&background=00563B&color=fff`} alt={c.fullName} className="candidate-avatar"/>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:16}}>{c.fullName}</div>
                    <div style={{fontSize:13,color:'var(--gray-500)'}}>🏛️ {c.party}</div>
                    {c.bio && <div style={{fontSize:13,color:'var(--gray-500)',marginTop:4}}>{c.bio}</div>}
                  </div>
                  <div style={{width:24,height:24,borderRadius:'50%',border:`2px solid ${selections[position]===c._id?'var(--green-dark)':'var(--gray-300)'}`,background:selections[position]===c._id?'var(--green-dark)':'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    {selections[position]===c._id && <span style={{color:'#fff',fontSize:14}}>✓</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {!confirmed ? (
          <button className="btn btn-primary btn-lg btn-block" disabled={!allSelected} onClick={() => setConfirmed(true)}>Review & Submit Vote</button>
        ) : (
          <div className="card" style={{border:'2px solid var(--green-dark)'}}>
            <h3 style={{marginBottom:16}}>✅ Confirm your selections</h3>
            {Object.entries(selections).map(([pos,cid]) => {
              const c = candidates.find(x => x._id===cid)
              return c ? <div key={pos} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid var(--gray-100)'}}>
                <span style={{color:'var(--gray-500)'}}>{pos}</span>
                <strong>{c.fullName} — {c.party}</strong>
              </div> : null
            })}
            <p style={{fontSize:13,color:'var(--red)',marginTop:12}}>⚠️ Once submitted, your vote cannot be changed.</p>
            <div style={{display:'flex',gap:10,marginTop:16}}>
              <button className="btn btn-secondary" onClick={() => setConfirmed(false)}>Go back</button>
              <button className="btn btn-primary" style={{flex:1}} disabled={submitting} onClick={submit}>
                {submitting ? 'Submitting...' : '🗳️ Submit my vote'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
