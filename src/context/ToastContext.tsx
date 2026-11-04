import React, {
  createContext,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import ToastHost, {type ToastKind} from '../components/ToastHost';

interface ToastState {
  showToast: (message: string, kind?: ToastKind) => void;
}

const ToastContext = createContext<ToastState | null>(null);

export function ToastProvider({children}: {children: ReactNode}) {
  const [toast, setToast] = useState<{message: string; kind: ToastKind} | null>(
    null,
  );
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (message: string, kind: ToastKind = 'info') => {
    setToast({message, kind});
    if (timer.current) {
      clearTimeout(timer.current);
    }
    timer.current = setTimeout(() => setToast(null), 2600);
  };

  return (
    <ToastContext.Provider value={{showToast}}>
      {children}
      <ToastHost toast={toast} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastState {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used inside ToastProvider');
  }
  return ctx;
}
