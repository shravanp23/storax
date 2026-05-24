import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Zap, Mail, Lock, User, ArrowRight } from 'lucide-react';

const Register: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/api/auth/register', {
        full_name: fullName,
        email: email,
        password: password
      });
      login(res.data.access_token, res.data.user);
      toast.success('Welcome to StoraX! 🎉');
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '48px', position: 'relative' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Zap size={28} color="white" />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>Create account</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Start storing with StoraX today</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>FULL NAME</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Shravan Kumar"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                style={{ paddingLeft: '42px' }}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>EMAIL ADDRESS</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ paddingLeft: '42px' }}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: '32px' }}>
            <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '8px', letterSpacing: '0.5px' }}>PASSWORD</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input
                type="password"
                placeholder="Min. 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ paddingLeft: '42px' }}
                required
              />
            </div>
          </div>

          <button
            className="btn-primary"
            type="submit"
            disabled={loading}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '15px', padding: '14px', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Creating account...' : <><span>Create Account</span><ArrowRight size={16} /></>}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;