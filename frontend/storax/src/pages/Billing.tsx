import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { DollarSign, Download, FileText, Zap } from 'lucide-react';

const Billing: React.FC = () => {
  const [currentBill, setCurrentBill] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    api.get('/api/billing/current').then(r => setCurrentBill(r.data));
    api.get('/api/billing/invoices').then(r => setInvoices(r.data));
  }, []);

  const generateInvoice = async () => {
    setGenerating(true);
    try {
      await api.post('/api/billing/generate');
      toast.success('Invoice generated!');
      api.get('/api/billing/invoices').then(r => setInvoices(r.data));
    } catch { toast.error('Failed to generate invoice'); }
    finally { setGenerating(false); }
  };

  const downloadPDF = async (id: number) => {
    try {
        const token = localStorage.getItem('storax_token');
        const response = await fetch(`https://storax-production.up.railway.app/api/billing/invoice/${id}/pdf`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `storax-invoice-${id}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
    } catch {
        toast.error('Failed to download PDF');
    }
};

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>Billing</h1>
          <p style={{ color: 'var(--text-muted)' }}>Your usage and invoices</p>
        </div>
        <button className="btn-primary" onClick={generateInvoice} disabled={generating} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={16} /> {generating ? 'Generating...' : 'Generate Invoice'}
        </button>
      </div>

      {/* Current Bill */}
      {currentBill && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
          {[
            { label: 'Storage Cost',   value: `$${currentBill.storage_cost}`,   sub: `${currentBill.storage_gb?.toFixed(4)} GB` },
            { label: 'Request Cost',   value: `$${currentBill.request_cost}`,   sub: `${currentBill.total_requests} requests` },
            { label: 'Bandwidth Cost', value: `$${currentBill.bandwidth_cost}`, sub: `${currentBill.bandwidth_gb?.toFixed(4)} GB` },
            { label: 'Total This Month', value: `$${currentBill.total_amount}`, sub: 'Current period' },
          ].map(({ label, value, sub }) => (
            <div key={label} className="card">
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px', fontWeight: '600' }}>{label}</div>
              <div style={{ fontSize: '28px', fontWeight: '800', background: 'var(--gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{value}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* Invoices */}
      <div className="card">
        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px' }}>Invoice History</h3>
        {invoices.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <FileText size={40} style={{ marginBottom: '12px', opacity: 0.3 }} />
            <p>No invoices yet. Generate your first invoice!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {invoices.map(inv => (
              <div key={inv.id} style={{ display: 'flex', alignItems: 'center', padding: '16px', background: 'var(--card-light)', borderRadius: '10px', border: '1px solid var(--border)', gap: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(108,99,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={18} color="var(--primary)" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>Invoice #{inv.id}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {new Date(inv.period_start).toLocaleDateString()} — {new Date(inv.period_end).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ fontWeight: '700', fontSize: '16px' }}>${inv.total_amount}</div>
                <span className={`badge ${inv.status === 'PAID' ? 'badge-success' : inv.status === 'OVERDUE' ? 'badge-danger' : 'badge-warning'}`}>
                  {inv.status}
                </span>
                <button onClick={() => downloadPDF(inv.id)} style={{ background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.3)', color: 'var(--primary)', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '500' }}>
                  <Download size={14} /> PDF
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Billing;