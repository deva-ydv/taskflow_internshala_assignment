import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tasksApi } from '../api';

const S = {
  page: { minHeight: '100vh', background: '#0a0a0f', fontFamily: "'DM Sans', sans-serif", color: '#fff' },
  nav: { background: '#111118', borderBottom: '1px solid #1e1e2e', padding: '0 2rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 },
  logo: { fontSize: '1.3rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em' },
  accent: { color: '#7c6af7' },
  navRight: { display: 'flex', alignItems: 'center', gap: '1rem' },
  badge: { background: 'rgba(124,106,247,0.2)', color: '#7c6af7', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' },
  userName: { color: '#aaa', fontSize: '0.875rem' },
  logoutBtn: { background: 'transparent', border: '1px solid #2a2a3e', color: '#888', padding: '0.4rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem' },
  main: { maxWidth: '1100px', margin: '0 auto', padding: '2rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' },
  pageTitle: { fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em' },
  addBtn: { background: 'linear-gradient(135deg, #7c6af7, #5b4ee8)', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.65rem 1.25rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' },
  filters: { display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' },
  filterBtn: { background: '#1a1a28', border: '1px solid #2a2a3e', color: '#888', padding: '0.4rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.825rem', fontWeight: 600, transition: 'all 0.2s' },
  filterBtnActive: { background: 'rgba(124,106,247,0.2)', border: '1px solid #7c6af7', color: '#7c6af7' },
  grid: { display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' },
  card: { background: '#111118', border: '1px solid #1e1e2e', borderRadius: '14px', padding: '1.25rem', transition: 'border-color 0.2s' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' },
  cardTitle: { fontWeight: 700, fontSize: '1rem', color: '#fff', flex: 1, marginRight: '0.5rem' },
  cardDesc: { color: '#666', fontSize: '0.875rem', marginBottom: '1rem', lineHeight: 1.5 },
  cardFooter: { display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' },
  pill: { padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' },
  cardActions: { display: 'flex', gap: '0.5rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #1e1e2e' },
  editBtn: { background: '#1a1a28', border: '1px solid #2a2a3e', color: '#aaa', padding: '0.35rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' },
  deleteBtn: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', padding: '0.35rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' },
  empty: { textAlign: 'center', padding: '4rem 2rem', color: '#444' },
  emptyIcon: { fontSize: '3rem', marginBottom: '1rem' },
  modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' },
  modalCard: { background: '#111118', border: '1px solid #2a2a3e', borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto' },
  modalTitle: { fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem', color: '#fff' },
  label: { display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#aaa', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' },
  input: { width: '100%', background: '#1a1a28', border: '1px solid #2a2a3e', borderRadius: '8px', padding: '0.7rem 0.9rem', color: '#fff', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' },
  select: { width: '100%', background: '#1a1a28', border: '1px solid #2a2a3e', borderRadius: '8px', padding: '0.7rem 0.9rem', color: '#fff', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' },
  textarea: { width: '100%', background: '#1a1a28', border: '1px solid #2a2a3e', borderRadius: '8px', padding: '0.7rem 0.9rem', color: '#fff', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', resize: 'vertical', minHeight: '80px' },
  formGroup: { marginBottom: '1.1rem' },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  modalFooter: { display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' },
  cancelBtn: { background: 'transparent', border: '1px solid #2a2a3e', color: '#888', padding: '0.65rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 },
  saveBtn: { background: 'linear-gradient(135deg, #7c6af7, #5b4ee8)', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.65rem 1.5rem', fontWeight: 700, cursor: 'pointer' },
  toast: { position: 'fixed', bottom: '2rem', right: '2rem', padding: '0.8rem 1.5rem', borderRadius: '10px', fontWeight: 600, fontSize: '0.9rem', zIndex: 300 },
  adminLink: { background: 'rgba(124,106,247,0.1)', border: '1px solid rgba(124,106,247,0.3)', color: '#7c6af7', padding: '0.4rem 1rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' },
  pagination: { display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '2rem', alignItems: 'center' },
  pageBtn: { background: '#1a1a28', border: '1px solid #2a2a3e', color: '#aaa', padding: '0.4rem 0.9rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem' },
};

const STATUS_COLORS = { 'todo': { bg: 'rgba(100,100,120,0.2)', color: '#888' }, 'in-progress': { bg: 'rgba(251,191,36,0.15)', color: '#fbbf24' }, 'completed': { bg: 'rgba(52,211,153,0.15)', color: '#34d399' } };
const PRIORITY_COLORS = { low: { bg: 'rgba(52,211,153,0.1)', color: '#34d399' }, medium: { bg: 'rgba(251,191,36,0.1)', color: '#fbbf24' }, high: { bg: 'rgba(239,68,68,0.1)', color: '#f87171' } };

const BLANK_TASK = { title: '', description: '', status: 'todo', priority: 'medium', dueDate: '' };

export default function DashboardPage() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null); // null | 'create' | 'edit'
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm] = useState(BLANK_TASK);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 9 };
      if (statusFilter) params.status = statusFilter;
      const { data } = await tasksApi.getAll(params);
      setTasks(data.data);
      setPagination(data.pagination);
    } catch { showToast('Failed to load tasks', 'error'); }
    finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const openCreate = () => { setForm(BLANK_TASK); setEditingTask(null); setModal('create'); };
  const openEdit = (task) => { setEditingTask(task); setForm({ title: task.title, description: task.description || '', status: task.status, priority: task.priority, dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '' }); setModal('edit'); };
  const closeModal = () => { setModal(null); setEditingTask(null); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.dueDate) delete payload.dueDate;
      if (modal === 'create') { await tasksApi.create(payload); showToast('Task created!'); }
      else { await tasksApi.update(editingTask._id, payload); showToast('Task updated!'); }
      closeModal(); fetchTasks();
    } catch (err) { showToast(err.response?.data?.message || 'Save failed', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try { await tasksApi.delete(id); showToast('Task deleted'); fetchTasks(); }
    catch { showToast('Delete failed', 'error'); }
  };

  const handleLogout = async () => { await logout(); navigate('/login'); };

  return (
    <div style={S.page}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&display=swap" rel="stylesheet" />
      {/* Navbar */}
      <nav style={S.nav}>
        <div style={S.logo}>Task<span style={S.accent}>Flow</span></div>
        <div style={S.navRight}>
          {isAdmin && <Link to="/admin" style={S.adminLink}>Admin Panel</Link>}
          <span style={S.badge}>{user?.role}</span>
          <span style={S.userName}>{user?.name}</span>
          <button style={S.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <main style={S.main}>
        <div style={S.header}>
          <div style={S.pageTitle}>My Tasks</div>
          <button style={S.addBtn} onClick={openCreate}>+ New Task</button>
        </div>

        {/* Filters */}
        <div style={S.filters}>
          {['', 'todo', 'in-progress', 'completed'].map((s) => (
            <button key={s} style={{ ...S.filterBtn, ...(statusFilter === s ? S.filterBtnActive : {}) }} onClick={() => { setStatusFilter(s); setPage(1); }}>
              {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Task Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#555' }}>Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div style={S.empty}>
            <div style={S.emptyIcon}>📋</div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem', color: '#666' }}>No tasks yet</div>
            <div style={{ color: '#444', fontSize: '0.875rem' }}>Click "New Task" to get started</div>
          </div>
        ) : (
          <div style={S.grid}>
            {tasks.map((task) => (
              <div key={task._id} style={S.card}>
                <div style={S.cardHeader}>
                  <div style={S.cardTitle}>{task.title}</div>
                  <span style={{ ...S.pill, ...PRIORITY_COLORS[task.priority] }}>{task.priority}</span>
                </div>
                {task.description && <div style={S.cardDesc}>{task.description}</div>}
                <div style={S.cardFooter}>
                  <span style={{ ...S.pill, ...STATUS_COLORS[task.status] }}>{task.status}</span>
                  {task.dueDate && <span style={{ ...S.pill, background: 'rgba(100,100,120,0.15)', color: '#777' }}>Due: {new Date(task.dueDate).toLocaleDateString()}</span>}
                  {task.isOverdue && <span style={{ ...S.pill, background: 'rgba(239,68,68,0.15)', color: '#f87171' }}>Overdue</span>}
                </div>
                <div style={S.cardActions}>
                  <button style={S.editBtn} onClick={() => openEdit(task)}>Edit</button>
                  <button style={S.deleteBtn} onClick={() => handleDelete(task._id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div style={S.pagination}>
            <button style={S.pageBtn} disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
            <span style={{ color: '#666', fontSize: '0.875rem' }}>Page {page} of {pagination.totalPages}</span>
            <button style={S.pageBtn} disabled={page === pagination.totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        )}
      </main>

      {/* Modal */}
      {modal && (
        <div style={S.modal} onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div style={S.modalCard}>
            <div style={S.modalTitle}>{modal === 'create' ? 'Create New Task' : 'Edit Task'}</div>
            <form onSubmit={handleSave}>
              <div style={S.formGroup}>
                <label style={S.label}>Title *</label>
                <input style={S.input} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Task title..." required />
              </div>
              <div style={S.formGroup}>
                <label style={S.label}>Description</label>
                <textarea style={S.textarea} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Optional description..." />
              </div>
              <div style={S.formRow}>
                <div style={S.formGroup}>
                  <label style={S.label}>Status</label>
                  <select style={S.select} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div style={S.formGroup}>
                  <label style={S.label}>Priority</label>
                  <select style={S.select} value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div style={S.formGroup}>
                <label style={S.label}>Due Date</label>
                <input style={S.input} type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
              </div>
              <div style={S.modalFooter}>
                <button type="button" style={S.cancelBtn} onClick={closeModal}>Cancel</button>
                <button type="submit" style={{ ...S.saveBtn, opacity: saving ? 0.7 : 1 }} disabled={saving}>
                  {saving ? 'Saving...' : modal === 'create' ? 'Create Task' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ ...S.toast, background: toast.type === 'error' ? 'rgba(239,68,68,0.9)' : 'rgba(52,211,153,0.9)', color: '#fff' }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
