import React from 'react';

interface ButtonGridProps {
  onNumberClick: (num: number) => void;
  onOperationClick: (operation: string) => void;
  onCalculate: () => void;
  onClear: () => void;
}

const buttonLayout = [
  [
    { label: '7', onClick: (fn: ButtonGridProps) => fn.onNumberClick(7), type: 'number' },
    { label: '8', onClick: (fn: ButtonGridProps) => fn.onNumberClick(8), type: 'number' },
    { label: '9', onClick: (fn: ButtonGridProps) => fn.onNumberClick(9), type: 'number' },
    { label: '×=', onClick: (fn: ButtonGridProps) => fn.onOperationClick('×'), type: 'op' },
  ],
  [
    { label: '4', onClick: (fn: ButtonGridProps) => fn.onNumberClick(4), type: 'number' },
    { label: '5', onClick: (fn: ButtonGridProps) => fn.onNumberClick(5), type: 'number' },
    { label: '6', onClick: (fn: ButtonGridProps) => fn.onNumberClick(6), type: 'number' },
    { label: '÷=', onClick: (fn: ButtonGridProps) => fn.onOperationClick('÷'), type: 'op' },
  ],
  [
    { label: '1', onClick: (fn: ButtonGridProps) => fn.onNumberClick(1), type: 'number' },
    { label: '2', onClick: (fn: ButtonGridProps) => fn.onNumberClick(2), type: 'number' },
    { label: '3', onClick: (fn: ButtonGridProps) => fn.onNumberClick(3), type: 'number' },
    { label: '-=', onClick: (fn: ButtonGridProps) => fn.onOperationClick('-'), type: 'op' },
  ],
  [
    { label: 'C', onClick: (fn: ButtonGridProps) => fn.onClear(), type: 'clear' },
    { label: '0', onClick: (fn: ButtonGridProps) => fn.onNumberClick(0), type: 'number' },
    { label: 'enter', onClick: (fn: ButtonGridProps) => fn.onCalculate(), type: 'enter' },
    { label: '+=', onClick: (fn: ButtonGridProps) => fn.onOperationClick('+'), type: 'op' },
  ],
];

const ButtonGrid: React.FC<ButtonGridProps> = (props) => {
  return (
    <div className="rounded-sm p-3 bg-[#23272b] w-[280px] mx-auto" style={{
      boxShadow: `1px 1px 2px 0px rgba(255, 255, 255, 0.62), 2px 2px 4px -1px rgba(255, 255, 255, 0.65), 1px -1px 1px 0.1px #7A7466, 1px 1px 2px -1px rgba(240, 240, 240, 0.83) inset, 0px 8px 10px 3px rgba(0, 0, 0, 0.80) inset, 0px -13px 4px -4px rgba(45, 59, 47, 0.52) inset`,
    }}>
      <div className="grid grid-cols-4 gap-y-1 gap-x-1.5">
        {buttonLayout.flat().map((btn, idx) => (
          <div key={btn.label + idx} className="flex flex-col items-center">
            {/* Label above button */}
            <span
              className={
                `mb-1 text-center text-lg font-michroma select-none ` +
                (btn.type === 'number' ? 'text-gray-400' : '') +
                (btn.type === 'op' ? 'text-gray-400' : '') +
                (btn.type === 'clear' ? 'text-gray-400' : '') +
                (btn.type === 'enter' ? 'text-gray-400 text-sm' : '')
              }
              style={{
                lineHeight: btn.type === 'enter' ? '28px' : '',
              }}
            >
              {btn.label === '-=' ? (
                <span className="flex items-center">
                  <span className="translate-y-[-1px]">-</span>
                  <span>=</span>
                </span>
              ) : btn.label.endsWith('=') ? (
                <span>{btn.label}</span>
              ) : (
                btn.label
              )}
            </span>
            <button
              onClick={() => btn.onClick(props)}
              className={
                `w-[42px] h-7 rounded-md relative ` +
                (btn.type === 'number' ? 'bg-gray-100 border-gray-300' : '') +
                (btn.type === 'op' ? 'bg-sky-400 border-sky-500' : '') +
                (btn.type === 'clear' ? 'bg-red-400 border-red-500' : '') +
                (btn.type === 'enter' ? 'bg-sky-400 border-sky-500' : '') +
                ' transition-all duration-100 active:top-[1px]'
              }
              style={{
                boxShadow: `
                  2px 5px 10px 4px rgba(0, 0, 0, 0.76), 3px 5px 3px 0px rgba(255, 255, 255, 0.50) inset, -2px -4px 4px 0px rgba(0, 0, 0, 0.25) inset
                `,
              }}
              tabIndex={-1}
              aria-label={btn.label}
            >
              {/* Empty: label is above */}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ButtonGrid; 