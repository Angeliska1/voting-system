import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import api from '../api/axios'

const COLORS = ['#00563B','#1a7a54','#22c55e','#4ade80','#86efac']

export default function Results() {
  const { electionId } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    let cancelled = false

    const fetchResults = async () => {
      try {
        const { data: res } = await api.get(`/votes/results/${electionId}`)
        if (!cancelled) setData(res)
      } catch {
        if (!cancelled) setError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchResults()
    intervalRef.current = setInterval(fetchResults, 10000)

    return () => {
      cancelled = true
      clearInterval(intervalRef.current)
    }
  }, [electionId])

  if (loading) return <div className="page"><div className="spinner"/></div>

  if (error) return (
    <div className="page">
      <div className="container" style={{maxWidth:560,textAlign:'center',paddingTop:60}}>
        <div style={{fontSize:48,marginBottom:16}}>⚠️</div>
        <h2>Could not load results</h2>
        <p style={{color:'var(--gray-500)',margin:'12px 0 24px'}}>The election may not exist or there was a network error.</p>
        <button onClick={() => navigate('/elections')} className="btn btn-secondary">← Back to Elections</button>
      </div>
    </div>
  )

  if (!data) return null

  const { election, results, blockchain } = data

  return (
    <div className="page">
      <div className="container" style={{maxWidth:800}}>
        <div className="page-header">
          <div>
            <h1>{election.title}</h1>
            <div style={{display:'flex',alignItems:'center',gap:10,marginTop:6,flexWrap:'wrap'}}>
              <span className={`badge badge-${election.status}`}>{election.status}</span>
              <span style={{fontSize:14,color:'var(--gray-500)'}}>
                🗳️ {election.totalVotesCast} total votes cast
              </span>
              {election.status === 'active' && (
                <span style={{fontSize:12,color:'var(--green-dark)',fontWeight:600}}>● Updating live</span>
              )}
            </div>
          </div>
          <button onClick={() => navigate('/elections')} className="btn btn-secondary btn-sm">← Back</button>
        </div>

        {/* Blockchain integrity badge */}
        {blockchain && (
          <div style={{
            display:'flex', alignItems:'center', gap:12, padding:'12px 16px',
            borderRadius:10, marginBottom:20,
            background: blockchain.valid ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${blockchain.valid ? '#bbf7d0' : '#fecaca'}`,
          }}>
            <span style={{fontSize:24}}>{blockchain.valid ? '🔗' : '⚠️'}</span>
            <div>
              <div style={{fontWeight:700,fontSize:14,color:blockchain.valid?'#15803d':'#dc2626'}}>
                {blockchain.valid ? 'Blockchain Integrity: VERIFIED' : 'Blockchain Integrity: COMPROMISED'}
              </div>
              <div style={{fontSize:12,color:'var(--gray-500)'}}>
                {blockchain.valid
                  ? `${blockchain.totalBlocks} blocks in chain — all hashes valid, no tampering detected`
                  : `Chain broken at block ${blockchain.brokenAt}: ${blockchain.reason}`}
              </div>
            </div>
          </div>
        )}

        {Object.keys(results).length === 0 && (
          <div className="card" style={{textAlign:'center',padding:60}}>
            <div style={{fontSize:48,marginBottom:12}}>📊</div>
            <h3>No votes yet</h3>
            <p style={{color:'var(--gray-500)'}}>Results will appear here once voting begins.</p>
          </div>
        )}

        {Object.entries(results).map(([position, candidates]) => {
          const total = candidates.reduce((s, c) => s + c.voteCount, 0)
          const chartData = candidates.map(c => ({
            name: c.fullName.split(' ')[0],
            votes: c.voteCount,
            full: c.fullName,
          }))

          return (
            <div key={position} className="card" style={{marginBottom:24}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
                <h3 style={{fontWeight:700,fontSize:18}}>{position}</h3>
                <span style={{fontSize:13,color:'var(--gray-500)'}}>{total} vote{total!==1?'s':''}</span>
              </div>

              {total > 0 && (
                <div style={{marginBottom:20}}>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={chartData} margin={{top:0,right:0,left:-20,bottom:0}}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                      <XAxis dataKey="name" tick={{fontSize:12}}/>
                      <YAxis allowDecimals={false} tick={{fontSize:12}}/>
                      <Tooltip formatter={(val,_,props) => [`${val} votes`, props.payload.full]}/>
                      <Bar dataKey="votes" radius={[4,4,0,0]}>
                        {chartData.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div style={{display:'grid',gap:10}}>
                {candidates.map((c, i) => {
                  const pct = total ? Math.round((c.voteCount / total) * 100) : 0
                  return (
                    <div key={c._id}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                        <div style={{display:'flex',alignItems:'center',gap:10}}>
                          <img
                            src={c.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.fullName)}&background=00563B&color=fff`}
                            alt={c.fullName}
                            style={{width:36,height:36,borderRadius:'50%'}}
                          />
                          <div>
                            <div style={{fontWeight:600,fontSize:14}}>{c.fullName}</div>
                            <div style={{fontSize:12,color:'var(--gray-500)'}}>{c.party}</div>
                          </div>
                          {i === 0 && total > 0 && (
                            <span style={{background:'#fef9c3',color:'#854d0e',padding:'2px 8px',borderRadius:12,fontSize:12,fontWeight:600}}>
                              🥇 Leading
                            </span>
                          )}
                        </div>
                        <div style={{textAlign:'right'}}>
                          <div style={{fontWeight:700,fontSize:16}}>{c.voteCount}</div>
                          <div style={{fontSize:12,color:'var(--gray-500)'}}>{pct}%</div>
                        </div>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{width:`${pct}%`,background:COLORS[i%COLORS.length]}}/>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

        <div style={{padding:'12px 16px',background:'var(--gray-50)',borderRadius:10,fontSize:12,color:'var(--gray-500)',border:'1px solid var(--gray-200)'}}>
          🔒 <strong>How votes are secured:</strong> Each vote is anonymised with SHA-256 hashing and added as a block to an immutable hash chain. Any attempt to alter vote data breaks the chain and is immediately detectable.
        </div>
      </div>
    </div>
  )
}
