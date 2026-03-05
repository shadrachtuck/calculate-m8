import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import Calculator from './components/Calculator';
import Header from './components/Header';
import SignIn from './components/SignIn';
import type { User } from '@supabase/supabase-js';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSignInOpen, setIsSignInOpen] = useState(false);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      // Close sign-in modal if user successfully signs in
      if (session?.user) {
        setIsSignInOpen(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleSignIn = () => {
    // This will be called after successful sign-in
    setIsSignInOpen(false);
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      <Header 
        user={user} 
        onSignInClick={() => setIsSignInOpen(true)}
        onSignOut={handleSignOut}
      />
      <div className="flex-1 flex items-center justify-center">
        <Calculator user={user || undefined} />
      </div>
      {isSignInOpen && (
        <SignIn 
          onSignIn={handleSignIn}
          onClose={() => setIsSignInOpen(false)}
        />
      )}
    </div>
  );
}

export default App 