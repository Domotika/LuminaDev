// ═══════════════════════════════════════════════════════════════════════════
//  SIDEBAR LAYOUT - Placeholder Component
// ═══════════════════════════════════════════════════════════════════════════

import React from 'react';

interface SidebarLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  showSidebar?: boolean;
}

export const SidebarLayout: React.FC<SidebarLayoutProps> = ({
  children,
  sidebar,
  showSidebar = false,
}) => {
  if (!showSidebar) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen">
      {sidebar && (
        <div className="w-64 bg-gray-900 border-r border-white/10 p-4">
          {sidebar}
        </div>
      )}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
};
