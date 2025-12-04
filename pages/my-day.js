// pages/my-day.js
const tasks = [
  {
    title: "Check Meta Ads performance for Mashaallah Trips",
    type: "Performance review",
  },
  {
    title: "Review Travel Hunter website final testing",
    type: "Web / QA",
  },
  {
    title: "Plan content calendar for Times Fitness (new look)",
    type: "Content",
  },
  {
    title: "Align SEO priorities: 123 Flights & Umrah Planner",
    type: "SEO",
  },
];

export default function MyDayPage() {
  return (
    <div>
      <div className="section-header">
        <h2 className="section-title">My Day</h2>
        <p className="section-subtitle">
          Quick list of priority tasks for Central Marketing lead.
        </p>
      </div>

      <div className="card">
        <ul className="task-list">
          {tasks.map((t, idx) => (
            <li key={idx} className="task-item">
              <div className="task-dot" />
              <div>
                <div className="task-title">{t.title}</div>
                <div className="task-type">{t.type}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
