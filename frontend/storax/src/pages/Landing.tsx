import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouse = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouse);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouse);
    };
  }, []);

  const features = [
    { icon: '☁️', title: 'Multi-Tenant Storage', desc: 'Every user gets a fully isolated S3-compatible bucket. Your data never mixes with others.', color: '#6C63FF' },
    { icon: '📊', title: 'Real-time Metering', desc: 'Every upload, download and API call is tracked instantly. See your usage live.', color: '#FF6584' },
    { icon: '⚡', title: 'Auto Billing Engine', desc: 'Bills calculated automatically from real usage. PDF invoices generated on demand.', color: '#10B981' },
    { icon: '🛡️', title: 'Enterprise Security', desc: 'JWT auth, bcrypt passwords, isolated buckets. Built for production from day one.', color: '#F59E0B' },
    { icon: '📁', title: 'File Management', desc: 'Upload, download, preview and delete files with a beautiful drag-and-drop interface.', color: '#8B5CF6' },
    { icon: '👑', title: 'Admin Dashboard', desc: 'Full platform overview. Monitor all users, storage usage, and total revenue in one place.', color: '#EC4899' },
  ];

  const stats = [
    { value: 'S3', label: 'Compatible API' },
    { value: '99.9%', label: 'Uptime SLA' },
    { value: '256-bit', label: 'Encryption' },
    { value: 'Real-time', label: 'Usage Tracking' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0F', color: '#E8E8F0', fontFamily: "'Inter', sans-serif", overflowX: 'hidden' }}>

      {/* Animated background */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 0,
        background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(108,99,255,0.06) 0%, transparent 50%)`
      }} />

      {/* Grid background */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: `linear-gradient(rgba(108,99,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(108,99,255,0.03) 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }} />

      {/* Navbar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 60px', height: '72px',
        background: scrollY > 50 ? 'rgba(10,10,15,0.95)' : 'transparent',
        backdropFilter: scrollY > 50 ? 'blur(20px)' : 'none',
        borderBottom: scrollY > 50 ? '1px solid rgba(108,99,255,0.15)' : 'none',
        transition: 'all 0.3s ease'
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <img src="/storax-logo.png.png" alt="StoraX brand mark: rounded multicolored emblem with a stylized S next to the word StoraX; represents a modern secure cloud storage platform, clean tech-focused design, conveys trust and reliability" style={{ width: '36px', height: '36px', borderRadius: '10px', objectFit: 'cover' }} />
          <span style={{ fontSize: '22px', fontWeight: '800', background: 'linear-gradient(135deg, #6C63FF, #FF6584)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>StoraX</span>
</div>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
          {['Features', 'Pricing', 'Docs'].map(item => (
            <span key={item} style={{ fontSize: '14px', color: 'rgba(232,232,240,0.7)', cursor: 'pointer', transition: 'color 0.2s', fontWeight: '500' }}
              onMouseEnter={e => (e.target as HTMLElement).style.color = '#E8E8F0'}
              onMouseLeave={e => (e.target as HTMLElement).style.color = 'rgba(232,232,240,0.7)'}>
              {item}
            </span>
          ))}
        </div>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button onClick={() => navigate('/login')} style={{
            background: 'transparent', border: '1px solid rgba(108,99,255,0.4)',
            color: '#A8A3FF', padding: '10px 24px', borderRadius: '10px',
            fontSize: '14px', fontWeight: '600', cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
            onMouseEnter={e => { (e.target as HTMLElement).style.background = 'rgba(108,99,255,0.1)'; (e.target as HTMLElement).style.borderColor = '#6C63FF'; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.background = 'transparent'; (e.target as HTMLElement).style.borderColor = 'rgba(108,99,255,0.4)'; }}>
            Sign In
          </button>
          <button onClick={() => navigate('/register')} style={{
            background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
            border: 'none', color: 'white', padding: '10px 24px',
            borderRadius: '10px', fontSize: '14px', fontWeight: '600',
            cursor: 'pointer', transition: 'all 0.3s ease',
            boxShadow: '0 4px 20px rgba(108,99,255,0.3)'
          }}
            onMouseEnter={e => { (e.target as HTMLElement).style.transform = 'translateY(-2px)'; (e.target as HTMLElement).style.boxShadow = '0 8px 30px rgba(108,99,255,0.5)'; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.transform = 'translateY(0)'; (e.target as HTMLElement).style.boxShadow = '0 4px 20px rgba(108,99,255,0.3)'; }}>
            Get Started Free →
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '120px 60px 80px' }}>

        {/* Glowing orbs */}
        <div style={{ position: 'absolute', top: '20%', left: '10%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,99,255,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '30%', right: '10%', width: '250px', height: '250px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,101,132,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '20%', left: '30%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.3)',
          borderRadius: '100px', padding: '6px 16px', marginBottom: '32px',
          fontSize: '13px', color: '#A8A3FF', fontWeight: '500'
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', display: 'inline-block', boxShadow: '0 0 8px #10B981' }} />
          Production-Grade Cloud Storage Platform
        </div>

        {/* Main Headline */}
        <h1 style={{ fontSize: '80px', fontWeight: '900', lineHeight: '1.05', marginBottom: '24px', letterSpacing: '-2px', maxWidth: '900px' }}>
          Store. Measure.
          <br />
          <span style={{ background: 'linear-gradient(135deg, #6C63FF 0%, #FF6584 50%, #10B981 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Bill Automatically.
          </span>
        </h1>

        {/* Subtitle */}
        <p style={{ fontSize: '20px', color: 'rgba(232,232,240,0.6)', maxWidth: '600px', lineHeight: '1.7', marginBottom: '48px' }}>
          StoraX is a multi-tenant object storage platform with real-time usage metering and automatic billing — like AWS S3, built from scratch.
        </p>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '80px' }}>
          <button onClick={() => navigate('/register')} style={{
            background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
            border: 'none', color: 'white', padding: '18px 40px',
            borderRadius: '14px', fontSize: '16px', fontWeight: '700',
            cursor: 'pointer', transition: 'all 0.3s ease',
            boxShadow: '0 8px 30px rgba(108,99,255,0.4)',
            letterSpacing: '0.3px'
          }}
            onMouseEnter={e => { (e.target as HTMLElement).style.transform = 'translateY(-3px)'; (e.target as HTMLElement).style.boxShadow = '0 16px 40px rgba(108,99,255,0.6)'; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.transform = 'translateY(0)'; (e.target as HTMLElement).style.boxShadow = '0 8px 30px rgba(108,99,255,0.4)'; }}>
            Start For Free →
          </button>
          <button onClick={() => navigate('/login')} style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(232,232,240,0.8)', padding: '18px 40px',
            borderRadius: '14px', fontSize: '16px', fontWeight: '600',
            cursor: 'pointer', transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)'
          }}
            onMouseEnter={e => { (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; (e.target as HTMLElement).style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.target as HTMLElement).style.transform = 'translateY(0)'; }}>
            Sign In
          </button>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'flex', gap: '60px', alignItems: 'center' }}>
          {stats.map(({ value, label }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '800', background: 'linear-gradient(135deg, #6C63FF, #FF6584)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{value}</div>
              <div style={{ fontSize: '13px', color: 'rgba(232,232,240,0.5)', marginTop: '4px' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Dashboard Preview */}
      <div style={{ position: 'relative', zIndex: 1, padding: '0 60px 120px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          borderRadius: '24px', overflow: 'hidden',
          border: '1px solid rgba(108,99,255,0.2)',
          boxShadow: '0 0 80px rgba(108,99,255,0.15), 0 40px 80px rgba(0,0,0,0.5)',
          background: 'rgba(20,20,35,0.9)',
          backdropFilter: 'blur(20px)'
        }}>
          {/* Browser bar */}
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FF5F57' }} />
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FFBD2E' }} />
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#28C840' }} />
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: '6px', padding: '4px 12px', marginLeft: '12px', fontSize: '12px', color: 'rgba(232,232,240,0.3)' }}>
              localhost:3000/dashboard
            </div>
          </div>
          {/* Dashboard preview content */}
          <div style={{ padding: '32px', display: 'grid', gridTemplateColumns: '200px 1fr', gap: '24px', minHeight: '400px' }}>
            {/* Sidebar preview */}
            <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg, #6C63FF, #FF6584)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>⚡</div>
                <span style={{ fontWeight: '700', fontSize: '14px', background: 'linear-gradient(135deg, #6C63FF, #FF6584)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>StoraX</span>
              </div>
              {[['📊', 'Dashboard', true], ['📁', 'My Files', false], ['💳', 'Billing', false], ['👑', 'Admin', false]].map(([icon, label, active]) => (
                <div key={label as string} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', marginBottom: '4px', background: active ? 'rgba(108,99,255,0.2)' : 'transparent', border: active ? '1px solid rgba(108,99,255,0.3)' : '1px solid transparent' }}>
                  <span style={{ fontSize: '14px' }}>{icon}</span>
                  <span style={{ fontSize: '13px', color: active ? '#A8A3FF' : 'rgba(232,232,240,0.4)', fontWeight: active ? '600' : '400' }}>{label as string}</span>
                </div>
              ))}
            </div>
            {/* Main content preview */}
            <div>
              <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>Welcome back, Shravan 👋</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
                {[['12', 'Total Files', '#6C63FF'], ['2.4 GB', 'Storage Used', '#10B981'], ['348', 'API Requests', '#F59E0B'], ['$0.05', 'Current Bill', '#FF6584']].map(([val, label, color]) => (
                  <div key={label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: '11px', color: 'rgba(232,232,240,0.4)', marginBottom: '8px' }}>{label}</div>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: color as string }}>{val}</div>
                  </div>
                ))}
              </div>
              {/* Chart placeholder */}
              <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '10px', padding: '16px', border: '1px solid rgba(255,255,255,0.05)', height: '120px', display: 'flex', alignItems: 'flex-end', gap: '6px' }}>
                {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 100].map((h, i) => (
                  <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: '4px 4px 0 0', background: `linear-gradient(to top, #6C63FF, rgba(108,99,255,0.3))`, opacity: 0.8 }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div style={{ position: 'relative', zIndex: 1, padding: '80px 60px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div style={{ fontSize: '13px', color: '#A8A3FF', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px' }}>Features</div>
          <h2 style={{ fontSize: '52px', fontWeight: '900', letterSpacing: '-1px', marginBottom: '16px' }}>
            Everything You Need
          </h2>
          <p style={{ fontSize: '18px', color: 'rgba(232,232,240,0.5)', maxWidth: '500px', margin: '0 auto', lineHeight: '1.7' }}>
            A complete cloud storage infrastructure built for real-world production use
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          {features.map(({ icon, title, desc, color }) => (
            <div key={title} style={{
              background: 'rgba(20,20,35,0.8)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '20px', padding: '32px', cursor: 'default',
              transition: 'all 0.3s ease', position: 'relative', overflow: 'hidden'
            }}
              onMouseEnter={e => {
                const el = e.currentTarget;
                el.style.border = `1px solid ${color}40`;
                el.style.transform = 'translateY(-4px)';
                el.style.boxShadow = `0 20px 40px ${color}20`;
              }}
              onMouseLeave={e => {
                const el = e.currentTarget;
                el.style.border = '1px solid rgba(255,255,255,0.06)';
                el.style.transform = 'translateY(0)';
                el.style.boxShadow = 'none';
              }}>
              {/* Glow corner */}
              <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '120px', height: '120px', borderRadius: '50%', background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`, pointerEvents: 'none' }} />
              <div style={{
                width: '52px', height: '52px', borderRadius: '14px',
                background: `${color}18`, border: `1px solid ${color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '24px', marginBottom: '20px'
              }}>
                {icon}
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px', color: '#E8E8F0' }}>{title}</h3>
              <p style={{ fontSize: '14px', color: 'rgba(232,232,240,0.5)', lineHeight: '1.7' }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Section */}
      <div style={{ position: 'relative', zIndex: 1, padding: '80px 60px', textAlign: 'center' }}>
        <div style={{ fontSize: '13px', color: '#A8A3FF', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px' }}>Pricing</div>
        <h2 style={{ fontSize: '52px', fontWeight: '900', letterSpacing: '-1px', marginBottom: '16px' }}>Pay Only For What You Use</h2>
        <p style={{ fontSize: '18px', color: 'rgba(232,232,240,0.5)', marginBottom: '60px' }}>No hidden fees. No monthly minimums. Pure usage-based pricing.</p>

        <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', maxWidth: '900px', margin: '0 auto' }}>
          {[
            { icon: '🗄️', label: 'Storage', price: '$0.02', unit: 'per GB / month', color: '#6C63FF', desc: 'Scalable object storage with instant access' },
            { icon: '🔁', label: 'API Requests', price: '$0.01', unit: 'per 1,000 requests', color: '#FF6584', desc: 'Every PUT, GET and DELETE counted fairly' },
            { icon: '📡', label: 'Bandwidth', price: '$0.09', unit: 'per GB transferred', color: '#10B981', desc: 'Outbound data transfer billed at egress' },
          ].map(({ icon, label, price, unit, color, desc }) => (
            <div key={label} style={{
              flex: 1, background: 'rgba(20,20,35,0.9)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '24px', padding: '40px 32px',
              transition: 'all 0.3s ease'
            }}
              onMouseEnter={e => { e.currentTarget.style.border = `1px solid ${color}50`; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 20px 40px ${color}20`; }}
              onMouseLeave={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
              <div style={{ fontSize: '36px', marginBottom: '16px' }}>{icon}</div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#E8E8F0', marginBottom: '16px' }}>{label}</div>
              <div style={{ fontSize: '48px', fontWeight: '900', background: `linear-gradient(135deg, ${color}, ${color}99)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: '1', marginBottom: '8px' }}>{price}</div>
              <div style={{ fontSize: '13px', color: 'rgba(232,232,240,0.4)', marginBottom: '20px' }}>{unit}</div>
              <div style={{ fontSize: '13px', color: 'rgba(232,232,240,0.5)', lineHeight: '1.6' }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div style={{ position: 'relative', zIndex: 1, padding: '80px 60px 120px', textAlign: 'center' }}>
        <div style={{
          maxWidth: '700px', margin: '0 auto',
          background: 'linear-gradient(135deg, rgba(108,99,255,0.15), rgba(255,101,132,0.1))',
          border: '1px solid rgba(108,99,255,0.25)',
          borderRadius: '32px', padding: '80px 60px',
          position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: '-60px', left: '-60px', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,99,255,0.2) 0%, transparent 70%)' }} />
          <div style={{ position: 'absolute', bottom: '-60px', right: '-60px', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,101,132,0.15) 0%, transparent 70%)' }} />
          <h2 style={{ fontSize: '48px', fontWeight: '900', letterSpacing: '-1px', marginBottom: '16px', position: 'relative' }}>
            Ready to Store Smarter?
          </h2>
          <p style={{ fontSize: '18px', color: 'rgba(232,232,240,0.6)', marginBottom: '40px', lineHeight: '1.7', position: 'relative' }}>
            Join StoraX and get your own isolated storage bucket, real-time usage tracking, and automatic billing in minutes.
          </p>
          <button onClick={() => navigate('/register')} style={{
            background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
            border: 'none', color: 'white', padding: '20px 48px',
            borderRadius: '14px', fontSize: '18px', fontWeight: '700',
            cursor: 'pointer', transition: 'all 0.3s ease',
            boxShadow: '0 8px 30px rgba(108,99,255,0.4)',
            position: 'relative'
          }}
            onMouseEnter={e => { (e.target as HTMLElement).style.transform = 'translateY(-3px)'; (e.target as HTMLElement).style.boxShadow = '0 16px 40px rgba(108,99,255,0.6)'; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.transform = 'translateY(0)'; (e.target as HTMLElement).style.boxShadow = '0 8px 30px rgba(108,99,255,0.4)'; }}>
            Create Free Account →
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        position: 'relative', zIndex: 1,
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '40px 60px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg, #6C63FF, #FF6584)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>⚡</div>
          <span style={{ fontWeight: '700', background: 'linear-gradient(135deg, #6C63FF, #FF6584)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>StoraX</span>
        </div>
        <div style={{ fontSize: '14px', color: 'rgba(232,232,240,0.3)' }}>
          Built with ❤️ by Shravan Pawar — StoraX © 2026
        </div>
        <div style={{ display: 'flex', gap: '24px' }}>
          {['Privacy', 'Terms', 'Docs'].map(item => (
            <span key={item} style={{ fontSize: '14px', color: 'rgba(232,232,240,0.3)', cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.target as HTMLElement).style.color = '#A8A3FF'}
              onMouseLeave={e => (e.target as HTMLElement).style.color = 'rgba(232,232,240,0.3)'}>
              {item}
            </span>
          ))}
        </div>
      </footer>
    </div>
  );
};

export default Landing;