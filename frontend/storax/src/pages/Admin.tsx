import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Users, HardDrive, Activity, DollarSign } from 'lucide-react';

const Admin: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    api.get('/api/admin/stats').then(r => setStats(r.data));
    api.get('/api/admin/users').then(r => setUsers(r.data));
  }, []);

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>Admin Panel</h1>
        <p style={{ color: 'var(--text-muted)' }}>Platform overview and user management</p>
      </div>

      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
          {[
            { label: 'Total Users',    value: stats.total_users,                      icon: Users,      color: '#6C63FF' },
            { label: 'Total Files',    value: stats.total_files,                      icon: HardDrive,  color: '#10B981' },
            { label: 'Total Requests', value: stats.total_requests,                   icon: Activity,   color: '#F59E0B' },
            { label: 'Total Revenue',  value: `$${stats.total_revenue}`,              icon: DollarSign, color: '#FF6584' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>{label}</span>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={18} color={color} />
                </div>
              </div>
              <div style={{ fontSize: '28px', fontWeight: '800' }}>{value}</div>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px' }}>All Users</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['ID', 'Name', 'Email', 'Files', 'Storage', 'Status'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '12px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '14px 12px', color: 'var(--text-muted)' }}>#{u.id}</td>
                  <td style={{ padding: '14px 12px', fontWeight: '600' }}>{u.full_name}</td>
                  <td style={{ padding: '14px 12px', color: 'var(--text-muted)' }}>{u.email}</td>
                  <td style={{ padding: '14px 12px' }}>{u.total_files}</td>
                  <td style={{ padding: '14px 12px' }}>{(u.storage_bytes / 1024 / 1024).toFixed(2)} MB</td>
                  <td style={{ padding: '14px 12px' }}>
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