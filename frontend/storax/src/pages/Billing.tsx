import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { DollarSign, Download, FileText, Zap, TrendingUp, CreditCard, Calendar } from 'lucide-react';

const Billing: React.FC = () => {
  const [currentBill, setCurrentBill] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/billing/current'),
      api.get('/api/billing/invoices')
    ]).then(([b, i]) => {
      setCurrentBill(b.data);
      setInvoices(i.data);
    }).finally(() => setLoading(false));
  }, []);

  const generateInvoice = async () => {
    setGenerating(true);
    try {
      await api.post('/api/billing/generate');
      toast.success('Invoice generated successfully!');
      api.get('/api/billing/invoices').then(r => setInvoices(r.data));
    } catch { toast.error('Failed to generate invoice'); }
    finally { setGenerating(false); }
  };

  const downloadPDF = async (id: number) => {
    try {
      const token = localStorage.getItem('storax_token');
      const res = await fetch(`https://storax.onrender.com/api/billing/invoice/${id}/pdf`, { headers: { Authorization: `Bearer ${token}` } });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `storax-invoice-${id}.pdf`; a.click();
      window.URL.revokeObjectURL(url);
    } catch { toast.error('Failed to download PDF'); }
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0F172A', marginBottom: '4px', letterSpacing: '-0.3px' }}>Billing</h1>
          <p style={{ color: '#6B7280', fontSize: '14px' }}>Manage your usage and invoices</p>
        </div>
        <button onClick={generateInvoice} disabled={generating} className="btn-primary" style={{ borderRadius: '10px', padding: '10px 20px' }}>
          <Zap size={16} /> {generating ? 'Generating...' : 'Generate Invoice'}
        </button>
      </div>

      {/* Current Bill Cards */}
      {currentBill && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Storage Cost', value: `$${currentBill.storage_cost}`, sub: `${currentBill.storage_gb?.toFixed(4)} GB`, icon: '🗄️', color: '#2563EB', bg: '#EFF6FF' },
            { label: 'Request Cost', value: `$${currentBill.request_cost}`, sub: `${currentBill.total_requests} requests`, icon: '⚡', color: '#7C3AED', bg: '#F5F3FF' },
            { label: 'Bandwidth Cost', value: `$${currentBill.bandwidth_cost}`, sub: `${currentBill.bandwidth_gb?.toFixed(4)} GB`, icon: '📡', color: '#0891B2', bg: '#ECFEFF' },
            { label: 'Total This Month', value: `$${currentBill.total_amount}`, sub: 'Current period', icon: '💳', color: '#059669', bg: '#F0FDF4', highlight: true },
          ].map(({ label, value, sub, icon, color, bg, highlight }) => (
            <div key={label} style={{
              background: highlight ? '#0F172A' : 'white',
              border: `1px solid ${highlight ? '#0F172A' : '#E5E7EB'}`,
              borderRadius: '16px', padding: '20px',
              transition: 'all 0.2s'
            }}
              onMouseEnter={e => { if (!highlight) { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
              onMouseLeave={e => { if (!highlight) { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; } }}>
              <div style={{ fontSize: '24px', marginBottom: '12px' }}>{icon}</div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: highlight ? 'white' : color, marginBottom: '4px', letterSpacing: '-0.5px' }}>{value}</div>
              <div style={{ fontSize: '13px', color: highlight ? '#94A3B8' : '#6B7280', marginBottom: '4px' }}>{sub}</div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: highlight ? '#64748B' : '#9CA3AF' }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Pricing Info */}
      <div style={{ background: '#F8FAFC', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '20px 24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '13px', color: '#6B7280', fontWeight: '500' }}>Pricing:</div>
          {[
            { label: 'Storage', rate: '$0.02/GB/mo' },
            { label: 'Requests', rate: '$0.01/1K' },
            { label: 'Bandwidth', rate: '$0.09/GB' },
          ].map(({ label, rate }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '13px', color: '#374151', fontWeight: '600' }}>{label}:</span>
              <span style={{ fontSize: '13px', color: '#2563EB', fontWeight: '700', fontFamily: 'monospace' }}>{rate}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Invoices */}
      <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', marginBottom: '2px' }}>Invoice History</h3>
            <p style={{ fontSize: '13px', color: '#6B7280' }}>{invoices.length} invoices total</p>
          </div>
        </div>

        {invoices.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#6B7280' }}>
            <FileText size={40} color="#D1D5DB" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>No invoices yet</h3>
            <p style={{ fontSize: '14px', color: '#9CA3AF' }}>Generate your first invoice to see it here</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Period</th>
                <th>Storage</th>
                <th>Requests</th>
                <th>Total</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id}>
                  <td>
                    <div style={{ fontWeight: '600', color: '#111827', fontSize: '14px' }}>Invoice #{inv.id}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '13px', color: '#6B7280' }}>
                      {new Date(inv.period_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {new Date(inv.period_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </td>
                  <td><span style={{ fontSize: '13px', color: '#374151' }}>${inv.storage_cost}</span></td>
                  <td><span style={{ fontSize: '13px', color: '#374151' }}>${inv.request_cost}</span></td>
                  <td><span style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A' }}>${inv.total_amount}</span></td>
                  <td>
                    <span className={`badge ${inv.status === 'PAID' ? 'badge-success' : inv.status === 'OVERDUE' ? 'badge-danger' : 'badge-warning'}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => downloadPDF(inv.id)} style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      background: '#F8FAFC', border: '1px solid #E5E7EB', color: '#374151',
                      padding: '6px 12px', borderRadius: '8px', cursor: 'pointer',
                      fontSize: '12px', fontWeight: '600', fontFamily: 'Inter, sans-serif', transition: 'all 0.15s'
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#EFF6FF'; e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.color = '#2563EB'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#374151'; }}>
                      <Download size={12} /> PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Billing;