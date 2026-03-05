import React, { useState } from 'react';
import type { User } from '@supabase/supabase-js';

interface Computation {
  id: string;
  computation: string;
  result: number;
  created_at: string;
  session_id?: string;
}

interface Session {
  id: string;
  name: string;
  created_at: string;
  updated_at?: string;
  computations?: Computation[];
}

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  computations: Computation[];
  onSelect: (computation: Computation) => void;
  sessions?: Session[];
  currentSessionId?: string | null;
  onSaveSession: (name: string, existingSessionId?: string) => Promise<void>;
  onLoadSession: (session: Session) => void;
  onDeleteSession: (sessionId: string) => void;
  onClearSession: () => void;
  user?: User;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ 
  isOpen, 
  onClose, 
  computations, 
  onSelect,
  sessions = [],
  currentSessionId,
  onSaveSession,
  onLoadSession,
  onDeleteSession,
  onClearSession,
  user: _user
}) => {
  const [activeTab, setActiveTab] = useState<'computations' | 'sessions'>('computations');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [sessionName, setSessionName] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveClick = () => {
    setShowSaveModal(true);
    setSessionName('');
    setSelectedSessionId(null);
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If adding to existing session, don't require name
    if (selectedSessionId) {
      setSaving(true);
      try {
        await onSaveSession('', selectedSessionId);
        setShowSaveModal(false);
        setSessionName('');
        setSelectedSessionId(null);
      } catch (error) {
        console.error('Error saving session:', error);
        alert('Failed to save session. Please try again.');
      } finally {
        setSaving(false);
      }
      return;
    }
    
    // Creating new session requires name
    if (!sessionName.trim()) return;
    
    setSaving(true);
    try {
      await onSaveSession(sessionName.trim());
      setShowSaveModal(false);
      setSessionName('');
      setSelectedSessionId(null);
      setActiveTab('sessions');
    } catch (error) {
      console.error('Error saving session:', error);
      alert('Failed to save session. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Calculate computations that will be saved (all made before the last session)
  // Find the last (oldest) saved computation
  let lastSavedIndex = -1;
  for (let i = computations.length - 1; i >= 0; i--) {
    if (computations[i].session_id) {
      lastSavedIndex = i;
      break;
    }
  }
  const computationsToSave = lastSavedIndex >= 0
    ? computations.slice(0, lastSavedIndex).filter(c => !c.session_id)
    : computations.filter(c => !c.session_id);

  // Group computations by session and find the last computation in each session
  // This is where we'll show the session header
  const sessionHeaders = new Map<string, number>(); // sessionId -> index of last computation
  const sessionComputations = new Map<string, Computation[]>(); // sessionId -> computations
  
  computations.forEach((comp, index) => {
    if (comp.session_id) {
      if (!sessionComputations.has(comp.session_id)) {
        sessionComputations.set(comp.session_id, []);
      }
      sessionComputations.get(comp.session_id)!.push(comp);
      // Update the last index for this session (oldest computation)
      sessionHeaders.set(comp.session_id, index);
    }
  });
  
  const getSessionName = (sessionId: string | undefined) => {
    if (!sessionId) return null;
    return sessions.find(s => s.id === sessionId)?.name || null;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="w-[90%] max-w-[400px] max-h-[80vh] bg-gray-100 rounded-lg overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-gray-300 flex justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('computations')}
              className={`px-3 py-1 rounded text-sm font-michroma transition-colors ${
                activeTab === 'computations'
                  ? 'bg-gray-300 text-gray-800'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              Computations
            </button>
            <button
              onClick={() => setActiveTab('sessions')}
              className={`px-3 py-1 rounded text-sm font-michroma transition-colors ${
                activeTab === 'sessions'
                  ? 'bg-gray-300 text-gray-800'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              Sessions
            </button>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 text-2xl font-bold hover:text-gray-800"
          >
            &times;
          </button>
        </div>
        <div className="p-4 overflow-y-auto max-h-[calc(80vh-65px)]">
          {activeTab === 'computations' ? (
            <>
              {computations.length === 0 ? (
                <p className="text-gray-500 text-sm font-calculator text-center py-8">No calculations yet</p>
              ) : (
                <>
                  <div className="mb-4">
                    <button
                      onClick={handleSaveClick}
                      className="w-full px-3 py-1 rounded text-sm font-michroma transition-colors bg-gray-300 text-gray-800 hover:bg-gray-400 mb-3"
                    >
                      {computationsToSave.length > 0 
                        ? `Save Session (${computationsToSave.length} computation${computationsToSave.length !== 1 ? 's' : ''})`
                        : 'Save Session'}
                    </button>
                  </div>
                  <div className="space-y-3">
                    {computations.map((comp, index) => {
                      // Check if this is the last computation in a session (show header above it)
                      const isLastInSession = comp.session_id && sessionHeaders.get(comp.session_id) === index;
                      const sessionName = comp.session_id ? getSessionName(comp.session_id) : null;
                      const showSessionHeader = isLastInSession && sessionName;
                      
                      return (
                        <div key={comp.id}>
                          {showSessionHeader && (
                            <div className="mb-2 px-3 py-2 bg-gray-200 border border-gray-400 rounded text-left">
                              <span className="text-gray-800 text-sm font-michroma font-bold">
                                {sessionName}
                              </span>
                            </div>
                          )}
                          <button 
                            onClick={() => onSelect(comp)}
                            className="w-full text-left border border-gray-300 rounded p-3 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                          >
                            <div className="text-gray-800 text-lg font-calculator mb-1 truncate">
                              {comp.computation}
                            </div>
                            <div className="text-gray-500 text-sm font-calculator">
                              {new Date(comp.created_at).toLocaleString()}
                            </div>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              {currentSessionId && (
                <div className="mb-4">
                  <button
                    onClick={onClearSession}
                    className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors font-calculator text-sm"
                  >
                    View All Computations
                  </button>
                </div>
              )}
              {sessions.length === 0 ? (
                <p className="text-gray-500 text-sm font-calculator text-center py-8">No saved sessions yet</p>
              ) : (
                <div className="space-y-3">
                  {sessions.map((session) => {
                    const isExpanded = expandedSessionId === session.id;
                    // Get computations for this session
                    const sessionComps = session.computations || computations.filter(c => c.session_id === session.id);
                    const sortedSessionComps = [...sessionComps].sort((a, b) => 
                      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                    );
                    
                    return (
                      <div
                        key={session.id}
                        className={`border rounded p-3 transition-colors ${
                          currentSessionId === session.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div 
                          className="flex justify-between items-start mb-2 cursor-pointer"
                          onClick={() => setExpandedSessionId(isExpanded ? null : session.id)}
                        >
                          <div className="flex-1">
                            <div className="text-gray-800 text-lg font-calculator font-bold mb-1 flex items-center gap-2">
                              <span>{session.name}</span>
                              {currentSessionId === session.id && (
                                <span className="text-xs text-blue-600">(Active)</span>
                              )}
                              <span className="text-xs text-gray-500">
                                {isExpanded ? '▼' : '▶'}
                              </span>
                            </div>
                            <div className="text-gray-500 text-xs font-calculator">
                              {new Date(session.created_at).toLocaleString()}
                              {` • ${sortedSessionComps.length} computation${sortedSessionComps.length !== 1 ? 's' : ''}`}
                            </div>
                          </div>
                          <div className="flex gap-2 ml-2" onClick={(e) => e.stopPropagation()}>
                            {currentSessionId !== session.id && (
                              <button
                                onClick={() => onLoadSession(session)}
                                className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 font-calculator"
                              >
                                Load
                              </button>
                            )}
                            <button
                              onClick={() => {
                                if (confirm(`Delete session "${session.name}"?`)) {
                                  onDeleteSession(session.id);
                                }
                              }}
                              className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 font-calculator"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        {isExpanded && (
                          <div className="mt-3 pt-3 border-t border-gray-300 space-y-2 max-h-60 overflow-y-auto">
                            {sortedSessionComps.length === 0 ? (
                              <p className="text-gray-500 text-sm font-calculator text-center py-2">
                                No computations in this session
                              </p>
                            ) : (
                              sortedSessionComps.map((comp) => (
                                <button
                                  key={comp.id}
                                  onClick={() => onSelect(comp)}
                                  className="w-full text-left border border-gray-300 rounded p-2 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                                >
                                  <div className="text-gray-800 text-base font-calculator mb-1 truncate">
                                    {comp.computation}
                                  </div>
                                  <div className="text-gray-500 text-xs font-calculator">
                                    {new Date(comp.created_at).toLocaleString()}
                                  </div>
                                </button>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showSaveModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60]">
          <div className="w-[90%] max-w-[300px] bg-gray-100 rounded-lg p-6">
            <h3 className="text-gray-800 text-sm font-michroma mb-4">Save Session</h3>
            <form onSubmit={handleSaveSubmit}>
              {sessions.length > 0 && (
                <div className="mb-4">
                  <label className="block text-gray-700 text-xs font-michroma mb-2">
                    Add to existing session:
                  </label>
                  <select
                    value={selectedSessionId || ''}
                    onChange={(e) => {
                      setSelectedSessionId(e.target.value || null);
                      if (e.target.value) {
                        setSessionName('');
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-calculator text-sm"
                  >
                    <option value="">-- Create new session --</option>
                    {sessions.map((session) => (
                      <option key={session.id} value={session.id}>
                        {session.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {!selectedSessionId && (
                <div className="mb-4">
                  <label className="block text-gray-700 text-xs font-michroma mb-2">
                    Or create new session:
                  </label>
                  <input
                    type="text"
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                    placeholder="taxes"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-calculator"
                    autoFocus
                    required={!selectedSessionId}
                  />
                </div>
              )}
              <div className="mb-2 text-xs text-gray-600 font-calculator">
                {computationsToSave.length} computation{computationsToSave.length !== 1 ? 's' : ''} will be saved
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowSaveModal(false);
                    setSessionName('');
                    setSelectedSessionId(null);
                  }}
                  className="flex-1 px-3 py-1 rounded text-sm font-michroma transition-colors text-gray-600 hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || (!selectedSessionId && !sessionName.trim())}
                  className="flex-1 px-3 py-1 rounded text-sm font-michroma transition-colors bg-gray-300 text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPanel; 