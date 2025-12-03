import Layout from "../components/Layout";

const rows = [
  { name: "Times Travel", type: "Travel", owner: "Central", priority: "High" },
  { name: "DreamFare", type: "Travel", owner: "Central", priority: "High" },
  { name: "TripAfrica", type: "Travel", owner: "Central", priority: "Medium" },
  { name: "Brookwood Cars", type: "Taxi", owner: "Central", priority: "Medium" },
];

export default function Brands() {
  return (
    <Layout
      title="Brands & Accounts"
      subtitle="Sab brands ek jagah, quick view of ownership & priorities."
    >
      <div className="card">
        <h3>How to use</h3>
        <p className="muted">
          Yahan par har brand ka status, owner, aur priority track hogi. Baad me hum filters,
          search aur detailed brand pages add kar sakte hain.
        </p>
      </div>

      <div className="table-wrapper" style={{ marginTop: 16 }}>
        <table className="table">
          <thead>
            <tr>
              <th>Brand</th>
              <th>Category</th>
              <th>Owner</th>
              <th>Priority</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name}>
                <td>{row.name}</td>
                <td>{row.type}</td>
                <td>{row.owner}</td>
                <td>
                  <span
                    className={
                      row.priority === "High"
                        ? "pill pill-red"
                        : row.priority === "Medium"
                        ? "pill pill-amber"
                        : "pill pill-green"
                    }
                  >
                    {row.priority}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
