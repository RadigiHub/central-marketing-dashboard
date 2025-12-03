import Layout from "../components/Layout";

export default function Home() {
  return (
    <Layout
      title="Central Marketing Overview"
      subtitle="High-level snapshot of all brands & campaigns."
    >
      <div className="card-grid">
        <div className="card">
          <h3>Active Brands</h3>
          <p>10 brands being managed by central marketing.</p>
        </div>
        <div className="card">
          <h3>Open Tasks (This Week)</h3>
          <p>24 items across content, paid media & web.</p>
        </div>
        <div className="card">
          <h3>On-time Delivery</h3>
          <p>82% of tasks completed within agreed timelines.</p>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Brand</th>
              <th>Owner</th>
              <th>Current Focus</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Times Travel</td>
              <td>Central Team</td>
              <td>Winter campaigns, SEO, Africa flights</td>
              <td>
                <span className="pill pill-green">On Track</span>
              </td>
            </tr>
            <tr>
              <td>DreamFare</td>
              <td>Central Team</td>
              <td>Meta ads, content engine, Nigeria flights</td>
              <td>
                <span className="pill pill-amber">Needs Attention</span>
              </td>
            </tr>
            <tr>
              <td>TripAfrica</td>
              <td>Central Team</td>
              <td>Site build + launch, tracking setup</td>
              <td>
                <span className="pill pill-green">On Track</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="muted">
        *Ye sirf placeholder data hai. Baad me hum isko real tasks / database se connect kar
        sakte hain.
      </p>
    </Layout>
  );
}
