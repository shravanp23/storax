import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Shield, Upload, Download, Trash2, Share2, FileText, LogIn, Key, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const getActionIcon = (action: string) => {
  if (action.includes('LOGIN')) return <LogIn size={14} color="#10B981" />;
  if (action.includes('UPLOAD')) return <Upload size={14} color="#6C63FF" />;
  if (action.includes('DOWNLOAD')) return <Download size={14} color="#F59E0B" />;
  if (action.includes('DELETE')) return <Trash2 size={14} color="#EF4444" />;
  if (action.includes('SHARE')) return <Share2 size={14} color="#10B981" />;
  if (action.includes('INVOICE')) return <FileText size={14} color="#FF6584" />;
  if (action.includes('REGISTER')) return <Key size={14} color="#8B5CF6" />;
  return <Shield size={14} color="#9999BB" />;
};

const getActionColor = (action: string) => {
  if (action.includes('LOGIN') || action.includes('REGISTER')) return '#10B981';
  if (action.includes('UPLOAD')) return '#6C63FF';
  if (action.includes('DOWNLOAD')) return '#F59E0B';
  if (action.includes('DELETE')) return '#EF4444';
  if (action.includes('SHARE')) return '#10B981';
  if (action.includes('INVOICE')) return '#FF6584';
  return '#9999BB';
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
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { loadLogs(); }, []);

  const filters = ['ALL', 'LOGIN', 'UPLOAD', 'DOWNLOAD', 'DELETE', 'SHARE', 'INVOICE'];
  const filtered = filter === 'ALL' ? logs : logs.filter(l => l.action.includes(filter));

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>Audit Logs</h1>
          <p style={{ color: 'var(--text-muted)' }}>Complete history of all actions</p>
        </div>
        <button onClick={loadLogs} style={{ background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.3)', color: 'var(--primary)', padding: '10px 16px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Actions', value: logs.length, color: '#6C63FF' },
          { label: 'File Uploads', value: logs.filter(l => l.action.includes('UPLOAD')).length, color: '#10B981' },
          { label: 'File Downloads', value: logs.filter(l => l.action.includes('DOWNLOAD')).length, color: '#F59E0B' },
          { label: 'Logins', value: logs.filter(l => l.action.includes('LOGIN')).length, color: '#FF6584' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: '800', color, marginBottom: '4px' }}>{value}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            background: filter === f ? 'rgba(108,99,255,0.2)' : 'transparent',
            border: filter === f ? '1px solid rgba(108,99,255,0.4)' : '1px solid var(--border)',
            color: filter === f ? 'var(--primary)' : 'var(--text-muted)',
            padding: '6px 16px', borderRadius: '20px', cursor: 'pointer',
            fontSize: '13px', fontWeight: filter === f ? '600' : '400',
            transition: 'all 0.2s ease'
          }}>
            {f}
          </button>
        ))}
      </div>

      {/* Logs Table */}
      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading logs...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <Shield size={40} style={{ marginBottom: '12px', opacity: 0.3 }} />
            <p>No logs found</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Action', 'Resource', 'Details', 'Status', 'Time'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(log => (
                  <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: `${getActionColor(log.action)}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {getActionIcon(log.action)}
                        </div>
                        <span style={{ fontWeight: '600', color: getActionColor(log.action), fontSize: '12px' }}>{log.action}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '11px', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {log.resource || '—'}
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {log.details || '—'}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span className={`badge ${log.status === 'success' ? 'badge-success' : 'badge-danger'}`}>
                        {log.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '12px', whiteSpace: 'nowrap' }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;