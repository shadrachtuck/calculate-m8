import React from 'react';

interface Computation {
  id: number;
  computation: string;
  result: number;
  created_at: string;
}

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  computations: Computation[];
  onSelect: (computation: Computation) => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ isOpen, onClose, computations, onSelect }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="w-[90%] max-w-[400px] max-h-[80vh] bg-gray-100 rounded-lg overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-gray-300 flex justify-between items-center">
          <h2 className="text-gray-800 text-xl font-michroma">History</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 text-2xl font-bold hover:text-gray-800"
          >
            &times;
          </button>
        </div>
        <div className="p-4 overflow-y-auto max-h-[calc(80vh-65px)]">
          {computations.length === 0 ? (
            <p className="text-gray-500 text-sm font-calculator text-center py-8">No calculations yet</p>
          ) : (
            <div className="space-y-3">
              {computations.map((comp) => (
                <button 
                  key={comp.id}
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPanel; 