import { useState } from 'react';
import { supabase } from '../../supabase';

interface SignInProps {
  onSignIn: () => void;
  onClose: () => void;
}

export default function SignIn({ onSignIn, onClose }: SignInProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const glow = "[text-shadow:0_0_12px_rgba(255,42,42,0.7),_0_0_7px_rgba(255,42,42,0.7),_0_0_3px_rgba(255,42,42,0.7)]";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        // Show success message
        alert('Sign up successful! Please check your email to verify your account.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onSignIn();
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div 
        className="w-[90%] max-w-[400px] rounded-sm p-6 relative"
        style={{
          background: 'linear-gradient(180deg, #2a0a0a 0%, #0a0000 100%),radial-gradient(202.43% 55.78% at 83.39% 65.71%, rgba(55, 161, 66, 0.01) 0%, rgba(0, 113, 11, 0.12) 100%), linear-gradient(270deg, rgba(148, 6, 10, 0.58) 13.07%, rgba(100, 4, 7, 0.63) 40.64%, rgba(49, 2, 3, 0.61) 65.72%, rgba(46, 2, 3, 0.60) 90.81%)',
          boxShadow: 'rgba(255, 0, 0, 0.18) 0px 0px 16px 2px inset, rgba(255, 0, 0, 0.3) 0px 0px 4px 1px inset, rgb(154 101 101 / 63%) 0px 1px 2px 1px, rgba(220, 18, 18, 0.25) -1px 7px 8px 7px inset, rgba(0, 0, 0, 0.25) -3px 5px 4px 0px inset, rgba(0, 0, 0, 0.25) 1px 0px 4px 0px inset',
          border: '1px solid rgb(0, 0, 0)',
          borderStyle: 'outset',
          backgroundBlendMode: 'normal, plus-darker',
        }}
      >
        <button 
          onClick={onClose}
          className={`absolute top-4 right-4 text-[#ff2a2a] text-2xl font-bold hover:opacity-80 ${glow}`}
        >
          &times;
        </button>
        
        <h2 className={`text-[#ff2a2a] text-2xl font-calculator mb-6 text-center ${glow}`}>
          {isSignUp ? 'Sign Up' : 'Sign In'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className={`block text-[#ff2a2a] text-sm font-calculator mb-2 ${glow}`}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 bg-black/50 border border-[#ff2a2a]/50 rounded-md focus:outline-none focus:border-[#ff2a2a] focus:ring-2 focus:ring-[#ff2a2a]/50 text-[#ff2a2a] font-calculator placeholder:text-[#ff2a2a]/50"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className={`block text-[#ff2a2a] text-sm font-calculator mb-2 ${glow}`}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2 bg-black/50 border border-[#ff2a2a]/50 rounded-md focus:outline-none focus:border-[#ff2a2a] focus:ring-2 focus:ring-[#ff2a2a]/50 text-[#ff2a2a] font-calculator placeholder:text-[#ff2a2a]/50"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className={`text-[#ff2a2a] text-sm font-calculator text-center ${glow}`}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-black/50 border border-[#ff2a2a]/50 text-[#ff2a2a] font-calculator py-2 px-4 rounded-md hover:bg-black/70 hover:border-[#ff2a2a] focus:outline-none focus:ring-2 focus:ring-[#ff2a2a]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${glow}`}
          >
            {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            className={`text-sm text-[#ff2a2a] font-calculator hover:opacity-80 ${glow}`}
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
}
