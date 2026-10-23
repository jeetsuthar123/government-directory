import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { LoaderCircle, Search, X } from 'lucide-react';

export function Spinner({ label = 'Loading…' }: { label?: string }) {
  return <div className="spinner-wrap"><LoaderCircle className="spin" size={20} /><span>{label}</span></div>;
}
export function Button({ children, variant = 'primary', loading = false, className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'ghost'; loading?: boolean }) {
  return <button className={`button button-${variant} ${className}`} disabled={props.disabled || loading} {...props}>{loading ? <LoaderCircle className="spin" size={16} /> : null}{children}</button>;
}
export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="empty-state"><div className="empty-icon"><Search size={24} /></div><h3>{title}</h3><p>{description}</p>{action}</div>;
}
export function Modal({ title, onClose, children, wide = false }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
    <section className={`modal ${wide ? 'modal-wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
      <header className="modal-header"><h2>{title}</h2><button className="icon-button" onClick={onClose} aria-label="Close dialog"><X size={20} /></button></header>
      {children}
    </section>
  </div>;
}
export function StatusPill({ active }: { active: boolean }) {
  return <span className={`status-pill ${active ? 'status-active' : 'status-inactive'}`}><span />{active ? 'Active' : 'Inactive'}</span>;
}