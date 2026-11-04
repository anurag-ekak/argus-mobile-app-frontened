import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react';

interface SidebarState {
  open: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
}

const SidebarContext = createContext<SidebarState | null>(null);

export function SidebarProvider({children}: {children: ReactNode}) {
  const [open, setOpen] = useState(false);
  return (
    <SidebarContext.Provider
      value={{
        open,
        openSidebar: () => setOpen(true),
        closeSidebar: () => setOpen(false),
      }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar(): SidebarState {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error('useSidebar must be used inside SidebarProvider');
  }
  return ctx;
}
