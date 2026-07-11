import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cloud, Zap, Shield, BarChart3, ArrowRight, CheckCircle, ChevronRight, Lock, Globe, Cpu, Database, FileText, Users } from 'lucide-react';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    { icon: Cloud, title: 'Multi-Tenant Storage', desc: 'Every user gets a fully isolated S3-compatible storage bucket. Your data is never mixed with others.', color: '#2563EB' },
    { icon: BarChart3, title: 'Real-time Metering', desc: 'Every upload, download, and API request is tracked instantly. Monitor your usage live from your dashboard.', color: '#7C3AED' },
    { icon: Zap, title: 'Automated Billing', desc: 'Usage-based bills calculated automatically. Download professional PDF invoices with one click.', color: '#0891B2' },
    { icon: Shield, title: 'Enterprise Security', desc: 'JWT authentication, bcrypt encryption, per-user data isolation, and complete audit logging.', color: '#059669' },
    { icon: Cpu, title: 'AI Compression', desc: 'AI analyzes your files and recommends smart compression to save storage costs automatically.', color: '#D97706' },
    { icon: Database, title: 'S3-Compatible API', desc: 'Industry-standard S3-compatible API. Integrate with any SDK or tool that supports AWS S3.', color: '#DC2626' },
  ];

  const stats = [
    { value: 'S3', label: 'Compatible API Standard' },
    { value: '99.9%', label: 'Uptime Guarantee' },
    { value: '256-bit', label: 'AES Encryption' },
    { value: 'Real-time', label: 'Usage Tracking' },
  ];

  const pricing = [
    { icon: '🗄️', label: 'Storage', price: '$0.02', unit: 'per GB / month', desc: 'Scalable object storage' },
    { icon: '⚡', label: 'API Requests', price: '$0.01', unit: 'per 1,000 requests', desc: 'Every operation counted fairly' },
    { icon: '📡', label: 'Bandwidth', price: '$0.09', unit: 'per GB transferred', desc: 'Outbound data transfer' },
  ];

  return (
    <div style={{ background: 'white', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>

      {/* NAVBAR */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: scrolled ? 'rgba(255,255,255,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid #E5E7EB' : 'none',
        transition: 'all 0.3s ease',
        padding: '0 40px', height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ width: '32px', height: '32px', background: '#0F172A', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Cloud size={18} color="white" />
          </div>
          <span style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A', letterSpacing: '-0.5px' }}>StoraX</span>
        </div>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }} className="hide-mobile">
          {['Features', 'Pricing', 'Docs', 'Security'].map(item => (
            <span key={item} style={{ fontSize: '14px', color: '#374151', cursor: 'pointer', fontWeight: '500', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.target as HTMLElement).style.color = '#2563EB'}
              onMouseLeave={e => (e.target as HTMLElement).style.color = '#374151'}>
              {item}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button className="btn-secondary" onClick={() => navigate('/login')} style={{ padding: '8px 20px', fontSize: '14px' }}>
            Sign in
          </button>
          <button className="btn-primary" onClick={() => navigate('/register')} style={{ padding: '8px 20px', fontSize: '14px' }}>
            Get started free
          </button>
        </div>
      </nav>

      {/* HERO */}
      <div style={{
        background: 'linear-gradient(160deg, #0F172A 0%, #1E293B 40%, #1E3A5F 70%, #1E40AF 100%)',
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        position: 'relative', overflow: 'hidden', paddingTop: '64px'
      }}>
        {/* Background decorations */}
        <div style={{ position: 'absolute', top: '10%', right: '5%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '5%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Grid pattern */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1, padding: '80px 40px' }}>
          <div style={{ maxWidth: '700px' }}>
            {/* Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(37,99,235,0.2)', border: '1px solid rgba(37,99,235,0.4)', borderRadius: '100px', padding: '6px 16px', marginBottom: '32px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 6px #22C55E' }} />
              <span style={{ fontSize: '13px', color: '#93C5FD', fontWeight: '500' }}>Production-Grade Cloud Storage Platform</span>
            </div>

            {/* Headline */}
            <h1 style={{ fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: '800', color: 'white', lineHeight: '1.1', marginBottom: '24px', letterSpacing: '-1.5px' }}>
              Store. Measure.<br />
              <span style={{ color: '#60A5FA' }}>Bill Automatically.</span>
            </h1>

            <p style={{ fontSize: '18px', color: '#94A3B8', lineHeight: '1.7', marginBottom: '40px', maxWidth: '560px' }}>
              StoraX is a multi-tenant object storage platform with real-time usage metering and automated billing — built like AWS S3, from scratch.
            </p>

            {/* CTA Buttons */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '64px' }}>
              <button onClick={() => navigate('/register')} style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'white', color: '#0F172A', border: 'none',
                padding: '14px 28px', borderRadius: '100px', fontSize: '15px', fontWeight: '700',
                cursor: 'pointer', transition: 'all 0.2s ease', fontFamily: 'Inter, sans-serif'
              }}
                onMouseEnter={e => { (e.currentTarget).style.transform = 'translateY(-2px)'; (e.currentTarget).style.boxShadow = '0 8px 30px rgba(0,0,0,0.3)'; }}
                onMouseLeave={e => { (e.currentTarget).style.transform = 'translateY(0)'; (e.currentTarget).style.boxShadow = 'none'; }}>
                Get started free <ArrowRight size={16} />
              </button>
              <button onClick={() => navigate('/login')} style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'transparent', color: 'white', border: '1.5px solid rgba(255,255,255,0.3)',
                padding: '14px 28px', borderRadius: '100px', fontSize: '15px', fontWeight: '600',
                cursor: 'pointer', transition: 'all 0.2s ease', fontFamily: 'Inter, sans-serif'
              }}
                onMouseEnter={e => { (e.currentTarget).style.borderColor = 'rgba(255,255,255,0.7)'; (e.currentTarget).style.background = 'rgba(255,255,255,0.05)'; }}
                onMouseLeave={e => { (e.currentTarget).style.borderColor = 'rgba(255,255,255,0.3)'; (e.currentTarget).style.background = 'transparent'; }}>
                Sign in to console
              </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
              {stats.map(({ value, label }) => (
                <div key={label}>
                  <div style={{ fontSize: '22px', fontWeight: '800', color: 'white' }}>{value}</div>
                  <div style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* WHAT'S NEW / QUICK CARDS */}
      <div style={{ background: 'white', padding: '80px 40px' }}>
        <div className="container">
          <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#0F172A', marginBottom: '8px' }}>Everything you need</h2>
          <p style={{ color: '#6B7280', fontSize: '16px', marginBottom: '48px' }}>A complete cloud storage infrastructure built for production</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} style={{
                background: '#F8FAFC', border: '1px solid #E5E7EB',
                borderRadius: '16px', padding: '28px',
                transition: 'all 0.2s ease', cursor: 'default'
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                  <Icon size={24} color={color} />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', marginBottom: '8px' }}>{title}</h3>
                <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.6' }}>{desc}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '16px', color: '#2563EB', fontSize: '14px', fontWeight: '600' }}>
                  Learn more <ChevronRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ARCHITECTURE SECTION */}
      <div style={{ background: '#0F172A', padding: '80px 40px' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#60A5FA', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px' }}>Architecture</div>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: '800', color: 'white', marginBottom: '20px', lineHeight: '1.2', letterSpacing: '-0.5px' }}>
                Built for scale from day one
              </h2>
              <p style={{ color: '#94A3B8', lineHeight: '1.7', marginBottom: '32px', fontSize: '16px' }}>
                Every component is designed with production workloads in mind. From isolated storage buckets to real-time billing calculations — StoraX handles it all.
              </p>
              {[
                'S3-compatible object storage via Backblaze B2',
                'PostgreSQL for structured billing data',
                'JWT authentication on every request',
                'Real-time usage metering and audit logs',
              ].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <CheckCircle size={16} color="#22C55E" style={{ flexShrink: 0 }} />
                  <span style={{ color: '#CBD5E1', fontSize: '14px' }}>{item}</span>
                </div>
              ))}
              <button onClick={() => navigate('/register')} style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '32px',
                background: '#2563EB', color: 'white', border: 'none',
                padding: '14px 28px', borderRadius: '100px', fontSize: '14px', fontWeight: '600',
                cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s'
              }}>
                Start building <ArrowRight size={16} />
              </button>
            </div>

            {/* Architecture Diagram */}
            <div style={{ background: '#1E293B', borderRadius: '20px', padding: '32px', border: '1px solid #334155' }}>
              <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '20px', fontFamily: 'monospace' }}>StoraX Architecture</div>
              {[
                { label: 'React Frontend', sub: 'Vercel CDN', color: '#60A5FA', icon: '🌐' },
                { label: 'FastAPI Backend', sub: 'Render Cloud', color: '#A78BFA', icon: '⚙️' },
                { label: 'PostgreSQL', sub: 'Managed Database', color: '#34D399', icon: '🗄️' },
                { label: 'Backblaze B2', sub: 'S3-Compatible Storage', color: '#FB923C', icon: '☁️' },
              ].map((item, i) => (
                <div key={item.label}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', background: '#0F172A', borderRadius: '10px', border: `1px solid ${item.color}30` }}>
                    <span style={{ fontSize: '20px' }}>{item.icon}</span>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: 'white' }}>{item.label}</div>
                      <div style={{ fontSize: '12px', color: '#64748B' }}>{item.sub}</div>
                    </div>
                    <div style={{ marginLeft: 'auto', width: '8px', height: '8px', borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 6px #22C55E' }} />
                  </div>
                  {i < 3 && (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 0' }}>
                      <div style={{ width: '1px', height: '20px', background: '#334155' }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* PRICING */}
      <div style={{ background: 'white', padding: '80px 40px' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#2563EB', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px' }}>Pricing</div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: '800', color: '#0F172A', marginBottom: '16px', letterSpacing: '-0.5px' }}>Pay only for what you use</h2>
            <p style={{ color: '#6B7280', fontSize: '16px', maxWidth: '480px', margin: '0 auto' }}>No upfront costs. No minimum commitments. No hidden fees.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', maxWidth: '900px', margin: '0 auto' }}>
            {pricing.map(({ icon, label, price, unit, desc }) => (
              <div key={label} style={{
                border: '1px solid #E5E7EB', borderRadius: '20px', padding: '32px',
                textAlign: 'center', transition: 'all 0.2s ease'
              }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <div style={{ fontSize: '40px', marginBottom: '16px' }}>{icon}</div>
                <div style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A', marginBottom: '12px' }}>{label}</div>
                <div style={{ fontSize: '44px', fontWeight: '800', color: '#2563EB', lineHeight: '1', marginBottom: '8px' }}>{price}</div>
                <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '12px' }}>{unit}</div>
                <div style={{ fontSize: '13px', color: '#9CA3AF', borderTop: '1px solid #F3F4F6', paddingTop: '12px' }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECURITY SECTION */}
      <div style={{ background: '#F8FAFC', padding: '80px 40px', borderTop: '1px solid #E5E7EB' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[
                { icon: Lock, title: 'bcrypt Encryption', desc: 'Passwords hashed with industry-standard bcrypt' },
                { icon: Shield, title: 'JWT Auth', desc: 'Stateless authentication on every request' },
                { icon: Database, title: 'Data Isolation', desc: 'Per-user bucket isolation at storage level' },
                { icon: FileText, title: 'Audit Logs', desc: 'Complete activity trail for compliance' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '20px' }}>
                  <div style={{ width: '40px', height: '40px', background: '#EFF6FF', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                    <Icon size={20} color="#2563EB" />
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A', marginBottom: '4px' }}>{title}</div>
                  <div style={{ fontSize: '12px', color: '#6B7280', lineHeight: '1.5' }}>{desc}</div>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#2563EB', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px' }}>Security</div>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: '800', color: '#0F172A', marginBottom: '16px', letterSpacing: '-0.5px' }}>
                Enterprise-grade security built in
              </h2>
              <p style={{ color: '#6B7280', lineHeight: '1.7', fontSize: '16px', marginBottom: '24px' }}>
                StoraX is built with security at its core — not as an afterthought. Every layer is protected with industry-standard security practices.
              </p>
              <button onClick={() => navigate('/register')} className="btn-accent">
                Start secure storage <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CTA BANNER */}
      <div style={{ background: '#0F172A', padding: '80px 40px', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: '800', color: 'white', marginBottom: '16px', letterSpacing: '-0.5px' }}>
            Ready to build on StoraX?
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '18px', marginBottom: '40px' }}>
            Join StoraX and get your private storage bucket in seconds.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/register')} style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'white', color: '#0F172A', border: 'none',
              padding: '14px 32px', borderRadius: '100px', fontSize: '15px', fontWeight: '700',
              cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s'
            }}>
              Create free account <ArrowRight size={16} />
            </button>
            <button onClick={() => navigate('/login')} style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'transparent', color: 'white', border: '1.5px solid rgba(255,255,255,0.3)',
              padding: '14px 32px', borderRadius: '100px', fontSize: '15px', fontWeight: '600',
              cursor: 'pointer', fontFamily: 'Inter, sans-serif'
            }}>
              Sign in to console
            </button>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ background: '#0F172A', borderTop: '1px solid #1E293B', padding: '48px 40px' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '28px', height: '28px', background: '#1E293B', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #334155' }}>
                <Cloud size={14} color="white" />
              </div>
              <span style={{ fontSize: '16px', fontWeight: '700', color: 'white' }}>StoraX</span>
            </div>
            <div style={{ display: 'flex', gap: '32px' }}>
              {['Privacy', 'Terms', 'Docs', 'Support'].map(item => (
                <span key={item} style={{ fontSize: '14px', color: '#64748B', cursor: 'pointer', transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.target as HTMLElement).style.color = '#94A3B8'}
                  onMouseLeave={e => (e.target as HTMLElement).style.color = '#64748B'}>
                  {item}
                </span>
              ))}
            </div>
            <div style={{ fontSize: '14px', color: '#475569' }}>
              © 2026 StoraX by Shravan Pawar
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;