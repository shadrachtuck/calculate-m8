import type { User } from '@supabase/supabase-js';

interface HeaderProps {
  user: User | null;
  onSignInClick: () => void;
  onSignOut: () => void;
}

export default function Header({ user, onSignInClick, onSignOut }: HeaderProps) {
  const getUserInitials = (user: User) => {
    const email = user.email || '';
    const parts = email.split('@')[0].split('.');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <div className="w-full flex items-center px-4 py-4">
      {/* Left spacer: same flex weight as right so badge stays centered */}
      <div className="flex-1 min-w-0" aria-hidden="true" />
      <div className="flex-shrink-0">
        <img 
          src="/svg/badge.svg" 
          alt="calculate-m8" 
          className="h-12 w-auto"
        />
      </div>
      <div className="flex-1 flex justify-end min-w-0">
        {user ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#23272b] border border-gray-600">
              <div className="w-8 h-8 rounded-full bg-[#ff2a2a] flex items-center justify-center text-white text-sm font-calculator font-bold">
                {getUserInitials(user)}
              </div>
              <span className="text-gray-300 text-sm font-calculator hidden sm:inline">
                {user.email?.split('@')[0] || 'User'}
              </span>
            </div>
            <button
              onClick={onSignOut}
              className="px-3 py-1.5 text-sm text-gray-400 hover:text-gray-200 font-calculator transition-colors"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <button
            onClick={onSignInClick}
            className="w-10 h-10 rounded-full bg-[#23272b] border border-gray-600 flex items-center justify-center hover:bg-[#2a2f35] transition-colors"
            aria-label="Sign in"
          >
            <svg 
              className="w-6 h-6 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
