import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usersApi, tasksApi } from '../api';

const S = {
  page: { minHeight: '100vh', background: '#0a0a0f', fontFamily: "'DM Sans', sans-serif", color: '#fff' },
  nav: { background: '#111118', borderBottom: '1px solid #1e1e2e', padding: '0 2rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 },
  logo: { fontSize: '1.3rem', fontWeight: 800 },
  accent: { color: '#7c6af7' },
  navRight: { display: 'flex', gap: '1rem', alignItems: 'center' },
  backLink: { color: '#7c6af7', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 },
  adminBadge: { background: 'rgba(239,68,68,0.15)', color: '#f87171', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' },
  main: { maxWidth: '1100px', margin: '0 auto', padding: '2rem' },
  title: { fontSize: '1.75rem', fontWeight: 800, marginBottom: '2rem', letterSpacing: '-0.03em' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2.5rem' },
  statCard: { background: '#111118', border: '1px solid #1e1e2e', borderRadius: '14px', padding: '1.25rem' },
  statLabel: { color: '#666', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' },
  statValue: { fontSize: '2rem', fontWeight: 800, color: '#fff' },
  section: { marginBottom: '2.5rem' },
  sectionTitle: { fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: '#aaa' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '0.75rem 1rem', fontSize: '0.78rem', fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #1e1e2e' },
  td: { padding: '0.9rem 1rem', fontSize: '0.9rem', color: '#ccc', borderBottom: '1px solid #111' },
  tableWrap: { background: '#111118', border: '1px solid #1e1e2e', borderRadius: '14px', overflow: 'hidden' },
  pill: { padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' },
  select: { background: '#1a1a28', border: '1px solid #2a2a3e', color: '#fff', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' },
  deactivateBtn: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', padding: '0.3rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' },
  loading: { textAlign: 'center', padding: '4rem', color: '#555' },
};

export default function AdminPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [usersRes, statsRes] = await Promise.all([usersApi.getAll({ limit: 50 }), tasksApi.getStats()]);
        setUsers(usersRes.data.data);
        setStats(statsRes.data.data);
      } catch { showToast('Failed to load data', 'error'); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleRoleChange = async (userId, role) => {
    try {
      await usersApi.updateRole(userId, role);
      setUsers(users.map(u => u._id === userId ? { ...u, role } : u));
      showToast('Role updated');
    } catch { showToast('Failed to update role', 'error'); }
  };

  const handleDeactivate = async (userId) => {
    if (!window.confirm('Deactivate this user?')) return;
    try {
      await usersApi.deactivate(userId);
      setUsers(users.map(u => u._id === userId ? { ...u, isActive: false } : u));
      showToast('User deactivated');
    } catch { showToast('Failed to deactivate', 'error'); }
  };

  const getStatusCount = (status) => stats?.byStatus?.find(s => s._id === status)?.count || 0;
  const totalTasks = stats?.byStatus?.reduce((acc, s) => acc + s.count, 0) || 0;

  return (
    <div style={S.page}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&display=swap" rel="stylesheet" />
      <nav style={S.nav}>
        <div style={S.logo}>Task<span style={S.accent}>Flow</span></div>
        <div style={S.navRight}>
          <Link to="/dashboard" style={S.backLink}>← Back to Dashboard</Link>
          <span style={S.adminBadge}>Admin</span>
          <span style={{ color: '#666', fontSize: '0.875rem' }}>{user?.name}</span>
        </div>
      </nav>

      <main style={S.main}>
        <div style={S.title}>Admin Panel</div>

        {loading ? <div style={S.loading}>Loading...</div> : (
          <>
            {/* Stats */}
            <div style={S.statsGrid}>
              <div style={S.statCard}>
                <div style={S.statLabel}>Total Users</div>
                <div style={S.statValue}>{users.length}</div>
              </div>
              <div style={S.statCard}>
                <div style={S.statLabel}>Total Tasks</div>
                <div style={{ ...S.statValue, color: '#7c6af7' }}>{totalTasks}</div>
              </div>
              <div style={S.statCard}>
                <div style={S.statLabel}>Completed</div>
                <div style={{ ...S.statValue, color: '#34d399' }}>{getStatusCount('completed')}</div>
              </div>
              <div style={S.statCard}>
                <div style={S.statLabel}>In Progress</div>
                <div style={{ ...S.statValue, color: '#fbbf24' }}>{getStatusCount('in-progress')}</div>
              </div>
              <div style={S.statCard}>
                <div style={S.statLabel}>To Do</div>
                <div style={{ ...S.statValue, color: '#888' }}>{getStatusCount('todo')}</div>
              </div>
            </div>

            {/* Users Table */}
            <div style={S.section}>
              <div style={S.sectionTitle}>User Management</div>
              <div style={S.tableWrap}>
                <table style={S.table}>
                  <thead>
                    <tr>
                      <th style={S.th}>Name</th>
                      <th style={S.th}>Email</th>
                      <th style={S.th}>Role</th>
                      <th style={S.th}>Status</th>
                      <th style={S.th}>Joined</th>
                      <th style={S.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id}>
                        <td style={S.td}>{u.name}</td>
                        <td style={S.td}>{u.email}</td>
                        <td style={S.td}>
                          {u._id !== user?._id ? (
                            <select style={S.select} value={u.role} onChange={e => handleRoleChange(u._id, e.target.value)}>
                              <option value="user">user</option>
                              <option value="admin">admin</option>
                            </select>
                          ) : (
                            <span style={{ ...S.pill, background: 'rgba(239,68,68,0.15)', color: '#f87171' }}>{u.role}</span>
                          )}
                        </td>
                        <td style={S.td}>
                          <span style={{ ...S.pill, ...(u.isActive ? { background: 'rgba(52,211,153,0.1)', color: '#34d399' } : { background: 'rgba(100,100,120,0.15)', color: '#666' }) }}>
                            {u.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={S.td}>{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td style={S.td}>
                          {u._id !== user?._id && u.isActive && (
                            <button style={S.deactivateBtn} onClick={() => handleDeactivate(u._id)}>Deactivate</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>

      {toast && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', padding: '0.8rem 1.5rem', borderRadius: '10px', fontWeight: 600, fontSize: '0.9rem', zIndex: 300, background: toast.type === 'error' ? 'rgba(239,68,68,0.9)' : 'rgba(52,211,153,0.9)', color: '#fff' }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
