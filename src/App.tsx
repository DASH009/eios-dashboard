import { useState } from 'react';
import LoginPage from './components/LoginPage';
import AdminPortal from './components/AdminPortal';
import Dashboard from './components/Dashboard';
import type { StudentProfile } from './lib/supabase';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'login' | 'admin' | 'dashboard'>('login');
  const [userProfile, setUserProfile] = useState<StudentProfile | null>(null);

  const handleLoginSuccess = (profile: StudentProfile) => {
    setUserProfile(profile);
    setCurrentPage('dashboard');
  };

  const handleSignOut = () => {
    setUserProfile(null);
    setCurrentPage('login');
  };

  if (currentPage === 'admin') {
    return <AdminPortal onBackToLogin={() => setCurrentPage('login')} />;
  }

  if (currentPage === 'dashboard' && userProfile) {
    return <Dashboard profile={userProfile} onSignOut={handleSignOut} />;
  }

  return (
    <LoginPage 
      onLoginSuccess={handleLoginSuccess}
      onOpenAdmin={() => setCurrentPage('admin')}
    />
  );
}