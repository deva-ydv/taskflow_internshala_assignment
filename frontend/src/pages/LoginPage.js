import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const styles = {
  page: { minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif", padding: '1rem' },
  card: { background: '#111118', border: '1px solid #1e1e2e', borderRadius: '16px', padding: '2.5rem', width: '100%', maxWidth: '420px', boxShadow: '0 25px 80px rgba(124,106,247,0.12)' },
  logo: { textAlign: 'center', marginBottom: '2rem' },
  logoText: { fontSize: '1.75rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em' },
  logoAccent: { color: '#7c6af7' },
  title: { fontSize: '1.4rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem' },
  subtitle: { color: '#666', fontSize: '0.875rem', marginBottom: '1.75rem' },
  label: { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#aaa', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' },
  input: { width: '100%', background: '#1a1a28', border: '1px solid #2a2a3e', borderRadius: '10px', padding: '0.8rem 1rem', color: '#fff', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' },
  group: { marginBottom: '1.2rem' },
  btn: { width: '100%', background: 'linear-gradient(135deg, #7c6af7, #5b4ee8)', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.9rem', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', marginTop: '0.5rem', transition: 'opacity 0.2s' },
  error: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.875rem', marginBottom: '1rem' },
  footer: { textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#666' },
  link: { color: '#7c6af7', textDecoration: 'none', fontWeight: 600 },
};

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&display=swap" rel="stylesheet" />
      <div style={styles.card}>
        <div style={styles.logo}>
          <div style={styles.logoText}>Task<span style={styles.logoAccent}>Flow</span></div>
        </div>
        <div style={styles.title}>Welcome back</div>
        <div style={styles.subtitle}>Sign in to your account</div>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={styles.group}>
            <label style={styles.label}>Email</label>
            <input style={styles.input} name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
          </div>
          <div style={styles.group}>
            <label style={styles.label}>Password</label>
            <input style={styles.input} name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••" required />
          </div>
          <button style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }} type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div style={styles.footer}>
          Don't have an account? <Link to="/register" style={styles.link}>Register</Link>
        </div>
      </div>
    </div>
  );
}
