import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Shield, Upload, Download, Trash2, Share2, FileText, LogIn, Key, RefreshCw, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const getActionStyle = (action: string) => {
  if (action.includes('LOGIN') || action.includes('REGISTER')) return { color: '#059669', bg: '#F0FDF4', icon: <LogIn size={13} /> };
  if (action.includes('UPLOAD')) return { color: '#2563EB', bg: '#EFF6FF', icon: <Upload size={13} /> };
  if (action.includes('DOWNLOAD')) return { color: '#D97706', bg: '#FFFBEB', icon: <Download size={13} /> };
  if (action.includes('DELETE')) return { color: '#DC2626', bg: '#FEF2F2', icon: <Trash2 size={13} /> };
  if (action.includes('SHARE')) return { color: '#059669', bg: '#F0FDF4', icon: <Share2 size={13} /> };
  if (action.includes('INVOICE')) return { color: '#7C3AED', bg: '#F5F3FF', icon: <FileText size={13} /> };
  return { color: '#6B7280', bg: '#F9FAFB', icon: <Shield size={13} /> };
};

const AuditLogs: React.FC = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  const loadLogs = async () => {
    setLoading(true);
    try {
      const endpoint = user?.is_admin ? '/api/audit/admin/all-logs' : '/api/audit/my-logs';
      const res = await api.get(endpoint);
      setLogs(res.data);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { loadLogs(); }, [user]);

  const filters = ['ALL', 'LOGIN', 'UPLOAD', 'DOWNLOAD', 'DELETE', 'SHARE', 'INVOICE'];
  const filtered = filter === 'ALL' ? logs : logs.filter(l => l.action.includes(filter));

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0F172A', marginBottom: '4px', letterSpacing: '-0.3px' }}>
            {user?.is_admin ? 'Platform Audit Logs' : 'Activity Logs'}
          </h1>
          <p style={{ color: '#6B7280', fontSize: '14px' }}>
            {user?.is_admin ? 'Complete activity history for all users' : 'Your personal activity history'}
          </p>
        </div>
        <button onClick={loadLogs} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', border: '1px solid #E5E7EB', color: '#374151', padding: '9px 16px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', fontFamily: 'Inter, sans-serif', transition: 'all 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
          onMouseLeave={e => e.currentTarget.style.background = 'white'}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {user?.is_admin && (
        <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '12px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Lock size={16} color="#2563EB" />
          <span style={{ fontSize: '13px', color: '#1D4ED8', fontWeight: '600' }}>Admin View — Showing all users activity across the platform</span>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Total', value: logs.length, color: '#2563EB' },
          { label: 'Uploads', value: logs.filter(l => l.action.includes('UPLOAD')).length, color: '#059669' },
          { label: 'Downloads', value: logs.filter(l => l.action.includes('DOWNLOAD')).length, color: '#D97706' },
          { label: 'Deletions', value: logs.filter(l => l.action.includes('DELETE')).length, color: '#DC2626' },
          { label: 'Logins', value: logs.filter(l => l.action.includes('LOGIN')).length, color: '#7C3AED' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '22px', fontWeight: '700', color, marginBottom: '4px' }}>{value}</div>
            <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            background: filter === f ? '#0F172A' : 'white',
            border: `1px solid ${filter === f ? '#0F172A' : '#E5E7EB'}`,
            color: filter === f ? 'white' : '#374151',
            padding: '6px 14px', borderRadius: '100px', cursor: 'pointer',
            fontSize: '13px', fontWeight: '500', transition: 'all 0.15s', fontFamily: 'Inter, sans-serif'
          }}>
            {f}
          </button>
        ))}
      </div>

      {/* Logs Table */}
      <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '16px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#6B7280', fontSize: '14px' }}>Loading logs...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <Shield size={40} color="#D1D5DB" style={{ marginBottom: '16px' }} />
            <p style={{ fontSize: '14px', color: '#9CA3AF' }}>No logs found</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Action</th>
                  {user?.is_admin && <th>User</th>}
                  <th>Details</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(log => {
                  const style = getActionStyle(log.action);
                  return (
                    <tr key={log.id}>
                      <td>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: style.bg, color: style.color, padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>
                          {style.icon} {log.action}
                        </div>
                      </td>
                      {user?.is_admin && (
                        <td>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: '#111827' }}>{log.user_name || '—'}</div>
                          <div style={{ fontSize: '11px', color: '#6B7280' }}>{log.user_email || ''}</div>
                        </td>
                      )}
                      <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#6B7280', fontSize: '13px' }}>
                        {log.details || '—'}
                      </td>
                      <td>
                        <span className={`badge ${log.status === 'success' ? 'badge-success' : 'badge-danger'}`}>
                          {log.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '12px', color: '#6B7280', whiteSpace: 'nowrap' }}>
                        {new Date(log.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;