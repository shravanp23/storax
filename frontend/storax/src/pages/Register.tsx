import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Cloud, Mail, Lock, User, ArrowRight, Eye, EyeOff, CheckCircle } from 'lucide-react';

const Register: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const res = await api.post('/api/auth/register', { full_name: fullName, email, password });
      login(res.data.access_token, res.data.user);
      toast.success('Welcome to StoraX! 🎉');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Registration failed');
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
        <div style={{ position: 'absolute', bottom: '20%', left: '-10%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '60px' }}>
          <div style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)' }}>
            <Cloud size={20} color="white" />
          </div>
          <span style={{ fontSize: '20px', fontWeight: '700', color: 'white' }}>StoraX</span>
        </div>

        <h2 style={{ fontSize: '36px', fontWeight: '800', color: 'white', marginBottom: '16px', lineHeight: '1.2', letterSpacing: '-0.5px' }}>
          Start storing in<br />seconds.
        </h2>
        <p style={{ color: '#94A3B8', fontSize: '16px', lineHeight: '1.7', marginBottom: '40px' }}>
          Get your own private cloud storage bucket immediately after signing up.
        </p>

        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>What you get</div>
          {[
            { icon: '☁️', text: 'Private isolated storage bucket' },
            { icon: '📊', text: 'Real-time usage dashboard' },
            { icon: '💳', text: 'Automated PDF invoices' },
            { icon: '🤖', text: 'AI file compression' },
            { icon: '🔗', text: 'Shareable expiry links' },
            { icon: '🔑', text: 'API key management' },
          ].map(({ icon, text }) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
              <span style={{ fontSize: '16px' }}>{icon}</span>
              <span style={{ color: '#CBD5E1', fontSize: '14px' }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div style={{ flex: '0 0 480px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <div style={{ width: '100%', maxWidth: '380px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0F172A', marginBottom: '8px', letterSpacing: '-0.5px' }}>Create your account</h1>
          <p style={{ color: '#6B7280', fontSize: '15px', marginBottom: '32px' }}>
            Already have an account? <Link to="/login" style={{ color: '#2563EB', fontWeight: '600', textDecoration: 'none' }}>Sign in</Link>
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Full name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                <input type="text" placeholder="Shravan Pawar" value={fullName} onChange={e => setFullName(e.target.value)} style={{ paddingLeft: '42px' }} required />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Email address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                <input type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} style={{ paddingLeft: '42px' }} required />
              </div>
            </div>

            <div style={{ marginBottom: '28px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                <input type={showPassword ? 'text' : 'password'} placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} style={{ paddingLeft: '42px', paddingRight: '42px' }} required />
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
              {loading ? 'Creating account...' : <><span>Create account</span><ArrowRight size={16} /></>}
            </button>
          </form>

          <p style={{ fontSize: '12px', color: '#9CA3AF', textAlign: 'center', marginTop: '24px', lineHeight: '1.6' }}>
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;