import { Layout } from './layout'
import Link from 'next/link'

const brands = [
  { id: 1, name: 'DreamFare', owner: 'Noor', category: 'Travel', status: 'Active', open: 8, overdue: 1 },
  { id: 2, name: 'TripAfrica', owner: 'Hussain', category: 'Travel', status: 'Active', open: 12, overdue: 3 },
  { id: 3, name: 'Times Travel', owner: 'Azaz', category: 'Travel', status: 'Active', open: 5, overdue: 0 },
  { id: 4, name: 'Brookwood Cars', owner: 'Client', category: 'Taxi', status: 'Active', open: 9, overdue: 4 },
];

export default function BrandsPage(){
  return (
    <Layout title="Brands">
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Brands managed by central team</div>
            <div className="card-sub">V1: static list, later DB se connect karenge</div>
          </div>
          <button className="btn btn-primary">+ New Brand</button>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Brand</th>
              <th>Owner / Lead</th>
              <th>Category</th>
              <th>Open tasks</th>
              <th>Overdue</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {brands.map(b => (
              <tr key={b.id}>
                <td>{b.name}</td>
                <td>{b.owner}</td>
                <td>{b.category}</td>
                <td>{b.open}</td>
                <td>{b.overdue}</td>
                <td>
                  <Link href={`/brands/${b.id}`}>
                    <span className="chip-sm">View board →</span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  )
}
