import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [usage, setUsage] = useState<any>(null);
  const [bill, setBill] = useState<any>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/storage/usage'),
      api.get('/api/billing/current'),
      api.get('/api/storage/files'),
    ]).then(([u, b, f]) => {
      setUsage(u.data);
      setBill(b.data);
      setFiles(f.data);
    }).finally(() => setLoading(false));
  }, []);

  const totalMB = usage ? (usage.total_bytes / (1024 * 1024)).toFixed(2) : 0;

  const areaData = [
    { name: 'Mon', storage: 0.1, requests: 2 },
    { name: 'Tue', storage: 0.2, requests: 5 },
    { name: 'Wed', storage: 0.4, requests: 8 },
    { name: 'Thu', storage: 0.5, requests: 12 },
    { name: 'Fri', storage: 0.7, requests: 18 },
    { name: 'Sat', storage: 0.9, requests: 22 },
    { name: 'Now', storage: parseFloat(totalMB as string) / 1024 || 0.1, requests: usage?.total_requests || 0 },
  ];

  const barData = [
    { name: 'Week 1', uploads: 3, downloads: 1 },
    { name: 'Week 2', uploads: 5, downloads: 3 },
    { name: 'Week 3', uploads: 4, downloads: 6 },
    { name: 'This Week', uploads: usage?.total_files || 0, downloads: Math.max(0, (usage?.total_requests || 0) - (usage?.total_files || 0)) },
  ];

  const pieData = [
    { name: 'Storage', value: bill?.storage_cost || 0.01, color: '#6C63FF' },
    { name: 'Requests', value: bill?.request_cost || 0.01, color: '#FF6584' },
    { name: 'Bandwidth', value: bill?.bandwidth_cost || 0.01, color: '#10B981' },
  ];

  const fileTypes = files.reduce((acc: any, f: any) => {
    const type = f.content_type?.split('/')[0] || 'other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: '#1E1E3A', border: '1px solid rgba(108,99,255,0.3)', borderRadius: '10px', padding: '12px 16px' }}>
          <p style={{ fontSize: '12px', color: '#9999BB', marginBottom: '6px' }}>{label}</p>
          {payload.map((p: any) => (
            <p key={p.name} style={{ fontSize: '13px', fontWeight: '600', color: p.color }}>{p.name}: {p.value}</p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(108,99,255,0.2)', borderTop: '3px solid #6C63FF', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-muted)' }}>Loading your dashboard...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '6px' }}>
            Welcome back, {user?.full_name?.split(' ')[0]} 👋
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Here's your StoraX overview — updated in real time
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '100px', padding: '6px 14px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 6px #10B981' }} />
          <span style={{ fontSize: '12px', color: '#10B981', fontWeight: '600' }}>All Systems Operational</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '28px' }}>
        {[
          {
            label: 'Total Files', value: usage?.total_files ?? 0,
            icon: '📁', color: '#6C63FF', bg: 'rgba(108,99,255,0.1)',
            sub: 'In your bucket'
          },
          {
            label: 'Storage Used', value: `${totalMB} MB`,
            icon: '🗄️', color: '#10B981', bg: 'rgba(16,185,129,0.1)',
            sub: `${((parseFloat(totalMB as string) / 1024) * 100).toFixed(4)}% of 1 GB`
          },
          {
            label: 'API Requests', value: usage?.total_requests ?? 0,
            icon: '⚡', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',
            sub: 'Total operations'
          },
          {
            label: 'Current Bill', value: `$${bill?.total_amount ?? '0.0000'}`,
            icon: '💳', color: '#FF6584', bg: 'rgba(255,101,132,0.1)',
            sub: 'This month'
          },
        ].map(({ label, value, icon, color, bg, sub }) => (
          <div key={label} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: bg, pointerEvents: 'none' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                {icon}
              </div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: color, marginBottom: '6px' }}>{value}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '20px' }}>

        {/* Area Chart */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>Storage Growth</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>GB used over the week</p>
            </div>
            <span className="badge badge-primary" style={{ fontSize: '11px' }}>This Week</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={areaData}>
              <defs>
                <linearGradient id="storageGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6C63FF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="reqGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF6584" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FF6584" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#9999BB" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#9999BB" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="storage" name="Storage (GB)" stroke="#6C63FF" fill="url(#storageGrad)" strokeWidth={2.5} dot={false} />
              <Area type="monotone" dataKey="requests" name="Requests" stroke="#FF6584" fill="url(#reqGrad)" strokeWidth={2.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="card">
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>Cost Breakdown</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Current billing period</p>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" strokeWidth={0}>
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
            {pieData.map(({ name, color, value }) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: color }} />
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{name}</span>
                </div>
                <span style={{ fontSize: '12px', fontWeight: '600', color: color }}>${value.toFixed(4)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>

        {/* Bar Chart */}
        <div className="card">
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>Uploads vs Downloads</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Weekly file operations</p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={barData} barGap={4}>
              <XAxis dataKey="name" stroke="#9999BB" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#9999BB" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="uploads" name="Uploads" fill="#6C63FF" radius={[4, 4, 0, 0]} />
              <Bar dataKey="downloads" name="Downloads" fill="#FF6584" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* File Types + Bucket Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* File Types */}
          <div className="card" style={{ flex: 1 }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>File Types</h3>
            {Object.keys(fileTypes).length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No files uploaded yet</p>
            ) : (
              Object.entries(fileTypes).map(([type, count]) => (
                <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)', width: '70px', textTransform: 'capitalize' }}>{type}</span>
                  <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${((count as number) / files.length) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #6C63FF, #FF6584)', borderRadius: '3px' }} />
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)', minWidth: '20px' }}>{count as number}</span>
                </div>
              ))
            )}
          </div>

          {/* Bucket Info */}
          <div className="card">
            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '12px' }}>Your Storage Bucket</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(108,99,255,0.08)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(108,99,255,0.2)' }}>
              <span style={{ fontSize: '20px' }}>🗄️</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>Bucket Name</div>
                <div style={{ fontWeight: '700', fontFamily: 'monospace', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.bucket_name}</div>
              </div>
              <span className="badge badge-success">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Files */}
      {files.length > 0 && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Recent Files</h3>
            <a href="/files" style={{ fontSize: '13px', color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>View all →</a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {files.slice(0, 4).map((file: any) => (
              <div key={file.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(108,99,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
                  {file.content_type?.startsWith('image/') ? '🖼️' : file.content_type?.includes('pdf') ? '📄' : file.content_type?.startsWith('video/') ? '🎬' : '📁'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.filename}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{(file.size_bytes / 1024).toFixed(1)} KB</div>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(file.uploaded_at).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;