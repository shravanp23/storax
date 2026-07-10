import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Zap, TrendingDown, CheckCircle, XCircle, AlertCircle, Loader, DollarSign, HardDrive } from 'lucide-react';

const getVerdictColor = (verdict: string) => {
  if (verdict === 'highly_recommended') return '#10B981';
  if (verdict === 'recommended') return '#6C63FF';
  if (verdict === 'optional') return '#F59E0B';
  if (verdict === 'already_compressed' || verdict === 'already_optimized' || verdict === 'optimal') return '#9999BB';
  return '#9999BB';
};

const getVerdictLabel = (verdict: string) => {
  if (verdict === 'highly_recommended') return '🔥 Highly Recommended';
  if (verdict === 'recommended') return '✅ Recommended';
  if (verdict === 'optional') return '💡 Optional';
  if (verdict === 'already_compressed') return '📦 Already Compressed';
  if (verdict === 'already_optimized') return '⚡ Already Optimized';
  if (verdict === 'optimal') return '✨ Optimal';
  return '—';
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
      toast.success(`✅ ${filename} compressed! Saved ${res.data.savings_mb}MB (${res.data.savings_percent}%)`);
      setCompressed(prev => new Set([...prev, objectKey]));
      loadReport();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Compression failed');
    } finally { setCompressing(null); }
  };

  const isCompressed = (objectKey: string) => compressed.has(objectKey);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(108,99,255,0.2)', borderTop: '3px solid #6C63FF', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-muted)' }}>AI is analyzing your files...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #6C63FF, #FF6584)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={20} color="white" />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', margin: 0 }}>AI Compression</h1>
        </div>
        <p style={{ color: 'var(--text-muted)', marginLeft: '52px' }}>
          AI-powered analysis of your files to recommend and apply smart compression
        </p>
      </div>

      {/* Summary Cards */}
      {report && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          {[
            { label: 'Total Files', value: report.total_files, icon: HardDrive, color: '#6C63FF' },
            { label: 'Can Be Compressed', value: report.files_to_compress, icon: TrendingDown, color: '#10B981' },
            { label: 'Potential Savings', value: `${report.total_potential_savings_mb} MB`, icon: CheckCircle, color: '#F59E0B' },
            { label: 'Cost Saving/Month', value: `$${report.estimated_monthly_cost_saving}`, icon: DollarSign, color: '#FF6584' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card" style={{ textAlign: 'center' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <Icon size={18} color={color} />
              </div>
              <div style={{ fontSize: '22px', fontWeight: '800', color, marginBottom: '4px' }}>{value}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* AI Analysis Banner */}
      {report && report.files_to_compress > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(108,99,255,0.15), rgba(255,101,132,0.1))',
          border: '1px solid rgba(108,99,255,0.3)',
          borderRadius: '16px', padding: '20px 24px',
          marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px'
        }}>
          <div style={{ fontSize: '32px' }}>🤖</div>
          <div>
            <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '700' }}>AI Analysis Complete</h3>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>
              Found <strong style={{ color: '#10B981' }}>{report.files_to_compress} files</strong> that can be compressed,
              saving up to <strong style={{ color: '#F59E0B' }}>{report.total_potential_savings_mb} MB</strong> ({report.total_savings_percent}% of your total storage)
            </p>
          </div>
        </div>
      )}

      {report && report.files_to_compress === 0 && (
        <div style={{
          background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
          borderRadius: '16px', padding: '20px 24px', marginBottom: '24px',
          display: 'flex', alignItems: 'center', gap: '16px'
        }}>
          <div style={{ fontSize: '32px' }}>✨</div>
          <div>
            <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '700', color: '#10B981' }}>All Files Optimized!</h3>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>AI analysis found no compression opportunities. Your files are already well-optimized.</p>
          </div>
        </div>
      )}

      {/* File Recommendations */}
      {report && report.recommendations.length > 0 && (
        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px' }}>
            📋 AI Compression Recommendations
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {report.recommendations.map((rec: any) => (
              <div key={rec.object_key} style={{
                background: 'rgba(255,255,255,0.02)',
                border: compressed.has(rec.object_key) ? '1px solid rgba(16,185,129,0.3)' : '1px solid var(--border)',
                borderRadius: '12px', padding: '20px',
                opacity: compressed.has(rec.object_key) ? 0.6 : 1
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    {/* Filename */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '20px' }}>
                        {rec.compression_type?.includes('image') ? '🖼️' : rec.compression_type === 'pdf' ? '📄' : rec.compression_type === 'text' ? '📝' : '📁'}
                      </span>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '14px' }}>{rec.filename}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{rec.current_size_mb} MB</div>
                      </div>
                    </div>

                    {/* AI Reason */}
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '0 0 12px', lineHeight: '1.6' }}>
                      🤖 {rec.reason}
                    </p>

                    {/* Savings Bar */}
                    <div style={{ marginBottom: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Potential Savings</span>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#10B981' }}>
                          {rec.estimated_savings_mb} MB ({rec.savings_percent}%)
                        </span>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${rec.savings_percent}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #6C63FF, #10B981)',
                          borderRadius: '4px',
                          transition: 'width 0.8s ease'
                        }} />
                      </div>
                    </div>
                  </div>

                  {/* Right side */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                    <span style={{
                      fontSize: '12px', fontWeight: '700', padding: '4px 12px', borderRadius: '20px',
                      background: `${getVerdictColor(rec.ai_verdict)}22`,
                      color: getVerdictColor(rec.ai_verdict),
                      border: `1px solid ${getVerdictColor(rec.ai_verdict)}44`,
                      whiteSpace: 'nowrap'
                    }}>
                      {getVerdictLabel(rec.ai_verdict)}
                    </span>

                    {compressed.has(rec.object_key) ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10B981', fontSize: '13px', fontWeight: '600' }}>
                        <CheckCircle size={16} /> Compressed!
                      </div>
                    ) : rec.compression_type && ['image_jpeg', 'image_png', 'pdf'].includes(rec.compression_type) ? (
                      <button
                        onClick={() => compressFile(rec.object_key, rec.filename)}
                        disabled={compressing === rec.object_key}
                        className="btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', padding: '10px 20px', whiteSpace: 'nowrap' }}
                      >
                        {compressing === rec.object_key ? (
                          <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Compressing...</>
                        ) : (
                          <><Zap size={14} /> Compress Now</>
                        )}
                      </button>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '12px' }}>
                        <AlertCircle size={14} /> Manual compression needed
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* How It Works */}
      <div className="card" style={{ marginTop: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>🤖 How AI Compression Works</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {[
            { step: '1', title: 'AI Analysis', desc: 'AI examines file type, size, format, and metadata to assess compression potential' },
            { step: '2', title: 'Smart Recommendation', desc: 'Only recommends compression when significant savings are possible without quality loss' },
            { step: '3', title: 'One-Click Compress', desc: 'Click Compress Now — StoraX handles the rest and saves the optimized version' },
            { step: '4', title: 'Cost Savings', desc: 'Smaller files mean lower storage costs — AI calculates your monthly savings' },
          ].map(({ step, title, desc }) => (
            <div key={step} style={{ textAlign: 'center', padding: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '16px', fontWeight: '800', color: 'white' }}>
                {step}
              </div>
              <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px' }}>{title}</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Compression;