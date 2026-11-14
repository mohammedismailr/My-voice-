import React from 'react';

interface AppLayoutProps {
  sidebar: React.ReactNode;
  header: React.ReactNode;
  children: React.ReactNode;
  inputArea: React.ReactNode;
  modals?: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  sidebar,
  header,
  children,
  inputArea,
  modals,
}) => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#090B14] text-[#F8FAFC]">
      {/* Sidebar (Desktop persistent + Mobile drawer) */}
      {sidebar}

      {/* Main Content Viewport */}
      <div className="relative flex flex-1 flex-col overflow-hidden">
        {header}
        
        {/* Chat / Messages Area */}
        <main className="flex flex-1 flex-col overflow-hidden relative">
          {children}
        </main>

        {/* Bottom Input Area */}
        <footer className="w-full flex-shrink-0 z-10">
          {inputArea}
        </footer>
      </div>

      {/* Modals and Overlays */}
      {modals}
    </div>
  );
};
