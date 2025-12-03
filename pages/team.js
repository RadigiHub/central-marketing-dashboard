import { Layout } from './layout'

const members = [
  { name:'You', role:'Head of Marketing', brands:6, open:14, completed:28 },
  { name:'Ayesha', role:'Performance', brands:4, open:9, completed:22 },
  { name:'Sana', role:'Content Lead', brands:5, open:7, completed:25 },
  { name:'Ali', role:'Designer', brands:3, open:11, completed:19 },
];

export default function TeamPage(){
  return (
    <Layout title="Team">
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Central marketing team</div>
            <div className="card-sub">V1: static, later Supabase users se aaye ga</div>
          </div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Role</th>
              <th>Brands</th>
              <th>Open tasks</th>
              <th>Completed this month</th>
            </tr>
          </thead>
          <tbody>
            {members.map(m => (
              <tr key={m.name}>
                <td>{m.name}</td>
                <td>{m.role}</td>
                <td>{m.brands}</td>
                <td>{m.open}</td>
                <td>{m.completed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  )
}
