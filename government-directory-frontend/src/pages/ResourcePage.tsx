import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ChevronLeft, ChevronRight, Download, Edit3, Plus, RefreshCw, Search, Trash2, X } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { resourceByKey } from '../config/resources';
import type { DirectoryRecord, ResourceKey } from '../types';
import { getErrorMessage, resourceApi } from '../services/api';
import { Button, EmptyState, Modal, Spinner, StatusPill } from '../components/ui';
import ResourceForm from '../components/ResourceForm';
import { useAuth } from '../context/AuthContext';

export default function ResourcePage({ resource: routeResource }: { resource?: ResourceKey }) {
  const { resource: param } = useParams();
  const config = resourceByKey((routeResource || param) as ResourceKey);
  const { user } = useAuth();
  const [rows, setRows] = useState<DirectoryRecord[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<DirectoryRecord | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<DirectoryRecord | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const canWrite = !config.superAdminOnly || user?.role === 'super_admin';

  const notify = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 4000);
  };

  const loadRows = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const response = await resourceApi.list(config.key, {
        page, limit, search: search.trim() || undefined, sortBy: 'createdAt', order: 'desc',
        isActive: activeFilter || undefined
      });
      setRows(response.data); setTotal(response.total); setTotalPages(Math.max(1, response.totalPages || 1));
    } catch (e) { setError(getErrorMessage(e)); setRows([]); }
    finally { setLoading(false); }
  }, [config.key, page, limit, search, activeFilter]);

  useEffect(() => { void loadRows(); }, [loadRows]);
  useEffect(() => { setPage(1); setSearch(''); setActiveFilter(''); setRows([]); }, [config.key]);

  const displayValue = (record: DirectoryRecord, key: string): string => {
    const value = record[key];
    if (value === null || value === undefined || value === '') return '—';
    if (key === 'isActive' || key === 'isPublic') return '';
    if (key === 'dateOfBirth') {
      const date = new Date(String(value));
      return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    }
    if (typeof value === 'object') {
      const obj = value as DirectoryRecord;
      return String(obj.name || obj.email || obj.code || obj._id || '—');
    }
    return String(value);
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await resourceApi.remove(config.key, deleting._id);
      notify(`${config.singular} deleted successfully.`);
      setDeleting(null);
      await loadRows();
    } catch (e) { notify(getErrorMessage(e), 'error'); }
    finally { setDeleteBusy(false); }
  };

  const exportCurrentPage = () => {
    const headers = config.columns.map(c => c.label);
    const escapeCsv = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const lines = [headers.map(escapeCsv).join(','), ...rows.map(row => config.columns.map(c => escapeCsv(displayValue(row, c.key))).join(','))];
    const blob = new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = `${config.key}-page-${page}.csv`; link.click(); URL.revokeObjectURL(url);
  };

  const columnList = useMemo(() => config.columns, [config.columns]);

  return <div className="page-stack">
    <section className="page-title-row"><div><div className="eyebrow">DIRECTORY MANAGEMENT</div><h1>{config.label}</h1><p>{config.description}</p></div><div className="page-title-actions"><Button variant="secondary" onClick={exportCurrentPage} disabled={!rows.length}><Download size={16} /> Export CSV</Button>{canWrite && <Button onClick={() => setCreating(true)}><Plus size={17} /> Add {config.singular}</Button>}</div></section>
    {toast && <div className={`toast toast-${toast.type}`} role="status"><span>{toast.message}</span><button className="icon-button" onClick={() => setToast(null)} aria-label="Dismiss notification"><X size={16} /></button></div>}
    {!canWrite && <div className="notice-banner"><AlertTriangle size={18} /><span>You have read-only access to this shared reference module. Contact a super administrator to make changes.</span></div>}
    <section className="panel data-panel">
      <div className="data-toolbar"><div className="search-box"><Search size={18} /><input aria-label={`Search ${config.label.toLowerCase()}`} placeholder={`Search ${config.label.toLowerCase()}…`} value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} /><kbd>⌕</kbd></div><div className="toolbar-right"><label className="filter-select"><span>Status</span><select value={activeFilter} onChange={e => { setActiveFilter(e.target.value); setPage(1); }}><option value="">All statuses</option><option value="true">Active</option><option value="false">Inactive</option></select></label><Button variant="secondary" onClick={() => void loadRows()} loading={loading} className="refresh-button"><RefreshCw size={15} /> Refresh</Button></div></div>
      {error && <div className="inline-error table-error" role="alert"><span>{error}</span><Button variant="secondary" onClick={() => void loadRows()}>Retry</Button></div>}
      {loading ? <div className="table-loading"><Spinner label={`Loading ${config.label.toLowerCase()}…`} /></div> : rows.length === 0 ? <EmptyState title={search ? 'No matching records' : `No ${config.label.toLowerCase()} yet`} description={search ? 'Try a different search term or clear the filters.' : `Create your first ${config.singular.toLowerCase()} record to get started.`} action={canWrite && !search ? <Button onClick={() => setCreating(true)}><Plus size={16} /> Add {config.singular}</Button> : undefined} /> : <div className="table-wrap"><table className="data-table"><thead><tr>{columnList.map(c => <th key={c.key}>{c.label}</th>)}<th className="actions-column">Actions</th></tr></thead><tbody>{rows.map(row => <tr key={row._id}>{columnList.map(column => <td key={column.key}>{column.key === 'isActive' ? <StatusPill active={Boolean(row.isActive)} /> : column.key === 'isPublic' ? <span className={`visibility-pill ${row.isPublic ? 'visible' : 'hidden'}`}>{row.isPublic ? 'Public' : 'Private'}</span> : <span className={column.key === 'name' ? 'primary-cell' : ''}>{displayValue(row, column.key)}</span>}</td>)}<td><div className="row-actions">{canWrite && <><button className="row-action" onClick={() => setEditing(row)} title={`Edit ${config.singular}`} aria-label={`Edit ${config.singular}`}><Edit3 size={16} /></button><button className="row-action row-action-danger" onClick={() => setDeleting(row)} title={`Delete ${config.singular}`} aria-label={`Delete ${config.singular}`}><Trash2 size={16} /></button></>}</div></td></tr>)}</tbody></table></div>}
      <footer className="table-footer"><span>Showing <strong>{rows.length ? (page - 1) * limit + 1 : 0}–{Math.min(page * limit, total)}</strong> of <strong>{total}</strong> records</span><div className="pagination"><button disabled={page <= 1 || loading} onClick={() => setPage(p => Math.max(1, p - 1))} aria-label="Previous page"><ChevronLeft size={17} /></button><span>Page <strong>{page}</strong> of <strong>{totalPages}</strong></span><button disabled={page >= totalPages || loading} onClick={() => setPage(p => Math.min(totalPages, p + 1))} aria-label="Next page"><ChevronRight size={17} /></button></div></footer>
    </section>
    {(creating || editing) && <ResourceForm config={config} record={editing} onClose={() => { setCreating(false); setEditing(null); }} onSaved={loadRows} notify={notify} />}
    {deleting && <Modal title={`Delete ${config.singular.toLowerCase()}?`} onClose={() => setDeleting(null)}><div className="confirm-content"><div className="confirm-icon"><AlertTriangle size={23} /></div><p>Are you sure you want to delete <strong>{String(deleting.name || deleting.email || deleting.code || config.singular)}</strong>? This action cannot be undone.</p><p className="muted small">If this record is referenced by other records, the backend will prevent deletion and display the reason.</p><div className="form-actions"><Button variant="secondary" onClick={() => setDeleting(null)}>Cancel</Button><Button variant="danger" loading={deleteBusy} onClick={() => void confirmDelete()}><Trash2 size={16} /> Delete record</Button></div></div></Modal>}
  </div>;
}