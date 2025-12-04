// pages/team.js
const coreTeam = [
  {
    role: "Central Marketing Lead",
    name: "Shehroz Malik",
    focus:
      "Overall strategy, brand direction, campaign planning & performance review.",
  },
  {
    role: "SEO Lead",
    name: "Tahir",
    focus:
      "Organic growth, technical SEO, content structure & rankings monitoring.",
  },
  {
    role: "Content Specialist",
    name: "Muskan",
    focus:
      "Social content, creatives, captions & keeping every brand voice consistent.",
  },
  {
    role: "Web Developer",
    name: "Noraiz",
    focus: "Website builds, revamps, landing pages and tracking setup.",
  },
];

export default function TeamPage() {
  return (
    <div>
      <div className="section-header">
        <h2 className="section-title">Team</h2>
        <p className="section-subtitle">
          Who is owning what inside Central Marketing.
        </p>
      </div>

      <div className="grid grid-2 gap-lg">
        {coreTeam.map((member) => (
          <div key={member.name} className="card">
            <div className="team-role">{member.role}</div>
            <div className="team-name">{member.name}</div>
            <p className="team-focus">{member.focus}</p>
          </div>
        ))}
      </div>

      <div className="card mt-lg">
        <div className="meta-label mb-2">Brand Leads by Brand</div>
        <p className="team-focus">
          Mashaallah Trips – Haris • Awesome Trips – Haris • 123 Flights – Imran
          • Umrah Planner – Imran • Patel Travel – Imran • Times Travel (Parent
          Project) – Central Team • TripAfrica – Imran • Times Fitness – Tayyaba
          • Travel Hunter – Zaki • Direct Connect – Sadia
        </p>
      </div>
    </div>
  );
}
