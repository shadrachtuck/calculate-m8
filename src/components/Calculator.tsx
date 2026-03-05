import { useState, useEffect } from 'react';
import Display from './Display';
import ButtonGrid from './ButtonGrid';
import HistoryPanel from './HistoryPanel';
import { supabase } from '../../supabase';
import type { User } from '@supabase/supabase-js';

interface Computation {
  id: string; // UUID from database or local ID
  computation: string;
  result: number;
  created_at: string;
  user_id?: string;
  session_id?: string;
}

interface Session {
  id: string;
  name: string;
  created_at: string;
  updated_at?: string;
  computations?: Computation[];
}

interface CalculatorProps {
  user?: User;
}

const STORAGE_KEY_SESSIONS = 'calculate-m8-sessions';
const STORAGE_KEY_CURRENT_SESSION = 'calculate-m8-current-session';
const STORAGE_KEY_ALL_COMPUTATIONS = 'calculate-m8-all-computations';

export default function Calculator({ user }: CalculatorProps) {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [computationLog, setComputationLog] = useState<string[]>([]);
  const [lastComputation, setLastComputation] = useState('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [computations, setComputations] = useState<Computation[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);

  // Load sessions and current session from storage/database on mount
  useEffect(() => {
    if (user) {
      fetchSessions();
      fetchComputations();
    } else {
      loadLocalSessions();
      loadCurrentSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // When currentSessionId changes, reload computations if user is signed in
  useEffect(() => {
    if (user) {
      if (currentSessionId) {
        fetchComputations(currentSessionId);
      } else {
        fetchComputations();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSessionId, user]);

  // Update computation log when computations change
  useEffect(() => {
    if (computations.length > 0) {
      setComputationLog(computations.slice(0, 3).map(comp => comp.computation));
    }
  }, [computations]);

  const fetchSessions = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const fetchComputations = async (sessionId?: string | null) => {
    if (!user) return;
    try {
      let query = supabase
        .from('computations')
        .select('*')
        .eq('user_id', user.id);

      if (sessionId) {
        query = query.eq('session_id', sessionId);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setComputations(data || []);
    } catch (error) {
      console.error('Error fetching computations:', error);
    }
  };

  const loadLocalSessions = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SESSIONS);
      if (stored) {
        setSessions(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading local sessions:', error);
    }
  };

  const loadCurrentSession = () => {
    try {
      // Load all computations from storage
      const allCompsStored = localStorage.getItem(STORAGE_KEY_ALL_COMPUTATIONS);
      if (allCompsStored) {
        const allComps = JSON.parse(allCompsStored);
        // Load current session if any
        const stored = localStorage.getItem(STORAGE_KEY_CURRENT_SESSION);
        if (stored) {
          const session = JSON.parse(stored);
          setCurrentSessionId(session.id);
          // Filter computations by session_id to show only this session's computations
          setComputations(allComps.filter((c: Computation) => c.session_id === session.id));
        } else {
          // No active session, show all computations
          setComputations(allComps);
          setCurrentSessionId(null);
        }
      } else {
        // No computations stored yet
        setComputations([]);
        setCurrentSessionId(null);
      }
    } catch (error) {
      console.error('Error loading current session:', error);
    }
  };

  const saveLocalSession = (session: Session) => {
    try {
      const existing = localStorage.getItem(STORAGE_KEY_SESSIONS);
      const sessions = existing ? JSON.parse(existing) : [];
      const updated = [session, ...sessions.filter((s: Session) => s.id !== session.id)];
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(updated));
      setSessions(updated);
    } catch (error) {
      console.error('Error saving local session:', error);
    }
  };

  const saveCurrentSessionToLocal = (computations: Computation[]) => {
    try {
      // Save all computations to master list
      localStorage.setItem(STORAGE_KEY_ALL_COMPUTATIONS, JSON.stringify(computations));
      
      if (currentSessionId) {
        const session: Session = {
          id: currentSessionId,
          name: sessions.find(s => s.id === currentSessionId)?.name || 'Untitled',
          created_at: new Date().toISOString(),
          computations
        };
        localStorage.setItem(STORAGE_KEY_CURRENT_SESSION, JSON.stringify(session));
      }
    } catch (error) {
      console.error('Error saving current session:', error);
    }
  };

  const inputNumber = (num: number) => {
    if (waitingForOperand) {
      setDisplay(String(num));
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? String(num) : display + num);
    }
  };

  const inputOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string): number => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '×':
        return firstValue * secondValue;
      case '÷':
        return firstValue / secondValue;
      default:
        return secondValue;
    }
  };

  const performCalculation = async () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      const computation = `${previousValue}${operation}${inputValue}=${newValue}`;

      setDisplay(String(newValue));
      setLastComputation(computation);

      const newComputation: Computation = {
        id: user ? crypto.randomUUID() : `local-${Date.now()}-${Math.random()}`,
        computation,
        result: newValue,
        created_at: new Date().toISOString(),
        user_id: user?.id,
        session_id: currentSessionId || undefined,
      };

      // Save computation
      if (user) {
        // Save to database
        try {
          const { error } = await supabase
            .from('computations')
            .insert([{ 
              computation, 
              result: newValue, 
              user_id: user.id,
              session_id: currentSessionId || null
            }]);

          if (error) throw error;
          
          // Refresh computations
          fetchComputations();
        } catch (error) {
          console.error('Error saving computation:', error);
        }
      } else {
        // Save to local storage
        const updated = [newComputation, ...computations];
        setComputations(updated);
        // Save all computations to master list
        localStorage.setItem(STORAGE_KEY_ALL_COMPUTATIONS, JSON.stringify(updated));
        if (currentSessionId) {
          const session: Session = {
            id: currentSessionId,
            name: sessions.find(s => s.id === currentSessionId)?.name || 'Untitled',
            created_at: new Date().toISOString(),
            computations: updated.filter(c => c.session_id === currentSessionId)
          };
          localStorage.setItem(STORAGE_KEY_CURRENT_SESSION, JSON.stringify(session));
        }
      }

      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  };

  const clearAll = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const handleHistorySelect = (computation: Computation) => {
    setDisplay(String(computation.result));
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
    setLastComputation(computation.computation);
    setIsHistoryOpen(false);
  };

  const handleSaveSession = async (name: string, existingSessionId?: string) => {
    // Find the last saved computation (oldest one with session_id)
    // Since computations are sorted newest first, find the last index with session_id
    let lastSavedIndex = -1;
    let lastSavedTimestamp: string | null = null;
    for (let i = computations.length - 1; i >= 0; i--) {
      if (computations[i].session_id) {
        lastSavedIndex = i;
        lastSavedTimestamp = computations[i].created_at;
        break;
      }
    }

    // Get all computations made before the last session (newer than last saved, or all if none saved)
    // Since list is sorted newest first, we want computations from index 0 to lastSavedIndex-1
    // Or all computations if nothing is saved yet
    const computationsToSave = lastSavedIndex >= 0
      ? computations.slice(0, lastSavedIndex).filter(c => !c.session_id)
      : computations.filter(c => !c.session_id);
    
    if (computationsToSave.length === 0) {
      alert('No computations to save.');
      return;
    }

    if (user) {
      // Save to database
      try {
        let sessionId: string;
        
        if (existingSessionId) {
          // Add to existing session
          sessionId = existingSessionId;
        } else {
          // Create new session
          const { data, error } = await supabase
            .from('sessions')
            .insert([{ 
              name, 
              user_id: user.id 
            }])
            .select()
            .single();

          if (error) throw error;
          sessionId = data.id;
        }

        // Update computations with session_id
        if (computationsToSave.length > 0) {
          const { error: updateError } = await supabase
            .from('computations')
            .update({ session_id: sessionId })
            .in('id', computationsToSave.map(c => c.id));

          if (updateError) throw updateError;
        }

        await fetchSessions();
        // Refresh all computations to show updated session_ids
        await fetchComputations();
      } catch (error) {
        console.error('Error saving session:', error);
        throw error;
      }
    } else {
      // Save to local storage
      let sessionId: string;
      let sessionName: string;
      
      if (existingSessionId) {
        // Add to existing session
        const existingSession = sessions.find(s => s.id === existingSessionId);
        if (!existingSession) throw new Error('Session not found');
        sessionId = existingSessionId;
        sessionName = existingSession.name;
        
        // Update existing session with new computations
        const updatedSession: Session = {
          ...existingSession,
          computations: [...(existingSession.computations || []), ...computationsToSave.map(c => ({ ...c, session_id: sessionId }))],
        };
        saveLocalSession(updatedSession);
      } else {
        // Create new session
        sessionId = crypto.randomUUID();
        sessionName = name;
        const newSession: Session = {
          id: sessionId,
          name,
          created_at: new Date().toISOString(),
          computations: computationsToSave.map(c => ({ ...c, session_id: sessionId })),
        };
        saveLocalSession(newSession);
      }
      
      // Update computations with session_id
      const updated = computations.map(c => 
        computationsToSave.some(tc => tc.id === c.id) 
          ? { ...c, session_id: sessionId }
          : c
      );
      setComputations(updated);
      // Save all computations to master list
      localStorage.setItem(STORAGE_KEY_ALL_COMPUTATIONS, JSON.stringify(updated));
    }
  };

  const handleLoadSession = (session: Session) => {
    setCurrentSessionId(session.id);
    if (user) {
      // Load from database - filter by session_id to show all computations in this session
      fetchComputations(session.id);
    } else {
      // Load from local storage - get all computations and filter by session_id
      try {
        const allCompsStored = localStorage.getItem(STORAGE_KEY_ALL_COMPUTATIONS);
        if (allCompsStored) {
          const allComps: Computation[] = JSON.parse(allCompsStored);
          // Filter to show only computations in this session
          const sessionComps = allComps.filter(c => c.session_id === session.id);
          setComputations(sessionComps);
        } else {
          // Fallback to session's stored computations
          setComputations(session.computations || []);
        }
        // Save current session reference
        localStorage.setItem(STORAGE_KEY_CURRENT_SESSION, JSON.stringify(session));
      } catch (error) {
        console.error('Error loading session:', error);
        setComputations(session.computations || []);
      }
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (user) {
      try {
        const { error } = await supabase
          .from('sessions')
          .delete()
          .eq('id', sessionId);

        if (error) throw error;
        await fetchSessions();
        if (currentSessionId === sessionId) {
          setCurrentSessionId(null);
          await fetchComputations();
        } else {
          await fetchComputations(currentSessionId);
        }
      } catch (error) {
        console.error('Error deleting session:', error);
      }
    } else {
      const updated = sessions.filter(s => s.id !== sessionId);
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(updated));
      setSessions(updated);
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
        setComputations([]);
        localStorage.removeItem(STORAGE_KEY_CURRENT_SESSION);
      }
    }
  };

  const handleClearSession = () => {
    setCurrentSessionId(null);
    if (user) {
      fetchComputations();
    } else {
      // Load all computations when clearing session filter
      try {
        const allCompsStored = localStorage.getItem(STORAGE_KEY_ALL_COMPUTATIONS);
        if (allCompsStored) {
          const allComps: Computation[] = JSON.parse(allCompsStored);
          setComputations(allComps);
        } else {
          setComputations([]);
        }
        localStorage.removeItem(STORAGE_KEY_CURRENT_SESSION);
      } catch (error) {
        console.error('Error clearing session:', error);
        setComputations([]);
      }
    }
  };

  return (
    <div className="w-[330px] h-[600px] rounded-2xl flex flex-col items-center pt-6 pb-4 mx-auto gap-y-1" style={{
      background: 'linear-gradient(180deg, #D9D9D9 0%, #B8B8B8 100%)',
      boxShadow: `
        rgb(209 207 207 / 86%) 4px 6px 5px 1px inset, rgb(0 0 0 / 78%) 3px 9px 13px 8px, rgb(0 0 0 / 56%) -1px -7px 12px 12px inset, inset rgb(255 255 255 / 86%) 0px 2px 9px 7px, rgb(255 255 255 / 86%) 6px -15px 9px 7px inset`,
      borderTop: '1px solid rgba(184, 184, 184, 0.5)'
    }}>
      <Display
        display={display}
        computationLog={computationLog}
        lastComputation={lastComputation}
        onHistoryClick={() => setIsHistoryOpen(true)}
      />
      <div
        className="w-[240px] h-10 rounded-[2px] bg-[#23272b] flex items-center justify-center"
        style={{
          boxShadow: 'rgba(0, 0, 0, 0.7) 0px 2px 3px inset, rgba(255, 255, 239, 0.78) 0px 4px 4px -1.5px, rgb(0, 0, 0) 0px 2px 2px 0px inset',
          borderTop: '1px solid rgb(0, 0, 0)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '5px',
          border: '1px solid rgba(221, 208, 208, 0.92)',
        }
        }
      >
        <div className="flex items-center justify-center space-x-1">
          <span className="text-[#8a8585] text-lg font-normal font-michroma tracking-wide">calculate</span>
          <span className="text-[#8a8585] text-lg font-normal" style={{ position: 'relative', top: '2px' }}>|</span>
          <span className="text-[#8a8585] text-lg font-normal font-michroma tracking-wide">M8</span>
        </div>
      </div>
      <ButtonGrid
        onNumberClick={inputNumber}
        onOperationClick={inputOperation}
        onCalculate={performCalculation}
        onClear={clearAll}
      />
      <HistoryPanel
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        computations={computations}
        onSelect={handleHistorySelect}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSaveSession={handleSaveSession}
        onLoadSession={handleLoadSession}
        onDeleteSession={handleDeleteSession}
        onClearSession={handleClearSession}
        user={user}
      />
    </div>
  );
} 