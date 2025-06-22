import { useState, useEffect } from 'react';
import Display from './Display';
import ButtonGrid from './ButtonGrid';
import HistoryPanel from './HistoryPanel';
import { supabase } from '../../supabase';

interface Computation {
  id: number;
  computation: string;
  result: number;
  created_at: string;
}

export default function Calculator() {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [computationLog, setComputationLog] = useState<string[]>([]);
  const [lastComputation, setLastComputation] = useState('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [computations, setComputations] = useState<Computation[]>([]);

  useEffect(() => {
    fetchComputations();
  }, []);

  const fetchComputations = async () => {
    try {
      const { data, error } = await supabase
        .from('computations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComputations(data || []);
      
      // Update computation log with the last 3 computations
      if (data && data.length > 0) {
        setComputationLog(data.slice(0, 3).map(comp => comp.computation));
      }
    } catch (error) {
      console.error('Error fetching computations:', error);
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

      // Save computation to Supabase
      try {
        const { error } = await supabase
          .from('computations')
          .insert([{ computation, result: newValue }]);

        if (error) throw error;
        
        // Refresh computations after adding new one
        fetchComputations();
      } catch (error) {
        console.error('Error saving computation:', error);
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
      />
    </div>
  );
} 