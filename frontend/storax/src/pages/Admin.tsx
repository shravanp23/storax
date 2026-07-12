import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Users, HardDrive, Activity, DollarSign, Send, Mail, TrendingUp, Shield } from 'lucide-react';

const Admin: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/admin/stats'),
      api.get('/api/admin/users')
    ]).then(([s, u]) => {
      setStats(s.data);
      setUsers(u.data);
    }).finally(() => setLoading(false));
  }, []);

  const sendBroadcast = async () => {
    if (!subject.trim() || !message.trim()) { toast.error('Enter subject and message'); return; }
    setSending(true);
    try {
      const res = await api.post('/api/admin/broadcast-email', { subject, message });
      setBroadcastResult(res.data);
      toast.success(`Email sent to ${res.data.sent} users!`);
      setSubject(''); setMessage('');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to send');
    } finally { setSending(false); }
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0F172A', marginBottom: '4px', letterSpacing: '-0.3px' }}>Admin Panel</h1>
        <p style={{ color: '#6B7280', fontSize: '14px' }}>Platform overview and management</p>
      </div>

      {/* Stats */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Total Users', value: stats.total_users, icon: Users, color: '#2563EB', bg: '#EFF6FF' },
            { label: 'Total Files', value: stats.total_files, icon: HardDrive, color: '#059669', bg: '#F0FDF4' },
            { label: 'Total Requests', value: stats.total_requests, icon: Activity, color: '#D97706', bg: '#FFFBEB' },
            { label: 'Total Revenue', value: `$${stats.total_revenue}`, icon: DollarSign, color: '#7C3AED', bg: '#F5F3FF' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '20px', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = '#D1D5DB'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#E5E7EB'; }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={20} color={color} />
                </div>
                <TrendingUp size={14} color="#22C55E" />
              </div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#0F172A', marginBottom: '4px', letterSpacing: '-0.5px' }}>{value}</div>
              <div style={{ fontSize: '13px', color: '#6B7280', fontWeight: '500' }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Broadcast Email */}
      <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
          <div style={{ width: '44px', height: '44px', background: '#EFF6FF', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Mail size={22} color="#2563EB" />
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', marginBottom: '2px' }}>Broadcast Email</h3>
            <p style={{ fontSize: '13px', color: '#6B7280' }}>Send email to all {users.length} registered users</p>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Subject</label>
            <input placeholder="e.g. New feature announcement..." value={subject} onChange={e => setSubject(e.target.value)} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Message</label>
            <textarea placeholder="Write your message to all users..." value={message} onChange={e => setMessage(e.target.value)} rows={5} style={{ resize: 'vertical' }} />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <span style={{ fontSize: '13px', color: '#6B7280' }}>
            Will be sent to <strong style={{ color: '#0F172A' }}>{users.length} users</strong>
          </span>
          <button onClick={sendBroadcast} disabled={sending} className="btn-primary" style={{ borderRadius: '10px', padding: '10px 20px' }}>
            <Send size={16} /> {sending ? 'Sending...' : 'Send to All Users'}
          </button>
        </div>

        {broadcastResult && (
          <div style={{ marginTop: '16px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '12px', padding: '14px 16px' }}>
            <p style={{ color: '#16A34A', fontWeight: '600', margin: '0 0 4px', fontSize: '14px' }}>✅ Broadcast complete!</p>
            <p style={{ color: '#6B7280', fontSize: '13px', margin: 0 }}>
              Sent: <strong style={{ color: '#16A34A' }}>{broadcastResult.sent}</strong> · Failed: <strong style={{ color: broadcastResult.failed > 0 ? '#DC2626' : '#6B7280' }}>{broadcastResult.failed}</strong>
            </p>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #F3F4F6' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', marginBottom: '2px' }}>All Users</h3>
          <p style={{ fontSize: '13px', color: '#6B7280' }}>{users.length} registered users</p>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Files</th>
                <th>Storage</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: 'white' }}>{u.full_name?.charAt(0)}</span>
                      </div>
                      <span style={{ fontWeight: '600', fontSize: '14px', color: '#111827' }}>{u.full_name}</span>
                    </div>
                  </td>
                  <td style={{ color: '#6B7280', fontSize: '13px' }}>{u.email}</td>
                  <td style={{ fontSize: '14px', fontWeight: '500' }}>{u.total_files}</td>
                  <td style={{ fontSize: '14px', fontWeight: '500' }}>{(u.storage_bytes / 1024 / 1024).toFixed(2)} MB</td>
                  <td>
                    {u.is_admin ? (
                      <span className="badge badge-primary"><Shield size={10} /> Admin</span>
                    ) : (
                      <span className="badge badge-gray">User</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${u.is_active ? 'badge-success' : 'badge-danger'}`}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Admin;