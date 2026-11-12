import React, { useState } from 'react';
import { findProfileByIdentifier, isSupabaseConfigured, supabase, type StudentProfile } from '../lib/supabase';

const ShieldIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
  </svg>
);

const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const LockIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

interface LoginPageProps {
  onLoginSuccess: (profile: StudentProfile) => void;
  onOpenAdmin: () => void;
}

export default function LoginPage({ onLoginSuccess, onOpenAdmin }: LoginPageProps) {
  const [step, setStep] = useState<'identifier' | 'otp'>('identifier');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [matchedProfile, setMatchedProfile] = useState<StudentProfile | null>(null);

  // Helper to mask phone number for display (+91 9876543210 -> +91 98******10)
  const maskPhone = (phone: string) => {
    if (!phone || phone.length < 6) return phone;
    const visibleStart = phone.slice(0, 6);
    const visibleEnd = phone.slice(-2);
    return `${visibleStart}******${visibleEnd}`;
  };

  // STEP 1: Look up profile & trigger OTP code
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!identifier.trim()) return;

    setIsLoading(true);

    try {
      const profile = await findProfileByIdentifier(identifier);
      if (!profile) {
        setErrorMsg('No registered record found for this Unique ID or Mobile Number.');
        setIsLoading(false);
        return;
      }

      setMatchedProfile(profile);

      // If Supabase is active, trigger SMS OTP via Supabase Auth
      if (isSupabaseConfigured) {
        const formattedPhone = profile.mobile_number.startsWith('+') 
          ? profile.mobile_number 
          : `+91${profile.mobile_number.replace(/\D/g, '')}`;
        const { error } = await supabase.auth.signInWithOtp({ phone: formattedPhone });
        if (error) throw error;
      }

      setStep('otp');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to issue verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 2: Verify OTP code & authenticate
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!otp.trim() || !matchedProfile) return;

    setIsLoading(true);

    try {
      if (isSupabaseConfigured) {
        const formattedPhone = matchedProfile.mobile_number.startsWith('+') 
          ? matchedProfile.mobile_number 
          : `+91${matchedProfile.mobile_number.replace(/\D/g, '')}`;
        
        const { error } = await supabase.auth.verifyOtp({
          phone: formattedPhone,
          token: otp,
          type: 'sms',
        });
        if (error) throw error;
      } else {
        // Local Simulation mode: simulate network delay & verify demo code (123456 or any 6 digits)
        await new Promise((resolve) => setTimeout(resolve, 700));
        if (otp !== '123456' && otp.length !== 6) {
          throw new Error('Invalid verification code. (Demo code: 123456)');
        }
      }

      onLoginSuccess(matchedProfile);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid code. Please check and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full font-sans bg-white selection:bg-[#3B82F6] selection:text-white">
      
      {/* LEFT PANEL */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-[#050505] text-white p-14 flex-col justify-between overflow-hidden border-r border-[#1F1F1F]">
        <div 
          className="absolute pointer-events-none rounded-full"
          style={{
            top: '-15%',
            left: '-15%',
            width: '550px',
            height: '550px',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.35) 0%, rgba(139, 92, 246, 0.2) 45%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />

        <div className="relative z-10">
          <h1 className="text-3xl text-white tracking-widest" style={{ fontFamily: "'Silkscreen', cursive" }}>EiOS</h1>
        </div>

        <div className="relative z-10 max-w-md mt-[-8vh]">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#3B82F6] animate-pulse"></span>
            <span className="text-xs font-medium text-[#E2E8F0] tracking-wide uppercase">Enterprise Security</span>
          </div>

          <h2 
            className="text-[3rem] font-bold mb-6 leading-[1.05] tracking-tight text-white" 
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            One platform.<br />
            <span 
              style={{
                background: 'linear-gradient(90deg, #FFFFFF 0%, #94A3B8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Every possibility.
            </span>
          </h2>

          <p className="text-[#94A3B8] text-[1.1rem] leading-relaxed font-medium">
            A smarter, seamless way for schools, parents, teachers, and students to stay connected.
          </p>
        </div>

        <div className="relative z-10 flex items-center justify-between text-[#475569] text-sm font-medium">
          <span>© {new Date().getFullYear()} EiOS Systems.</span>
          <button 
            onClick={onOpenAdmin}
            className="hover:text-white transition-colors duration-300 text-xs font-semibold text-[#64748B] underline underline-offset-4"
          >
            Admin Portal Access →
          </button>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-6 sm:p-12 relative bg-[#FAFAFA]">
        <div className="lg:hidden absolute top-8 left-8">
          <h1 className="text-2xl text-[#050505] tracking-widest" style={{ fontFamily: "'Silkscreen', cursive" }}>EiOS</h1>
        </div>

        <div className="w-full max-w-440px">
          
          {step === 'identifier' ? (
            /* STEP 1: ENTER UNIQUE ID / MOBILE NUMBER */
            <div>
              <div className="mb-10">
                <h2 className="text-[28px] font-semibold text-[#0A0A0A] mb-2 tracking-tight">Welcome back</h2>
                <p className="text-[15px] text-[#525252]">Enter your Unique ID or registered Mobile Number.</p>
              </div>

              <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-[0_2px_40px_-12px_rgba(0,0,0,0.08)] border border-[#E5E5E5]">
                {errorMsg && (
                  <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-[13px] font-medium rounded-lg">
                    {errorMsg}
                  </div>
                )}

                <form onSubmit={handleRequestOtp} className="space-y-6">
                  <div className="space-y-2.5">
                    <label htmlFor="identifier" className="block text-[13px] font-semibold text-[#171717]">
                      Login ID or Mobile Number
                    </label>
                    <input
                      id="identifier"
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="e.g. EIOS-100101 or +919876543210"
                      className="w-full px-4 py-3.5 rounded-xl bg-white border border-[#D4D4D4] text-[#0A0A0A] text-[15px] placeholder-[#A3A3A3] focus:outline-none focus:ring-4 focus:ring-[#3B82F6]/10 focus:border-[#3B82F6] transition-all duration-300"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !identifier.trim()}
                    className="group w-full bg-[#050505] hover:bg-[#171717] text-white py-3.5 rounded-xl text-[15px] font-medium transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_14px_0_rgba(0,0,0,0.2)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.23)] hover:-translate-y-1px"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        Send Security Code
                        <ArrowRightIcon className="w-4 h-4 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          ) : (
            /* STEP 2: VERIFY OTP CODE */
            <div>
              <div className="mb-8">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <LockIcon className="w-5 h-5" />
                </div>
                <h2 className="text-[28px] font-semibold text-[#0A0A0A] mb-2 tracking-tight">Security Verification</h2>
                <p className="text-[14px] text-[#525252]">
                  We sent a 6-digit code to registered mobile <strong className="text-[#0A0A0A]">{maskPhone(matchedProfile?.mobile_number || '')}</strong> linked to <span className="font-mono font-bold text-blue-600">{matchedProfile?.user_id}</span>.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-[0_2px_40px_-12px_rgba(0,0,0,0.08)] border border-[#E5E5E5]">
                
                {!isSupabaseConfigured && (
                  <div className="mb-4 p-2.5 bg-blue-50 border border-blue-200 text-blue-700 text-[12px] font-semibold rounded-lg text-center">
                    💡 Demo Mode Passcode: <span className="font-mono font-bold text-blue-900 text-sm">123456</span>
                  </div>
                )}

                {errorMsg && (
                  <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-[13px] font-medium rounded-lg">
                    {errorMsg}
                  </div>
                )}

                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div className="space-y-2.5">
                    <label htmlFor="otp" className="block text-[13px] font-semibold text-[#171717]">
                      Enter 6-Digit Code
                    </label>
                    <input
                      id="otp"
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="000000"
                      maxLength={6}
                      className="w-full px-4 py-3.5 rounded-xl bg-white border border-[#D4D4D4] text-[#0A0A0A] text-[20px] placeholder-[#A3A3A3] focus:outline-none focus:ring-4 focus:ring-[#3B82F6]/10 focus:border-[#3B82F6] transition-all duration-300 text-center tracking-[0.5em] font-mono"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || otp.length < 6}
                    className="group w-full bg-[#050505] hover:bg-[#171717] text-white py-3.5 rounded-xl text-[15px] font-medium transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_14px_0_rgba(0,0,0,0.2)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.23)] hover:-translate-y-1px"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        Verify & Access Workspace
                        <ArrowRightIcon className="w-4 h-4 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep('identifier');
                      setOtp('');
                      setErrorMsg('');
                    }}
                    className="w-full text-[#737373] text-[13px] font-medium hover:text-[#0A0A0A] transition-colors"
                  >
                    Use a different Unique ID or Number
                  </button>
                </form>
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center justify-center gap-2 text-[#737373]">
            <ShieldIcon className="w-4 h-4" />
            <span className="text-[13px] font-medium">End-to-end encrypted connection.</span>
          </div>

          <div className="mt-6 text-center lg:hidden">
            <button
              onClick={onOpenAdmin}
              className="text-xs font-semibold text-[#525252] hover:text-[#0A0A0A] underline"
            >
              Go to Admin Portal →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}