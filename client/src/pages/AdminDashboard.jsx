import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import api from '../api/axios'

const TABS = ['Dashboard','Elections','Candidates','Voters','Audit Logs']

export default function AdminDashboard() {
  const [tab, setTab] = useState('Dashboard')
  const [stats, setStats] = useState(null)
  const [elections, setElections] = useState([])
  const [candidates, setCandidates] = useState([])
  const [voters, setVoters] = useState([])
  const [logs, setLogs] = useState([])
  const [selectedElection, setSelectedElection] = useState('')
  const [showElectionModal, setShowElectionModal] = useState(false)
  const [showCandidateModal, setShowCandidateModal] = useState(false)
  const [eForm, setEForm] = useState({title:'',description:'',startDate:'',endDate:'',positions:''})
  const [cForm, setCForm] = useState({fullName:'',party:'',position:'',bio:'',image:''})

  const loadElections = async () => { const {data}=await api.get('/admin/elections'); setElections(data.elections) }
  useEffect(() => { api.get('/admin/dashboard').then(({data})=>setStats(data)); loadElections() }, [])
  useEffect(() => { if(tab==='Voters') api.get('/admin/voters').then(({data})=>setVoters(data.voters)) }, [tab])
  useEffect(() => { if(tab==='Audit Logs') api.get('/admin/audit-logs').then(({data})=>setLogs(data.logs)) }, [tab])
  useEffect(() => { if(selectedElection) api.get(`/admin/candidates/${selectedElection}`).then(({data})=>setCandidates(data.candidates)) }, [selectedElection])

  const createElection = async (e) => {
    e.preventDefault()
    try { await api.post('/admin/elections',eForm); toast.success('Election created!'); setShowElectionModal(false); setEForm({title:'',description:'',startDate:'',endDate:'',positions:''}); loadElections() }
    catch(err) { toast.error(err.response?.data?.message||'Error') }
  }
  const deleteElection = async (id) => {
    if(!window.confirm('Delete this election?')) return
    try { await api.delete(`/admin/elections/${id}`); toast.success('Deleted'); loadElections() }
    catch(err) { toast.error(err.response?.data?.message||'Error') }
  }
  const updateStatus = async (id,status) => {
    try { await api.put(`/admin/elections/${id}`,{status}); loadElections(); toast.success('Status updated') }
    catch(err) { toast.error(err.response?.data?.message||'Error') }
  }
  const addCandidate = async (e) => {
    e.preventDefault()
    try { await api.post('/admin/candidates',{...cForm,electionId:selectedElection}); toast.success('Candidate added!'); setShowCandidateModal(false); setCForm({fullName:'',party:'',position:'',bio:'',image:''}); api.get(`/admin/candidates/${selectedElection}`).then(({data})=>setCandidates(data.candidates)) }
    catch(err) { toast.error(err.response?.data?.message||'Error') }
  }
  const deleteCandidate = async (id) => {
    if(!window.confirm('Remove candidate?')) return
    try { await api.delete(`/admin/candidates/${id}`); toast.success('Removed'); api.get(`/admin/candidates/${selectedElection}`).then(({data})=>setCandidates(data.candidates)) }
    catch { toast.error('Error') }
  }

  const currentElection = elections.find(e=>e._id===selectedElection)

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <div><h1>Admin Dashboard</h1><p style={{color:'var(--gray-500)',marginTop:4}}>Manage elections, candidates, and voters</p></div>
        </div>
        <div className="tab-nav">{TABS.map(t=><button key={t} className={`tab-btn${tab===t?' active':''}`} onClick={()=>setTab(t)}>{t}</button>)}</div>

        {tab==='Dashboard' && stats && (<>
          <div className="stats-grid">
            {[{label:'Total Voters',num:stats.stats.totalVoters,icon:'👥'},{label:'Total Elections',num:stats.stats.totalElections,icon:'🗳️'},{label:'Active Elections',num:stats.stats.activeElections,icon:'✅'},{label:'Votes Cast',num:stats.stats.totalVotes,icon:'📊'}].map(s=>(
              <div key={s.label} className="stat-card"><div style={{fontSize:28,marginBottom:4}}>{s.icon}</div><div className="stat-num">{s.num}</div><div className="stat-label">{s.label}</div></div>
            ))}
          </div>
          <div className="card">
            <h3 style={{fontWeight:700,marginBottom:16}}>Recent Activity</h3>
            {stats.recentLogs?.map(log=>(
              <div key={log._id} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid var(--gray-100)',fontSize:14}}>
                <div><strong>{log.action}</strong><span style={{color:'var(--gray-500)',marginLeft:8}}>{log.details}</span></div>
                <span style={{color:'var(--gray-500)',fontSize:12}}>{new Date(log.createdAt).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </>)}

        {tab==='Elections' && (<>
          <div style={{display:'flex',justifyContent:'flex-end',marginBottom:16}}>
            <button className="btn btn-primary" onClick={()=>setShowElectionModal(true)}>+ New Election</button>
          </div>
          <div className="card"><div className="table-wrap"><table>
            <thead><tr><th>Title</th><th>Status</th><th>Start</th><th>End</th><th>Votes</th><th>Actions</th></tr></thead>
            <tbody>{elections.map(e=>(
              <tr key={e._id}>
                <td><strong>{e.title}</strong></td>
                <td><span className={`badge badge-${e.status}`}>{e.status}</span></td>
                <td style={{fontSize:13}}>{new Date(e.startDate).toLocaleDateString('en-NG')}</td>
                <td style={{fontSize:13}}>{new Date(e.endDate).toLocaleDateString('en-NG')}</td>
                <td>{e.totalVotesCast}</td>
                <td><div style={{display:'flex',gap:6}}>
                  {e.status==='upcoming'&&<button className="btn btn-sm btn-primary" onClick={()=>updateStatus(e._id,'active')}>Activate</button>}
                  {e.status==='active'&&<button className="btn btn-sm btn-secondary" onClick={()=>updateStatus(e._id,'closed')}>Close</button>}
                  <button className="btn btn-sm btn-danger" onClick={()=>deleteElection(e._id)}>Delete</button>
                </div></td>
              </tr>
            ))}</tbody>
          </table></div></div>
        </>)}

        {tab==='Candidates' && (<>
          <div style={{display:'flex',gap:12,marginBottom:16,flexWrap:'wrap',alignItems:'center'}}>
            <select className="form-control" style={{maxWidth:320}} value={selectedElection} onChange={e=>setSelectedElection(e.target.value)}>
              <option value="">Select election to manage candidates</option>
              {elections.map(e=><option key={e._id} value={e._id}>{e.title}</option>)}
            </select>
            {selectedElection&&<button className="btn btn-primary" onClick={()=>setShowCandidateModal(true)}>+ Add Candidate</button>}
          </div>
          {selectedElection&&<div className="card"><div className="table-wrap"><table>
            <thead><tr><th>Photo</th><th>Name</th><th>Party</th><th>Position</th><th>Votes</th><th>Actions</th></tr></thead>
            <tbody>{candidates.map(c=>(
              <tr key={c._id}>
                <td><img src={c.image||`https://ui-avatars.com/api/?name=${encodeURIComponent(c.fullName)}`} alt={c.fullName} style={{width:36,height:36,borderRadius:'50%'}}/></td>
                <td><strong>{c.fullName}</strong></td><td>{c.party}</td><td>{c.position}</td><td>{c.voteCount}</td>
                <td><button className="btn btn-sm btn-danger" onClick={()=>deleteCandidate(c._id)}>Remove</button></td>
              </tr>
            ))}{candidates.length===0&&<tr><td colSpan={6} style={{textAlign:'center',color:'var(--gray-500)',padding:24}}>No candidates yet</td></tr>}</tbody>
          </table></div></div>}
        </>)}

        {tab==='Voters' && <div className="card"><div className="table-wrap"><table>
          <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>State</th><th>Verified</th><th>Registered</th></tr></thead>
          <tbody>{voters.map(v=>(
            <tr key={v._id}><td><strong>{v.fullName}</strong></td><td>{v.email}</td><td>{v.phone}</td><td>{v.state}</td>
              <td>{v.isVerified?'✅':'❌'}</td><td style={{fontSize:12}}>{new Date(v.createdAt).toLocaleDateString('en-NG')}</td></tr>
          ))}</tbody>
        </table></div></div>}

        {tab==='Audit Logs' && <div className="card"><div className="table-wrap"><table>
          <thead><tr><th>Action</th><th>Performed By</th><th>Details</th><th>Time</th></tr></thead>
          <tbody>{logs.map(l=>(
            <tr key={l._id}>
              <td><span style={{fontFamily:'monospace',fontSize:12,background:'var(--gray-100)',padding:'2px 6px',borderRadius:4}}>{l.action}</span></td>
              <td>{l.performedBy?.fullName||'System'}</td><td style={{fontSize:13,color:'var(--gray-500)'}}>{l.details}</td>
              <td style={{fontSize:12,whiteSpace:'nowrap'}}>{new Date(l.createdAt).toLocaleString('en-NG')}</td>
            </tr>
          ))}</tbody>
        </table></div></div>}
      </div>

      {showElectionModal&&<div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setShowElectionModal(false)}>
        <div className="modal"><h3>Create New Election</h3>
          <form onSubmit={createElection}>
            <div className="form-group"><label className="form-label">Title</label><input className="form-control" value={eForm.title} onChange={e=>setEForm({...eForm,title:e.target.value})} required placeholder="e.g. 2024 Student Union Election"/></div>
            <div className="form-group"><label className="form-label">Description</label><textarea className="form-control" rows={2} value={eForm.description} onChange={e=>setEForm({...eForm,description:e.target.value})}/></div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Start date & time</label><input type="datetime-local" className="form-control" value={eForm.startDate} onChange={e=>setEForm({...eForm,startDate:e.target.value})} required/></div>
              <div className="form-group"><label className="form-label">End date & time</label><input type="datetime-local" className="form-control" value={eForm.endDate} onChange={e=>setEForm({...eForm,endDate:e.target.value})} required/></div>
            </div>
            <div className="form-group"><label className="form-label">Positions (comma-separated)</label><input className="form-control" value={eForm.positions} onChange={e=>setEForm({...eForm,positions:e.target.value})} required placeholder="President, Vice President, Secretary General"/></div>
            <div style={{display:'flex',gap:10,marginTop:8}}>
              <button type="button" className="btn btn-secondary" onClick={()=>setShowElectionModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" style={{flex:1}}>Create Election</button>
            </div>
          </form>
        </div>
      </div>}

      {showCandidateModal&&<div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setShowCandidateModal(false)}>
        <div className="modal"><h3>Add Candidate</h3>
          <form onSubmit={addCandidate}>
            <div className="form-group"><label className="form-label">Full name</label><input className="form-control" value={cForm.fullName} onChange={e=>setCForm({...cForm,fullName:e.target.value})} required/></div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Party / Group</label><input className="form-control" value={cForm.party} onChange={e=>setCForm({...cForm,party:e.target.value})} required/></div>
              <div className="form-group"><label className="form-label">Position</label>
                <select className="form-control" value={cForm.position} onChange={e=>setCForm({...cForm,position:e.target.value})} required>
                  <option value="">Select position</option>
                  {currentElection?.positions?.map(p=><option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group"><label className="form-label">Bio (optional)</label><textarea className="form-control" rows={2} value={cForm.bio} onChange={e=>setCForm({...cForm,bio:e.target.value})}/></div>
            <div className="form-group"><label className="form-label">Photo URL (optional)</label><input className="form-control" value={cForm.image} onChange={e=>setCForm({...cForm,image:e.target.value})} placeholder="https://..."/></div>
            <div style={{display:'flex',gap:10,marginTop:8}}>
              <button type="button" className="btn btn-secondary" onClick={()=>setShowCandidateModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" style={{flex:1}}>Add Candidate</button>
            </div>
          </form>
        </div>
      </div>}
    </div>
  )
}
