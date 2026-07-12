import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Zap, TrendingDown, CheckCircle, AlertCircle, Loader, DollarSign, HardDrive, BarChart2 } from 'lucide-react';

const getVerdictStyle = (verdict: string) => {
  if (verdict === 'highly_recommended') return { color: '#059669', bg: '#F0FDF4', border: '#BBF7D0', label: '🔥 Highly Recommended' };
  if (verdict === 'recommended') return { color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', label: '✅ Recommended' };
  if (verdict === 'optional') return { color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', label: '💡 Optional' };
  if (verdict === 'already_compressed') return { color: '#6B7280', bg: '#F9FAFB', border: '#E5E7EB', label: '📦 Already Compressed' };
  if (verdict === 'already_optimized') return { color: '#6B7280', bg: '#F9FAFB', border: '#E5E7EB', label: '⚡ Already Optimized' };
  return { color: '#6B7280', bg: '#F9FAFB', border: '#E5E7EB', label: '✨ Optimal' };
};

const Compression: React.FC = () => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [compressing, setCompressing] = useState<string | null>(null);
  const [compressed, setCompressed] = useState<Set<string>>(new Set());

  const loadReport = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/storage/bulk-compression-report');
      setReport(res.data);
    } catch { toast.error('Failed to load report'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadReport(); }, []);

  const compressFile = async (objectKey: string, filename: string) => {
    setCompressing(objectKey);
    try {
      const res = await api.post(`/api/storage/compress/${objectKey}`);
      toast.success(`✅ Saved ${res.data.savings_mb}MB (${res.data.savings_percent}%)`);
      setCompressed(prev => new Set([...prev, objectKey]));
      loadReport();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Compression failed');
    } finally { setCompressing(null); }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid #E5E7EB', borderTop: '3px solid #2563EB', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#6B7280', fontSize: '14px' }}>AI is analyzing your files...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <div style={{ width: '40px', height: '40px', background: '#0F172A', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={20} color="white" />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0F172A', letterSpacing: '-0.3px', margin: 0 }}>AI Compression</h1>
        </div>
        <p style={{ color: '#6B7280', fontSize: '14px', marginLeft: '52px' }}>AI-powered analysis to reduce your storage costs automatically</p>
      </div>

      {/* Summary Cards */}
      {report && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Total Files', value: report.total_files, icon: HardDrive, color: '#2563EB', bg: '#EFF6FF' },
            { label: 'Can Compress', value: report.files_to_compress, icon: TrendingDown, color: '#059669', bg: '#F0FDF4' },
            { label: 'Potential Savings', value: `${report.total_potential_savings_mb} MB`, icon: BarChart2, color: '#D97706', bg: '#FFFBEB' },
            { label: 'Monthly Saving', value: `$${report.estimated_monthly_cost_saving}`, icon: DollarSign, color: '#7C3AED', bg: '#F5F3FF' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '20px', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                <Icon size={20} color={color} />
              </div>
              <div style={{ fontSize: '22px', fontWeight: '700', color: '#0F172A', marginBottom: '4px', letterSpacing: '-0.3px' }}>{value}</div>
              <div style={{ fontSize: '13px', color: '#6B7280' }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* AI Analysis Banner */}
      {report && report.files_to_compress > 0 && (
        <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '16px', padding: '20px 24px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '32px' }}>🤖</div>
          <div>
            <h3 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '700', color: '#1D4ED8' }}>AI Analysis Complete</h3>
            <p style={{ margin: 0, color: '#3B82F6', fontSize: '14px' }}>
              Found <strong>{report.files_to_compress} files</strong> that can be compressed, saving up to <strong>{report.total_potential_savings_mb} MB</strong> ({report.total_savings_percent}% of total storage)
            </p>
          </div>
        </div>
      )}

      {report && report.files_to_compress === 0 && (
        <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '16px', padding: '20px 24px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '32px' }}>✨</div>
          <div>
            <h3 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '700', color: '#15803D' }}>All files optimized!</h3>
            <p style={{ margin: 0, color: '#16A34A', fontSize: '14px' }}>AI analysis found no compression opportunities. Your files are already well-optimized.</p>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {report?.recommendations?.length > 0 && (
        <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #F3F4F6' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', marginBottom: '2px' }}>AI Recommendations</h3>
            <p style={{ fontSize: '13px', color: '#6B7280' }}>Ranked by potential savings</p>
          </div>

          {report.recommendations.map((rec: any, idx: number) => {
            const vStyle = getVerdictStyle(rec.ai_verdict);
            return (
              <div key={rec.object_key} style={{ padding: '20px 24px', borderBottom: idx < report.recommendations.length - 1 ? '1px solid #F9FAFB' : 'none', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ fontSize: '24px', flexShrink: 0 }}>
                    {rec.compression_type?.includes('image') ? '🖼️' : rec.compression_type === 'pdf' ? '📄' : '📁'}
                  </div>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: '700', fontSize: '14px', color: '#111827' }}>{rec.filename}</span>
                      <span style={{ fontSize: '12px', color: '#6B7280' }}>{rec.current_size_mb} MB</span>
                      <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 10px', borderRadius: '100px', background: vStyle.bg, color: vStyle.color, border: `1px solid ${vStyle.border}` }}>
                        {vStyle.label}
                      </span>
                      {rec.ml_model_used && (
    <span style={{ fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '100px', background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0' }}>
        🤖 ML Model
    </span>
)}
                    </div>
                    <p style={{ color: '#6B7280', fontSize: '13px', margin: '0 0 12px', lineHeight: '1.5' }}>🤖 {rec.reason}</p>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '12px', color: '#6B7280' }}>Potential savings</span>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#059669' }}>{rec.estimated_savings_mb} MB ({rec.savings_percent}%)</span>
                      </div>
                      <div style={{ background: '#F3F4F6', borderRadius: '100px', height: '6px', overflow: 'hidden' }}>
                        <div style={{ width: `${rec.savings_percent}%`, height: '100%', background: 'linear-gradient(90deg, #2563EB, #059669)', borderRadius: '100px' }} />
                      </div>
                    </div>
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    {compressed.has(rec.object_key) ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669', fontSize: '13px', fontWeight: '600' }}>
                        <CheckCircle size={16} /> Compressed!
                      </div>
                    ) : rec.compression_type && ['image_jpeg', 'image_png', 'pdf'].includes(rec.compression_type) ? (
                      <button onClick={() => compressFile(rec.object_key, rec.filename)} disabled={compressing === rec.object_key} className="btn-primary" style={{ borderRadius: '10px', padding: '9px 18px', fontSize: '13px' }}>
                        {compressing === rec.object_key ? (
                          <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Compressing...</>
                        ) : (
                          <><Zap size={14} /> Compress</>
                        )}
                      </button>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#9CA3AF', fontSize: '12px' }}>
                        <AlertCircle size={14} /> Manual needed
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* How it works */}
      <div style={{ background: '#F8FAFC', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '24px', marginTop: '20px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A', marginBottom: '20px' }}>How AI Compression Works</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          {[
            { step: '1', title: 'AI Analysis', desc: 'AI examines file type, size, format, and metadata to assess compression potential' },
            { step: '2', title: 'Smart Decision', desc: 'Only recommends compression when significant savings are achievable without quality loss' },
            { step: '3', title: 'One-Click Compress', desc: 'Click Compress — StoraX handles everything and saves the optimized version' },
            { step: '4', title: 'Cost Savings', desc: 'Smaller files mean lower storage costs — calculated automatically' },
          ].map(({ step, title, desc }) => (
            <div key={step} style={{ display: 'flex', gap: '12px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '12px', fontWeight: '800', color: 'white' }}>{step}</div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A', marginBottom: '4px' }}>{title}</div>
                <div style={{ fontSize: '13px', color: '#6B7280', lineHeight: '1.5' }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Compression;