import Layout from "../components/Layout";

const team = [
  { name: "You (Lead)", role: "Marketing Lead", focus: "Strategy + Performance" },
  { name: "Designer", role: "Creative", focus: "Social + Ads Creatives" },
  { name: "Dev / Web", role: "Developer", focus: "Landing pages + Tracking" },
  { name: "Assistant", role: "Exec", focus: "Reporting + Coordination" },
];

export default function Team() {
  return (
    <Layout
      title="Central Marketing Team"
      subtitle="Kaun kis cheez ka owner hai – clarity for you + boss."
    >
      <div className="card">
        <h3>Structure</h3>
        <p className="muted">
          Ye sirf sample structure hai. Baad me hum isko real logon ke naam, KPIs, aur workload
          scoring ke sath connect kar sakte hain.
        </p>
      </div>

      <div className="table-wrapper" style={{ marginTop: 16 }}>
        <table className="table">
          <thead>
            <tr>
              <th>Team Member</th>
              <th>Role</th>
              <th>Primary Focus</th>
            </tr>
          </thead>
          <tbody>
            {team.map((m) => (
              <tr key={m.name}>
                <td>{m.name}</td>
                <td>{m.role}</td>
                <td>{m.focus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
