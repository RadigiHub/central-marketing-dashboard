import { useRouter } from 'next/router'
import { Layout } from '../layout'

const demoBrand = {
  1: { name:'DreamFare', owner:'Noor' },
  2: { name:'TripAfrica', owner:'Hussain' },
  3: { name:'Times Travel', owner:'Azaz' },
  4: { name:'Brookwood Cars', owner:'Client' },
};

const tasks = [
  { id:1, title:'Nigeria flights Q1 Meta ads', status:'todo', priority:'high', due:'2025-01-10', assignee:'Ayesha' },
  { id:2, title:'SEO content: Flights to Lagos page', status:'in_progress', priority:'medium', due:'2025-01-14', assignee:'Sana' },
  { id:3, title:'WhatsApp creatives batch 03', status:'review', priority:'low', due:'2025-01-09', assignee:'Ali' },
  { id:4, title:'Reporting template for Boss', status:'done', priority:'high', due:'2024-12-30', assignee:'You' },
  { id:5, title:'Brookwood lead-gen test campaign', status:'blocked', priority:'critical', due:'2025-01-05', assignee:'Ahsan' },
];

function columnFilter(status) {
  return tasks.filter(t => t.status === status);
}

export default function BrandDetail(){
  const router = useRouter();
  const { id } = router.query;
  const brand = demoBrand[id] || { name:'Brand', owner:'-' };

  return (
    <Layout title={`Brand – ${brand.name}`}>
      <div className="card" style={{marginBottom:12}}>
        <div className="card-header">
          <div>
            <div className="card-title">{brand.name}</div>
            <div className="card-sub">Brand lead: {brand.owner}. Yahan later brand notes, budget, key KPIs add karenge.</div>
          </div>
          <div className="chip">V1 demo data</div>
        </div>
      </div>

      <div className="kanban">
        <div className="kanban-col">
          <div className="column-heading">To do</div>
          {columnFilter('todo').map(t => <TaskCard key={t.id} task={t} />)}
        </div>
        <div className="kanban-col">
          <div className="column-heading">In progress</div>
          {columnFilter('in_progress').map(t => <TaskCard key={t.id} task={t} />)}
        </div>
        <div className="kanban-col">
          <div className="column-heading">Review</div>
          {columnFilter('review').map(t => <TaskCard key={t.id} task={t} />)}
        </div>
        <div className="kanban-col">
          <div className="column-heading">Done / Blocked</div>
          {tasks.filter(t=>t.status==='done' || t.status==='blocked').map(t => <TaskCard key={t.id} task={t} />)}
        </div>
      </div>
    </Layout>
  )
}

function TaskCard({ task }) {
  const statusLabel =
    task.status === 'todo' ? 'Not started' :
    task.status === 'in_progress' ? 'In progress' :
    task.status === 'review' ? 'In review' :
    task.status === 'blocked' ? 'Blocked' : 'Done';

  return (
    <div className="task-card">
      <div className="task-title">{task.title}</div>
      <div className="task-meta">
        <span>{task.assignee}</span>
        <span className="chip-sm">{task.due}</span>
      </div>
      <div className="task-meta" style={{marginTop:2}}>
        <span className="badge gray">{statusLabel}</span>
        <span className="badge yellow">{task.priority.toUpperCase()}</span>
      </div>
    </div>
  );
}
