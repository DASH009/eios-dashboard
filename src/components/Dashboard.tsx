import { type StudentProfile } from '../lib/supabase';

const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

interface DashboardProps {
  profile: StudentProfile;
  onSignOut: () => void;
}

export default function Dashboard({ profile, onSignOut }: DashboardProps) {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-460px bg-white rounded-2xl p-8 sm:p-10 shadow-[0_2px_40px_-12px_rgba(0,0,0,0.08)] border border-[#E5E5E5] text-center">
        <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircleIcon className="w-8 h-8" />
        </div>
        <h2 className="text-[24px] font-semibold text-[#0A0A0A] mb-1">Welcome to EiOS Workspace</h2>
        <p className="text-[14px] text-[#737373] mb-6">{profile.school_name}</p>

        <div className="bg-[#F5F5F5] rounded-xl p-5 mb-6 border border-[#E5E5E5] text-left space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-[#E5E5E5]">
            <span className="text-[12px] font-semibold text-[#737373]">Assigned Unique ID</span>
            <span className="text-[16px] font-mono font-bold text-[#0A0A0A] bg-white px-2.5 py-1 rounded border border-[#D4D4D4]">{profile.user_id}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[12px] font-semibold text-[#737373]">Student Name</span>
            <span className="text-[14px] font-medium text-[#0A0A0A]">{profile.student_name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[12px] font-semibold text-[#737373]">Parent Name</span>
            <span className="text-[14px] font-medium text-[#0A0A0A]">{profile.parent_name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[12px] font-semibold text-[#737373]">Mobile Number</span>
            <span className="text-[14px] font-medium text-[#0A0A0A]">{profile.mobile_number}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onSignOut}
          className="w-full bg-[#050505] hover:bg-[#171717] text-white py-3.5 rounded-xl text-[14px] font-medium transition-all duration-300"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}