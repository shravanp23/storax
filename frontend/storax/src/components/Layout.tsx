import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, FolderOpen, CreditCard, Shield,
  LogOut, Menu, X, Cloud, Key, ShieldAlert, Zap,
  ChevronDown, Bell, Settings, User
} from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const navItems = [
    { path: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard',   section: 'main' },
    { path: '/files',      icon: FolderOpen,      label: 'My Files',    section: 'main' },
    { path: '/billing',    icon: CreditCard,      label: 'Billing',     section: 'main' },
    { path: '/compression',icon: Zap,             label: 'AI Compress', section: 'tools' },
    { path: '/api-keys',   icon: Key,             label: 'API Keys',    section: 'tools' },
    { path: '/audit-logs', icon: Shield,          label: 'Audit Logs',  section: 'tools' },
    ...(user?.is_admin ? [{ path: '/admin', icon: ShieldAlert, label: 'Admin', section: 'admin' }] : []),
  ];

  const mainNav = navItems.filter(i => i.section === 'main');
  const toolsNav = navItems.filter(i => i.section === 'tools');
  const adminNav = navItems.filter(i => i.section === 'admin');

  const handleLogout = () => { logout(); navigate('/'); };

  const NavItem = ({ path, icon: Icon, label }: any) => {
    const active = location.pathname === path;
    return (
      <Link to={path} style={{ textDecoration: 'none' }} onClick={() => isMobile && setSidebarOpen(false)}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '9px 12px', borderRadius: '8px', marginBottom: '2px',
          background: active ? '#EFF6FF' : 'transparent',
          color: active ? '#2563EB' : '#374151',
          transition: 'all 0.15s ease', cursor: 'pointer',
          borderLeft: active ? '2px solid #2563EB' : '2px solid transparent',
        }}
          onMouseEnter={e => { if (!active) { e.currentTarget.style.background = '#F9FAFB'; e.currentTarget.style.color = '#111827'; } }}
          onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#374151'; } }}>
          <Icon size={17} style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '14px', fontWeight: active ? '600' : '500' }}>{label}</span>
        </div>
      </Link>
    );
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Inter, sans-serif' }}>

      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          zIndex: 99, backdropFilter: 'blur(4px)'
        }} />
      )}

      {/* SIDEBAR */}
      <aside style={{
        width: '240px', background: 'white',
        borderRight: '1px solid #E5E7EB',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', height: '100vh', zIndex: 100,
        transition: 'transform 0.25s ease',
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        boxShadow: isMobile && sidebarOpen ? '4px 0 20px rgba(0,0,0,0.1)' : 'none'
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '30px', height: '30px', background: '#0F172A', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Cloud size={16} color="white" />
            </div>
            <span style={{ fontSize: '17px', fontWeight: '700', color: '#0F172A', letterSpacing: '-0.3px' }}>StoraX</span>
          </div>
          {isMobile && (
            <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}>
              <X size={18} />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 10px', overflowY: 'auto' }}>
          {/* Main */}
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 12px', marginBottom: '6px' }}>Main</div>
          {mainNav.map(item => <NavItem key={item.path} {...item} />)}

          {/* Tools */}
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '16px 12px 6px' }}>Tools</div>
          {toolsNav.map(item => <NavItem key={item.path} {...item} />)}

          {/* Admin */}
          {adminNav.length > 0 && (
            <>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '16px 12px 6px' }}>Admin</div>
              {adminNav.map(item => <NavItem key={item.path} {...item} />)}
            </>
          )}
        </nav>

        {/* User Profile */}
        <div style={{ padding: '12px', borderTop: '1px solid #F3F4F6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #E5E7EB' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: 'white' }}>
                {user?.full_name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.full_name}</div>
              <div style={{ fontSize: '11px', color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{
            width: '100%', marginTop: '8px', background: 'none', border: 'none',
            display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px',
            borderRadius: '8px', cursor: 'pointer', color: '#6B7280', fontSize: '13px', fontWeight: '500',
            transition: 'all 0.15s', fontFamily: 'Inter, sans-serif'
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = '#EF4444'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#6B7280'; }}>
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ marginLeft: sidebarOpen && !isMobile ? '240px' : '0', flex: 1, transition: 'margin 0.25s ease', minWidth: 0 }}>
        {/* TOP BAR */}
        <div style={{
          height: '56px', background: 'white', borderBottom: '1px solid #E5E7EB',
          display: 'flex', alignItems: 'center', padding: '0 24px', gap: '16px',
          position: 'sticky', top: 0, zIndex: 98
        }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#6B7280', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center'
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#F3F4F6'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}>
            <Menu size={18} />
          </button>

          {/* Breadcrumb */}
          <div style={{ fontSize: '14px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>StoraX</span>
            <span>/</span>
            <span style={{ color: '#111827', fontWeight: '500' }}>
              {navItems.find(n => n.path === location.pathname)?.label || 'Dashboard'}
            </span>
          </div>

          <div style={{ flex: 1 }} />

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {user?.is_admin && (
              <span style={{ fontSize: '11px', fontWeight: '700', background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', padding: '3px 10px', borderRadius: '100px' }}>
                ADMIN
              </span>
            )}
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'white' }}>
                {user?.full_name?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* PAGE CONTENT */}
        <div style={{ padding: isMobile ? '20px 16px' : '32px' }}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;