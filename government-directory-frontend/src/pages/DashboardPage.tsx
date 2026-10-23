import { useEffect, useState } from 'react';
import { ArrowUpRight, BadgeCheck, Blocks, Building2, CalendarDays, Landmark, MapPinned, RefreshCw, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { dashboardApi, getErrorMessage } from '../services/api';
import type { DashboardSummary } from '../types';
import { Button, Spinner } from '../components/ui';

const cards = [
  { key: 'departments', label: 'Departments', icon: Building2, color: 'blue', route: '/departments', note: 'Administrative units' },
  { key: 'offices', label: 'Offices', icon: Landmark, color: 'green', route: '/offices', note: 'Registered offices' },
  { key: 'employees', label: 'Employees', icon: Users, color: 'purple', route: '/employees', note: 'Directory profiles' },
  { key: 'districts', label: 'Districts', icon: MapPinned, color: 'amber', route: '/districts', note: 'Geographic coverage' },
  { key: 'blocks', label: 'Blocks', icon: Blocks, color: 'cyan', route: '/blocks', note: 'District blocks' },
  { key: 'designations', label: 'Designations', icon: BadgeCheck, color: 'rose', route: '/designations', note: 'Official positions' }
] as const;

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = async () => {
    setLoading(true); setError('');
    try { setSummary(await dashboardApi.summary()); }
    catch (e) { setError(getErrorMessage(e)); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  return <div className="page-stack">
    <section className="welcome-banner"><div className="welcome-copy"><span className="eyebrow">OVERVIEW</span><h1>Good day, Administrator <span>✦</span></h1><p>Here’s what’s happening across your government directory today.</p><div className="welcome-meta"><span><CalendarDays size={15} /> Directory administration</span><span><ShieldCheckIcon /> Role-based access enabled</span></div></div><div className="welcome-art"><div className="art-circle art-circle-one" /><div className="art-circle art-circle-two" /><Building2 size={70} strokeWidth={1.2} /></div></section>
    <div className="section-heading"><div><h2>Directory overview</h2><p>Live counts from your connected database.</p></div><Button variant="secondary" onClick={() => void load()} loading={loading}><RefreshCw size={15} /> Refresh</Button></div>
    {error && <div className="inline-error" role="alert">{error}<button className="text-button" onClick={() => void load()}>Try again</button></div>}
    {loading && !summary ? <div className="panel loading-panel"><Spinner label="Loading dashboard statistics…" /></div> : <div className="stats-grid">{cards.map(card => { const Icon = card.icon; return <Link className="stat-card" to={card.route} key={card.key}><div className="stat-top"><span className={`stat-icon stat-${card.color}`}><Icon size={20} /></span><span className="stat-arrow"><ArrowUpRight size={17} /></span></div><span className="stat-label">{card.label}</span><strong className="stat-number">{summary?.[card.key] ?? '—'}</strong><span className="stat-note">{card.note}</span></Link>; })}</div>}
    <div className="dashboard-bottom-grid"><section className="panel quick-actions"><div className="panel-heading"><div><h3>Quick actions</h3><p>Jump straight into common tasks.</p></div></div><div className="quick-action-list"><Link to="/employees"><span className="quick-action-icon quick-purple"><Users size={18} /></span><span><strong>Manage employees</strong><small>Create, update or search employee profiles</small></span><ArrowUpRight size={17} /></Link><Link to="/offices"><span className="quick-action-icon quick-green"><Landmark size={18} /></span><span><strong>Manage offices</strong><small>Maintain office and location information</small></span><ArrowUpRight size={17} /></Link><Link to="/departments"><span className="quick-action-icon quick-blue"><Building2 size={18} /></span><span><strong>Manage departments</strong><small>Review department records</small></span><ArrowUpRight size={17} /></Link></div></section>
      <section className="panel system-panel"><div className="panel-heading"><div><h3>System status</h3><p>Connection and access details.</p></div><span className="system-status-dot" /></div><div className="system-status-row"><span>Backend API</span><strong className={error ? 'status-text-error' : 'status-text-ok'}><i />{error ? 'Check connection' : loading ? 'Checking…' : 'Connected'}</strong></div><div className="system-status-row"><span>Database summary</span><strong>{summary ? 'Available' : 'Waiting for data'}</strong></div><div className="system-status-row"><span>Directory modules</span><strong>6 modules</strong></div><div className="system-note"><ShieldCheckIcon /> Access is enforced by the backend for every protected request.</div></section></div>
  </div>;
}
function ShieldCheckIcon() { return <BadgeCheck size={15} />; }