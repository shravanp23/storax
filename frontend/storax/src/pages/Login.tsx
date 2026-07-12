import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Cloud, Mail, Lock, ArrowRight, Eye, EyeOff, CheckCircle } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const form = new FormData();
      form.append('username', email);
      form.append('password', password);
      const res = await api.post('/api/auth/login', form);
      login(res.data.access_token, res.data.user);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'Inter, sans-serif' }}>
      {/* Left Panel */}
      <div style={{
        flex: 1, background: 'linear-gradient(160deg, #0F172A 0%, #1E3A5F 60%, #1E40AF 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px', position: 'relative', overflow: 'hidden'
      }} className="hide-mobile">
        <div style={{ position: 'absolute', top: '20%', right: '-10%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.2) 0%, transparent 70%)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '60px' }}>
          <div style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)' }}>
            <Cloud size={20} color="white" />
          </div>
          <span style={{ fontSize: '20px', fontWeight: '700', color: 'white' }}>StoraX</span>
        </div>

        <h2 style={{ fontSize: '36px', fontWeight: '800', color: 'white', marginBottom: '16px', lineHeight: '1.2', letterSpacing: '-0.5px' }}>
          Your cloud storage,<br />fully automated.
        </h2>
        <p style={{ color: '#94A3B8', fontSize: '16px', lineHeight: '1.7', marginBottom: '48px' }}>
          Multi-tenant object storage with real-time metering and automated billing.
        </p>

        {[
          'Isolated S3-compatible storage buckets',
          'Real-time usage metering and billing',
          'AI-powered file compression',
          'Enterprise security and audit logs',
        ].map(item => (
          <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <CheckCircle size={16} color="#22C55E" style={{ flexShrink: 0 }} />
            <span style={{ color: '#CBD5E1', fontSize: '14px' }}>{item}</span>
          </div>
        ))}
      </div>

      {/* Right Panel */}
      <div style={{ flex: '0 0 480px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <div style={{ width: '100%', maxWidth: '380px' }}>
          {/* Mobile logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '40px' }} className="hide-desktop">
            <Cloud size={20} color="#0F172A" />
            <span style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A' }}>StoraX</span>
          </div>

          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0F172A', marginBottom: '8px', letterSpacing: '-0.5px' }}>Sign in</h1>
          <p style={{ color: '#6B7280', fontSize: '15px', marginBottom: '32px' }}>
            New to StoraX? <Link to="/register" style={{ color: '#2563EB', fontWeight: '600', textDecoration: 'none' }}>Create an account</Link>
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Email address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                <input type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} style={{ paddingLeft: '42px' }} required />
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Password</label>
                <span style={{ fontSize: '13px', color: '#2563EB', cursor: 'pointer', fontWeight: '500' }}>Forgot password?</span>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} style={{ paddingLeft: '42px', paddingRight: '42px' }} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', background: '#0F172A', color: 'white', border: 'none',
              padding: '14px', borderRadius: '100px', fontSize: '15px', fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              opacity: loading ? 0.7 : 1, transition: 'all 0.2s'
            }}>
              {loading ? 'Signing in...' : <><span>Sign in to console</span><ArrowRight size={16} /></>}
            </button>
          </form>

          
        </div>
      </div>
    </div>
  );
};

export default Login;