import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, FolderOpen, CreditCard,
  Shield, LogOut, Menu, X, Zap
} from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/files',     icon: FolderOpen,      label: 'My Files'  },
    { path: '/billing',   icon: CreditCard,      label: 'Billing'   },
    ...(user?.is_admin ? [{ path: '/admin', icon: Shield, label: 'Admin' }] : []),
  ];

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--dark)' }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? '260px' : '70px',
        background: 'var(--dark-2)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.3s ease',
        position: 'fixed', height: '100vh', zIndex: 100,
        overflow: 'hidden'
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'var(--gradient)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexShrink: 0
          }}>
            <Zap size={18} color="white" />
          </div>
          {sidebarOpen && <span style={{ fontSize: '20px', fontWeight: '800', background: 'var(--gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>StoraX</span>}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px' }}>
          {navItems.map(({ path, icon: Icon, label }) => {
            const active = location.pathname === path;
            return (
              <Link key={path} to={path} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px', borderRadius: '10px', marginBottom: '4px',
                  background: active ? 'rgba(108,99,255,0.2)' : 'transparent',
                  border: active ? '1px solid rgba(108,99,255,0.3)' : '1px solid transparent',
                  color: active ? 'var(--primary)' : 'var(--text-muted)',
                  transition: 'all 0.2s ease', cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}>
                  <Icon size={20} style={{ flexShrink: 0 }} />
                  {sidebarOpen && <span style={{ fontSize: '14px', fontWeight: '500' }}>{label}</span>}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User */}
        {sidebarOpen && (
          <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>{user?.full_name}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{user?.email}</div>
            </div>
            <button className="btn-danger" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }} onClick={handleLogout}>
              <LogOut size={14} /> Logout
            </button>
          </div>
        )}
      </aside>

      {/* Main */}
      <main style={{ marginLeft: sidebarOpen ? '260px' : '70px', flex: 1, transition: 'margin 0.3s ease' }}>
        {/* Topbar */}
        <div style={{
          height: '64px', background: 'var(--dark-2)', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', padding: '0 24px', gap: '16px',
          position: 'sticky', top: 0, zIndex: 99
        }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div style={{ flex: 1 }} />
          {user?.is_admin && (
            <span className="badge badge-primary">Admin</span>
          )}
        </div>
        <div style={{ padding: '32px' }}>{children}</div>
      </main>
    </div>
  );
};

export default Layout;