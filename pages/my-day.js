import { Layout } from './layout'
import { useState } from 'react'

const demoLogs = [
  { id:1, brand:'DreamFare', task:'Nigeria Meta ads – copy refresh', hours:2, status:'In progress', progress:40, date:'Today' },
  { id:2, brand:'TripAfrica', task:'SEO brief – Flights to Accra', hours:1.5, status:'Done', progress:100, date:'Today' },
  { id:3, brand:'Brookwood Cars', task:'Lead sheet cleanup', hours:1, status:'In progress', progress:60, date:'Yesterday' },
];

export default function MyDayPage(){
  const [logs, setLogs] = useState(demoLogs);
  const [form, setForm] = useState({
    brand:'DreamFare',
    task:'',
    hours:'1.5',
    status:'In progress',
    progress:'40',
    notes:''
  });

  function handleChange(e){
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function addLog(){
    if (!form.task) return alert('Task name likho');
    const newLog = {
      id: logs.length+1,
      brand: form.brand,
      task: form.task,
      hours: parseFloat(form.hours || '0'),
      status: form.status,
      progress: parseInt(form.progress || '0',10),
      date: 'Today'
    };
    setLogs([newLog, ...logs]);
    setForm({ ...form, task:'', notes:'' });
  }

  return (
    <Layout title="My Day">
      <div className="myday-grid">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Add today&apos;s log</div>
              <div className="card-sub">Each member will later use this to log daily work</div>
            </div>
          </div>
          <div className="input-row">
            <div style={{flex:1}}>
              <div className="small-label">Brand</div>
              <select name="brand" value={form.brand} onChange={handleChange} className="input-sm">
                <option>DreamFare</option>
                <option>TripAfrica</option>
                <option>Times Travel</option>
                <option>Brookwood Cars</option>
              </select>
            </div>
            <div style={{flex:1}}>
              <div className="small-label">Task / activity</div>
              <input name="task" value={form.task} onChange={handleChange} className="input-sm" placeholder="e.g. Lagos ads copy update"/>
            </div>
          </div>
          <div className="input-row">
            <div>
              <div className="small-label">Hours spent</div>
              <input name="hours" value={form.hours} onChange={handleChange} className="input-sm" />
            </div>
            <div>
              <div className="small-label">Status</div>
              <select name="status" value={form.status} onChange={handleChange} className="input-sm">
                <option>In progress</option>
                <option>Done</option>
                <option>Blocked</option>
              </select>
            </div>
            <div>
              <div className="small-label">Progress %</div>
              <input name="progress" value={form.progress} onChange={handleChange} className="input-sm" />
            </div>
          </div>
          <div style={{marginBottom:8}}>
            <div className="small-label">Notes (optional)</div>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} placeholder="Client approval pending, ad set live, etc." />
          </div>
          <button className="btn btn-primary" onClick={addLog}>+ Add log</button>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Recent logs</div>
              <div className="card-sub">Later we will save these in the database per member</div>
            </div>
          </div>
          <div className="log-list">
            {logs.map(log => (
              <div key={log.id} className="log-item">
                <div className="log-meta">
                  <span>{log.date} · {log.brand}</span>
                  <span>{log.hours}h</span>
                </div>
                <div style={{fontSize:11}}>{log.task}</div>
                <div className="log-meta" style={{marginTop:2}}>
                  <span>{log.status}</span>
                  <span>{log.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}
