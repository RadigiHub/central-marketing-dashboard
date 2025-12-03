import { Layout } from './layout'

const brands = [
  { name: 'DreamFare', status: 'green', open: 8, overdue: 1, owner: 'Noor' },
  { name: 'TripAfrica', status: 'yellow', open: 12, overdue: 3, owner: 'Hussain' },
  { name: 'Times Travel', status: 'green', open: 5, overdue: 0, owner: 'Azaz' },
  { name: 'Brookwood Cars', status: 'red', open: 9, overdue: 4, owner: 'Client' },
];

const weekSummary = [
  { label:'Tasks completed', value:'+18 vs last week' },
  { label:'Avg completion time', value:'-0.8 days faster' },
  { label:'Overdue tasks', value:'+2 (watch Brookwood, TripAfrica)' },
];

export default function Home() {
  const totalBrands = brands.length;
  const totalOpen = brands.reduce((s,b)=>s+b.open,0);
  const totalOverdue = brands.reduce((s,b)=>s+b.overdue,0);

  return (
    <Layout title="Overview">
      <div className="grid grid-3">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Active brands</div>
              <div className="card-sub">Managed by central marketing</div>
            </div>
          </div>
          <div className="metric">{totalBrands}</div>
          <div className="kpi-row">
            <span>On track</span>
            <span>3</span>
          </div>
          <div className="kpi-row">
            <span>At risk</span>
            <span>1</span>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Open tasks</div>
              <div className="card-sub">Across all brands</div>
            </div>
          </div>
          <div className="metric">{totalOpen}</div>
          <div className="kpi-row">
            <span>High priority</span>
            <span>7</span>
          </div>
          <div className="kpi-row">
            <span>Critical this week</span>
            <span>3</span>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Overdue</div>
              <div className="card-sub">Needing attention</div>
            </div>
          </div>
          <div className="metric">{totalOverdue}</div>
          <div className="kpi-row">
            <span>Most delayed brand</span>
            <span>Brookwood Cars</span>
          </div>
          <div className="kpi-row">
            <span>Oldest open task</span>
            <span>12 days</span>
          </div>
        </div>
      </div>

      <div className="grid grid-2" style={{marginTop:16}}>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Brand health</div>
              <div className="card-sub">Quick view of risk & load</div>
            </div>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Brand</th>
                <th>Owner</th>
                <th>Open</th>
                <th>Overdue</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {brands.map((b)=> (
                <tr key={b.name}>
                  <td>{b.name}</td>
                  <td>{b.owner}</td>
                  <td>{b.open}</td>
                  <td>{b.overdue}</td>
                  <td>
                    <span className={
                      'badge ' + (b.status==='green'?'green':b.status==='yellow'?'yellow':b.status==='red'?'red':'gray')
                    }>
                      {b.status==='green'?'On track':b.status==='yellow'?'At risk':'Behind'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">This week summary</div>
              <div className="card-sub">Use in your weekly review with boss</div>
            </div>
          </div>
          {weekSummary.map((row)=> (
            <div key={row.label} className="kpi-row">
              <span>{row.label}</span>
              <span>{row.value}</span>
            </div>
          ))}
          <div style={{marginTop:10,fontSize:11,color:'#9ca3af'}}>
            Later hum yahan “Generate AI Summary” ka button add karenge jo sari week ki story automatic likh dega.
          </div>
        </div>
      </div>
    </Layout>
  )
}
