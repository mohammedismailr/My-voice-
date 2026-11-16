import React from 'react';

interface AppLayoutProps {
  sidebar: React.ReactNode;
  header: React.ReactNode;
  children: React.ReactNode;
  inputArea: React.ReactNode;
  inspector?: React.ReactNode;
  modals?: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  sidebar,
  header,
  children,
  inputArea,
  inspector,
  modals,
}) => {
  return (
    <div className="flex h-screen h-[100dvh] w-screen overflow-hidden bg-[#090B14] text-[#F8FAFC] pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
      {/* Sidebar (Desktop persistent + Mobile drawer) */}
      {sidebar}

      {/* Main Content Viewport */}
      <div className="relative flex flex-1 flex-col overflow-hidden">
        {header}

        {/* Content Body + Right Inspector */}
        <div className="flex flex-1 overflow-hidden relative">
          <div className="flex flex-1 flex-col overflow-hidden relative">
            {/* Chat / Messages / 3D Stage Area */}
            <main className="flex flex-1 flex-col overflow-hidden relative">
              {children}
            </main>

            {/* Bottom Input Area */}
            <footer className="w-full flex-shrink-0 z-10">
              {inputArea}
            </footer>
          </div>

          {/* Right Inspector Panel */}
          {inspector}
        </div>
      </div>

      {/* Modals and Overlays */}
      {modals}
    </div>
  );
};
