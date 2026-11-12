import React, { useState } from 'react';
import { registerStudentByAdmin } from '../lib/supabase';
import type { StudentProfile } from '../lib/supabase';

const LockIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const KeyIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2l-2 2m-1.5 1.5l-3 3m-5 5a7 7 0 1 1 3-3l4 4-2 2 1.5 1.5 2.5-2.5 1.5 1.5 2.5-2.5" />
  </svg>
);

interface AdminPortalProps {
  onBackToLogin: () => void;
}

// Master Admin Password (can be overridden in .env.local via VITE_ADMIN_PASSCODE)
const MASTER_PASSCODE = import.meta.env.VITE_ADMIN_PASSCODE || 'eiosadmin';

export default function AdminPortal({ onBackToLogin }: AdminPortalProps) {
  // Gate State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');

  // Form State
  const [schoolName, setSchoolName] = useState('');
  const [parentName, setParentName] = useState('');
  const [studentName, setStudentName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [createdProfile, setCreatedProfile] = useState<StudentProfile | null>(null);

  // Authenticate Admin Passcode
  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasscodeError('');

    if (passcode === MASTER_PASSCODE) {
      setIsAuthenticated(true);
      setPasscode('');
    } else {
      setPasscodeError('Invalid Admin Passcode. Access denied.');
    }
  };

  // Submit Student Registration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const profile = await registerStudentByAdmin({
        school_name: schoolName,
        parent_name: parentName,
        student_name: studentName,
        mobile_number: mobileNumber,
      });

      setCreatedProfile(profile);
      setSchoolName('');
      setParentName('');
      setStudentName('');
      setMobileNumber('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate record.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#050505] text-white flex flex-col justify-between p-6 sm:p-12 font-sans relative overflow-hidden">
      
      {/* Ambient Glows */}
      <div 
        className="absolute pointer-events-none rounded-full"
        style={{
          top: '-10%',
          right: '-10%',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, rgba(139, 92, 246, 0.15) 50%, transparent 75%)',
          filter: 'blur(70px)',
        }}
      />

      {/* Header */}
      <div className="flex justify-between items-center z-10 max-w-5xl w-full mx-auto">
        <h1 className="text-3xl tracking-widest text-white" style={{ fontFamily: "'Silkscreen', cursive" }}>EiOS</h1>
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <button
              onClick={() => setIsAuthenticated(false)}
              className="px-3.5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-semibold transition-all duration-200"
            >
              Lock Admin
            </button>
          )}
          <button
            onClick={onBackToLogin}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-xs font-medium transition-all duration-200"
          >
            ← Back to Portal Login
          </button>
        </div>
      </div>

      {/* Content Body */}
      <div className="max-w-md w-full mx-auto my-12 z-10">
        
        {!isAuthenticated ? (
          /* STEP 1: SECURITY GATE */
          <div>
            <div className="mb-8 text-center sm:text-left">
              <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mb-4">
                <LockIcon className="w-6 h-6" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-white mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Restricted Access
              </h2>
              <p className="text-sm text-[#94A3B8]">
                Enter the master administrative passcode to access student enrolment.
              </p>
            </div>

            <div className="bg-[#121212] rounded-2xl p-6 sm:p-8 border border-[#262626] shadow-2xl">
              {passcodeError && (
                <div className="mb-6 p-3 bg-red-950/40 border border-red-500/30 text-red-300 text-xs font-medium rounded-lg">
                  {passcodeError}
                </div>
              )}

              <form onSubmit={handlePasscodeSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#D4D4D4] mb-1.5">Admin Security Code</label>
                  <div className="relative">
                    <input
                      type="password"
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-xl bg-[#1A1A1A] border border-[#333333] text-white text-sm placeholder-[#666666] focus:outline-none focus:border-[#3B82F6]"
                      required
                    />
                    <KeyIcon className="w-4 h-4 text-[#666666] absolute right-4 top-3.5 pointer-events-none" />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg shadow-blue-500/25"
                >
                  Unlock Admin Portal
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* STEP 2: ENROLMENT FORM */
          <div>
            <div className="mb-8 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4">
                <span className="w-2 h-2 rounded-full bg-[#3B82F6] animate-pulse"></span>
                <span className="text-xs font-semibold text-[#3B82F6] tracking-wide uppercase">Admin Operations</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-white mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Student Enrolment System
              </h2>
              <p className="text-sm text-[#94A3B8]">
                Enter student details to auto-assign a unique EiOS login ID.
              </p>
            </div>

            <div className="bg-[#121212] rounded-2xl p-6 sm:p-8 border border-[#262626] shadow-2xl">
              
              {createdProfile && (
                <div className="mb-6 p-4 bg-green-950/40 border border-green-500/30 rounded-xl text-left">
                  <span className="text-xs font-bold text-green-400 uppercase tracking-wider block mb-1">
                    ✓ Generated Successfully
                  </span>
                  <span className="text-xs text-green-200 block">
                    Unique Login ID for <strong>{createdProfile.student_name}</strong>:
                  </span>
                  <div className="mt-2 flex items-center justify-between bg-black/50 p-2.5 rounded-lg border border-green-500/40">
                    <span className="text-xl font-mono font-bold text-green-300 tracking-widest">{createdProfile.user_id}</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(createdProfile.user_id)}
                      className="text-[11px] font-semibold bg-green-900/50 hover:bg-green-800 text-green-200 px-2 py-1 rounded transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="mb-6 p-3 bg-red-950/40 border border-red-500/30 text-red-300 text-xs font-medium rounded-lg">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#D4D4D4] mb-1.5">School Name</label>
                  <input
                    type="text"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    placeholder="e.g. ROYAL PUBLIC SCHOOL"
                    className="w-full px-4 py-3 rounded-xl bg-[#1A1A1A] border border-[#333333] text-white text-sm placeholder-[#666666] focus:outline-none focus:border-[#3B82F6]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#D4D4D4] mb-1.5">Parent Name</label>
                    <input
                      type="text"
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      placeholder="Parent Name"
                      className="w-full px-4 py-3 rounded-xl bg-[#1A1A1A] border border-[#333333] text-white text-sm placeholder-[#666666] focus:outline-none focus:border-[#3B82F6]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#D4D4D4] mb-1.5">Student Name</label>
                    <input
                      type="text"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="Student Name"
                      className="w-full px-4 py-3 rounded-xl bg-[#1A1A1A] border border-[#333333] text-white text-sm placeholder-[#666666] focus:outline-none focus:border-[#3B82F6]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#D4D4D4] mb-1.5">Registered Mobile Number</label>
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-3 rounded-xl bg-[#1A1A1A] border border-[#333333] text-white text-sm placeholder-[#666666] focus:outline-none focus:border-[#3B82F6]"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg shadow-blue-500/25 mt-2"
                >
                  {isLoading ? 'Generating unique ID...' : 'Register & Assign Unique ID'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-[#525252] z-10">
        © {new Date().getFullYear()} EiOS Enterprise Systems — Internal Portal
      </div>
    </div>
  );
}