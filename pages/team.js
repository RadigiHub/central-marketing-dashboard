// pages/team.js
import { useEffect, useState } from 'react';
import Head from 'next/head';
import supabase from '../lib/supabase';
import Layout from '../components/Layout';

const TEAM = [
  {
    name: 'Shehroz Malik',
    role: 'Head of Central Marketing',
    focus: 'Strategy, dashboards, client leadership, performance.',
  },
  {
    name: 'Tahir',
    role: 'SEO Lead',
    focus: 'Technical SEO, on-page, content briefs.',
  },
  {
    name: 'Muskan',
    role: 'Content & Social',
    focus: 'Copy, creatives, social calendars.',
  },
  {
    name: 'Noraiz',
    role: 'Web Development',
    focus: 'Landing pages, tracking, UI fixes.',
  },
  {
    name: 'Haris',
    role: 'Brand Lead',
    focus: 'Mashaallah Trips, Awesome Trips.',
  },
  {
    name: 'Imran',
    role: 'Brand Lead',
    focus: '123 Flights, Umrah Planner, TripAfrica, Times Travel.',
  },
  {
    name: 'Zaki',
    role: 'Brand Lead',
    focus: 'Travel Hunter.',
  },
  {
    name: 'Tayyaba',
    role: 'Brand Lead',
    focus: 'Times Fitness.',
  },
  {
    name: 'Sadia',
    role: 'Brand Lead',
    focus: 'Direct Connect.',
  },
];

export default function TeamPage() {
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('Brands').select('*');
      setBrands(data || []);
    })();
  }, []);

  const brandsByLead = brands.reduce((acc, b) => {
    const key = b.team_lead || 'Unassigned';
    acc[key] = acc[key] || [];
    acc[key].push(b);
    return acc;
  }, {});

  return (
    <Layout>
      <Head>
        <title>Team • Central Marketing Dashboard</title>
      </Head>

      <div className="page-header">
        <div>
          <h1 className="page-title">Team</h1>
          <p className="page-subtitle">
            Who is handling which brands, with focus for each person.
          </p>
        </div>
      </div>

      <div className="grid grid-3">
        {TEAM.map((member) => {
          const ownedBrands = brandsByLead[member.name] || [];
          return (
            <div className="card team-card" key={member.name}>
              <div className="card-header">
                <h2 className="card-title">{member.name}</h2>
                <p className="card-subtitle">{member.role}</p>
              </div>
              <div className="card-body">
                <p className="muted">{member.focus}</p>
                <div className="team-brands">
                  <div className="team-brands-label">Brands</div>
                  {ownedBrands.length === 0 ? (
                    <p className="muted">No brands assigned yet.</p>
                  ) : (
                    <ul>
                      {ownedBrands.map((b) => (
                        <li key={b.id}>
                          {b.name}{' '}
                          <span className="pill tiny">
                            {b.status || '—'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Layout>
  );
}
