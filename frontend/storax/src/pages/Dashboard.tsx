import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { HardDrive, FileText, Activity, DollarSign, TrendingUp, Upload, ArrowRight, Cloud } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [usage, setUsage] = useState<any>(null);
  const [bill, setBill] = useState<any>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/storage/summary').then((res) => {
      setUsage(res.data.usage);
      setBill(res.data.bill);
      setFiles(res.data.files);
    }).finally(() => setLoading(false));
  }, []);

  const totalMB = usage ? (usage.total_bytes / (1024 * 1024)).toFixed(2) : '0';

  const areaData = [
    { name: 'Mon', storage: 0.1, requests: 2 },
    { name: 'Tue', storage: 0.2, requests: 5 },
    { name: 'Wed', storage: 0.4, requests: 8 },
    { name: 'Thu', storage: 0.5, requests: 12 },
    { name: 'Fri', storage: 0.7, requests: 18 },
    { name: 'Sat', storage: 0.9, requests: 22 },
    { name: 'Now', storage: parseFloat(totalMB) / 1024 || 0.1, requests: usage?.total_requests || 0 },
  ];

  const pieData = [
    { name: 'Storage', value: bill?.storage_cost || 0.01, color: '#2563EB' },
    { name: 'Requests', value: bill?.request_cost || 0.01, color: '#7C3AED' },
    { name: 'Bandwidth', value: bill?.bandwidth_cost || 0.01, color: '#0891B2' },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '12px 16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '6px' }}>{label}</p>
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
      <div>
        <div style={{ height: '28px', width: '200px', borderRadius: '8px', marginBottom: '8px' }} className="skeleton" />
        <div style={{ height: '16px', width: '300px', borderRadius: '6px', marginBottom: '32px' }} className="skeleton" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          {[1,2,3,4].map(i => <div key={i} style={{ height: '120px', borderRadius: '12px' }} className="skeleton" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0F172A', marginBottom: '4px', letterSpacing: '-0.3px' }}>
            Welcome back, {user?.full_name?.split(' ')[0]} 👋
          </h1>
          <p style={{ color: '#6B7280', fontSize: '14px' }}>Here's what's happening with your storage</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '100px', padding: '6px 14px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 4px #22C55E' }} />
          <span style={{ fontSize: '12px', color: '#16A34A', fontWeight: '600' }}>All systems operational</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Files', value: usage?.total_files ?? 0, sub: 'In your bucket', icon: FileText, color: '#2563EB', bg: '#EFF6FF' },
          { label: 'Storage Used', value: `${totalMB} MB`, sub: 'Cloud storage', icon: HardDrive, color: '#059669', bg: '#F0FDF4' },
          { label: 'API Requests', value: usage?.total_requests ?? 0, sub: 'Total operations', icon: Activity, color: '#D97706', bg: '#FFFBEB' },
          { label: 'Current Bill', value: `$${bill?.total_amount ?? '0.00'}`, sub: 'This month', icon: DollarSign, color: '#7C3AED', bg: '#F5F3FF' },
        ].map(({ label, value, sub, icon: Icon, color, bg }) => (
          <div key={label} style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '20px', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = '#D1D5DB'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#E5E7EB'; }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={20} color={color} />
              </div>
              <TrendingUp size={14} color="#22C55E" />
            </div>
            <div style={{ fontSize: '26px', fontWeight: '700', color: '#0F172A', marginBottom: '4px', letterSpacing: '-0.5px' }}>{value}</div>
            <div style={{ fontSize: '13px', color: '#6B7280' }}>{sub}</div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280', marginTop: '4px' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '16px' }}>
        {/* Area Chart */}
        <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A', marginBottom: '2px' }}>Storage Growth</h3>
              <p style={{ fontSize: '12px', color: '#6B7280' }}>Weekly usage trend</p>
            </div>
            <span style={{ fontSize: '11px', fontWeight: '600', background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', padding: '3px 10px', borderRadius: '100px' }}>This Week</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={areaData}>
              <defs>
                <linearGradient id="storageGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="storage" name="Storage (GB)" stroke="#2563EB" fill="url(#storageGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A', marginBottom: '4px' }}>Cost Breakdown</h3>
          <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '20px' }}>Current billing period</p>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value" strokeWidth={0}>
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
            {pieData.map(({ name, color, value }) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: color }} />
                  <span style={{ fontSize: '12px', color: '#6B7280' }}>{name}</span>
                </div>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#111827' }}>${value.toFixed(4)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Bucket Info */}
        <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A', marginBottom: '16px' }}>Your Storage Bucket</h3>
          <div style={{ background: '#F8FAFC', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '40px', height: '40px', background: '#EFF6FF', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Cloud size={20} color="#2563EB" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '2px' }}>Bucket identifier</div>
              <div style={{ fontWeight: '600', fontFamily: 'monospace', fontSize: '14px', color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.bucket_name}</div>
            </div>
            <span className="badge badge-success">Active</span>
          </div>
          <button onClick={() => navigate('/files')} style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            background: '#0F172A', color: 'white', border: 'none', padding: '11px', borderRadius: '100px',
            fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter, sans-serif'
          }}>
            <Upload size={14} /> Upload Files
          </button>
        </div>

        {/* Recent Files */}
        <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A' }}>Recent Files</h3>
            <button onClick={() => navigate('/files')} style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'Inter, sans-serif' }}>
              View all <ArrowRight size={12} />
            </button>
          </div>
          {files.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#6B7280' }}>
              <Upload size={32} style={{ marginBottom: '8px', opacity: 0.3 }} />
              <p style={{ fontSize: '14px' }}>No files yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {files.slice(0, 4).map((file: any) => (
                <div key={file.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '10px', background: '#F9FAFB' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>
                    {file.content_type?.startsWith('image/') ? '🖼️' : file.content_type?.includes('pdf') ? '📄' : '📁'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.filename}</div>
                    <div style={{ fontSize: '11px', color: '#6B7280' }}>{(file.size_bytes / 1024).toFixed(1)} KB</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;