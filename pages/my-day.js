import Layout from "../components/Layout";

const tasks = [
  { time: "10:00", title: "Times Travel – Meta ads review", status: "In Progress" },
  { time: "12:00", title: "DreamFare – Nigeria flights creative", status: "Not Started" },
  { time: "15:00", title: "TripAfrica – homepage wireframe feedback", status: "In Progress" },
  { time: "17:00", title: "Brookwood Cars – monthly report", status: "Done" },
];

export default function MyDay() {
  return (
    <Layout
      title="My Day"
      subtitle="Daily focus view – jo kaam aaj close karna hai."
    >
      <div className="card">
        <h3>Today&apos;s Focus</h3>
        <p className="muted">
          Ye page tumhare ya team member ka personal daily view ho sakta hai. Baad me hum login
          / user wise filtering add kar sakte hain.
        </p>
      </div>

      <div className="table-wrapper" style={{ marginTop: 16 }}>
        <table className="table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Task</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t, i) => (
              <tr key={i}>
                <td>{t.time}</td>
                <td>{t.title}</td>
                <td>
                  <span
                    className={
                      t.status === "Done"
                        ? "pill pill-green"
                        : t.status === "In Progress"
                        ? "pill pill-amber"
                        : "pill pill-red"
                    }
                  >
                    {t.status}
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
