import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Building2, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';
import { Button } from '../components/ui';

export default function LoginPage() {
  const { user, signIn, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('admin@directory.local');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  if (!loading && user) return <Navigate to="/" replace />;
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError('');
    if (!email.trim() || !password) { setError('Enter your email and password to continue.'); return; }
    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
      const from = (location.state as { from?: string } | null)?.from || '/';
      navigate(from, { replace: true });
    } catch (e) { setError(getErrorMessage(e)); }
    finally { setSubmitting(false); }
  };
  return <main className="login-page">
    <section className="login-brand-panel">
      <div className="brand-lockup"><div className="brand-mark"><Building2 size={25} /></div><div><strong>GovDirectory</strong><span>Administration Portal</span></div></div>
      <div className="brand-copy"><span className="eyebrow">GOVERNMENT OF RAJASTHAN</span><h1>One directory.<br /><em>Every department.</em></h1><p>A unified workspace to manage offices, employees and administrative information across departments.</p>
        <div className="brand-points"><span><ShieldCheck size={17} /> Secure administrator access</span><span><Building2 size={17} /> Multi-department directory</span></div>
      </div>
      <div className="brand-footer">Government Officer Directory <span>•</span> Administration</div>
    </section>
    <section className="login-form-panel">
      <div className="login-form-wrap">
        <div className="mobile-brand"><div className="brand-mark"><Building2 size={23} /></div><strong>GovDirectory</strong></div>
        <span className="eyebrow">WELCOME BACK</span><h2>Sign in to your account</h2><p className="muted">Enter your administrator credentials to continue.</p>
        {error && <div className="inline-error" role="alert">{error}</div>}
        <form onSubmit={submit} className="login-form">
          <div className="form-field"><label htmlFor="email">Email address</label><div className="input-with-icon"><Mail size={18} /><input id="email" type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@department.gov.in" /></div></div>
          <div className="form-field"><label htmlFor="password">Password</label><div className="input-with-icon"><LockKeyhole size={18} /><input id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" /><button type="button" className="password-toggle" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></div>
          <Button type="submit" className="login-submit" loading={submitting}>Sign in securely</Button>
        </form>
        <div className="login-security"><ShieldCheck size={17} /><span>Your session is protected using authenticated API access.</span></div>
        <div className="login-bottom">For authorized administrators only.</div>
      </div>
    </section>
  </main>;
}