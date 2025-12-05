// pages/my-day.js
import { useEffect, useState } from 'react';
import {
  getSimpleBrands,
  getDailyUpdates,
  addDailyUpdate,
} from '../lib/queries';

export default function MyDayPage() {
  const [brands, setBrands] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    brand_id: '',
    assignee: '',
    status: 'In Progress',
    focus: '',
    impact: '',
  });

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [brandsData, updatesData] = await Promise.all([
          getSimpleBrands(),
          getDailyUpdates(),
        ]);

        setBrands(brandsData);
        setUpdates(updatesData);
      } catch (error) {
        console.error('Error loading My Day data', error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.brand_id || !form.assignee || !form.focus) {
      alert('Brand, assignee aur focus required hain 🙂');
      return;
    }

    try {
      await addDailyUpdate(form);
      setForm({
        brand_id: '',
        assignee: '',
        status: 'In Progress',
        focus: '',
        impact: '',
      });

      const updatesData = await getDailyUpdates();
      setUpdates(updatesData);
    } catch (error) {
      alert('Error saving update, console check karo');
    }
  }

  return (
    <div className="layout">
      <h1 className="page-title">My Day</h1>
      <p className="page-subtitle">
        Roz ka kaam yahan log karo – boss & managers is se live view dekh sakte hain.
      </p>

      <div className="grid grid-2 gap-lg">
        {/* LEFT: Add update form */}
        <div className="card">
          <h2 className="card-title">Add today&apos;s update</h2>

          <form className="form-grid" onSubmit={handleSubmit}>
            <label>
              Brand
              <select
                value={form.brand_id}
                onChange={(e) =>
                  setForm((f) => ({ ...f, brand_id: e.target.value }))
                }
              >
                <option value="">Select brand…</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Your name
              <input
                type="text"
                value={form.assignee}
                onChange={(e) =>
                  setForm((f) => ({ ...f, assignee: e.target.value }))
                }
                placeholder="e.g. Muskan, Tahir, Imran"
              />
            </label>

            <label>
              Status
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({ ...f, status: e.target.value }))
                }
              >
                <option>Planned</option>
                <option>In Progress</option>
                <option>Done</option>
                <option>Blocked</option>
              </select>
            </label>

            <label className="full-width">
              Today&apos;s focus
              <textarea
                value={form.focus}
                onChange={(e) =>
                  setForm((f) => ({ ...f, focus: e.target.value }))
                }
                placeholder="Meta Ads optimisation, new SEO brief, content calendar, etc."
              />
            </label>

            <label className="full-width">
              Impact / notes (optional)
              <textarea
                value={form.impact}
                onChange={(e) =>
                  setForm((f) => ({ ...f, impact: e.target.value }))
                }
                placeholder="e.g. CPL ↓ 12%, 3 new campaigns launched, etc."
              />
            </label>

            <button type="submit" className="btn-primary">
              Save update
            </button>
          </form>
        </div>

        {/* RIGHT: Latest updates list */}
        <div className="card table-card">
          <h2 className="card-title">Latest updates</h2>

          {loading ? (
            <div>Loading updates…</div>
          ) : updates.length === 0 ? (
            <div>No updates yet.</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Brand</th>
                  <th>Assignee</th>
                  <th>Status</th>
                  <th>Focus</th>
                </tr>
              </thead>
              <tbody>
                {updates.map((u) => (
                  <tr key={u.id}>
                    <td>{u.date}</td>
                    <td>{u.brand?.name}</td>
                    <td>{u.assignee}</td>
                    <td>{u.status}</td>
                    <td>{u.focus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
