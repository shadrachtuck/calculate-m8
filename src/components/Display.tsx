import React from 'react';

interface DisplayProps {
  display: string;
  computationLog: string[];
  lastComputation: string;
  onHistoryClick?: () => void;
}

const Display: React.FC<DisplayProps> = ({ display, computationLog, lastComputation, onHistoryClick }) => {
  const glow = "[text-shadow:0_0_12px_rgba(255,42,42,0.7),_0_0_7px_rgba(255,42,42,0.7),_0_0_3px_rgba(255,42,42,0.7)]";

  return (
    <>
      {/* Main Display - Shows Last Computation (equation) */}
      <div className="relative w-full max-w-[280px] h-[180px] mx-auto">
        <div 
          className="rounded-sm p-4 flex flex-col justify-between w-full h-full relative"
          style={{
            background: 'linear-gradient(180deg, #2a0a0a 0%, #0a0000 100%),radial-gradient(202.43% 55.78% at 83.39% 65.71%, rgba(55, 161, 66, 0.01) 0%, rgba(0, 113, 11, 0.12) 100%), linear-gradient(270deg, rgba(148, 6, 10, 0.58) 13.07%, rgba(100, 4, 7, 0.63) 40.64%, rgba(49, 2, 3, 0.61) 65.72%, rgba(46, 2, 3, 0.60) 90.81%)',
            boxShadow: 'rgba(255, 0, 0, 0.18) 0px 0px 16px 2px inset, rgba(255, 0, 0, 0.3) 0px 0px 4px 1px inset, rgb(154 101 101 / 63%) 0px 1px 2px 1px, rgba(220, 18, 18, 0.25) -1px 7px 8px 7px inset, rgba(0, 0, 0, 0.25) -3px 5px 4px 0px inset, rgba(0, 0, 0, 0.25) 1px 0px 4px 0px inset',
            border: '1px solid rgb(0, 0, 0)',
            borderStyle: 'outset',
            backgroundBlendMode: 'normal, plus-darker',
          }}
        >
          {/* Log label with red glow */}
          <div className="flex justify-between items-start mb-2 z-10">
            <button 
              onClick={onHistoryClick}
              className={`text-[#ff2a2a] text-sm font-calculator opacity-60 hover:opacity-100 transition-opacity ${glow}`}
            >
              &lt;- History
            </button>
            <div className={`text-[#ff2a2a] text-sm font-normal font-calculator ${glow}`}>
              Log:
            </div>
          </div>
          <div className="flex-1 overflow-y-auto z-10">
            <div className={`text-[#ff2a2a] text-xs font-calculator space-y-1 ${glow}`}>
              {computationLog.slice(-3).map((computation, index) => (
                <div
                  key={index}
                  className={`opacity-50 w-full text-base font-normal font-calculator truncate ${glow}`}
                >
                  {computation}
                </div>
              ))}
            </div>
          </div>
          <div className={`text-[#ff2a2a] text-right text-2xl font-calculator truncate ${glow}`}>
            {lastComputation || '0'}
          </div>
        </div>
      </div>

      {/* Secondary Display - Shows Current Input */}
      <div className="relative w-full max-w-[280px] h-[50px] mx-auto">
        <div 
          className="rounded-sm p-4 flex items-center justify-end w-full h-full relative"
          style={{
            background: 'linear-gradient(180deg, #2a0a0a 0%, #0a0000 100%),radial-gradient(202.43% 55.78% at 83.39% 65.71%, rgba(55, 161, 66, 0.01) 0%, rgba(0, 113, 11, 0.12) 100%), linear-gradient(270deg, rgba(148, 6, 10, 0.58) 13.07%, rgba(100, 4, 7, 0.63) 40.64%, rgba(49, 2, 3, 0.61) 65.72%, rgba(46, 2, 3, 0.60) 90.81%)',
            boxShadow: 'rgba(255, 0, 0, 0.18) 0px 0px 16px 2px inset, rgba(255, 0, 0, 0.3) 0px 0px 4px 1px inset, rgb(154 101 101 / 63%) 0px 1px 2px 1px, rgba(220, 18, 18, 0.25) -1px 7px 8px 7px inset, rgba(0, 0, 0, 0.25) -3px 5px 4px 0px inset, rgba(0, 0, 0, 0.25) 1px 0px 4px 0px inset',
            border: '1px solid rgb(0, 0, 0)',
            borderStyle: 'outset',
            backgroundBlendMode: 'normal, plus-darker',
          }}
        >
          <div className="w-full flex justify-end items-center z-10">
            <div className={`text-[#ff2a2a] text-4xl font-calculator font-light w-full text-right truncate ${glow}`}>
              {display}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Display; 