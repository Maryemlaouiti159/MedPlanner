import { useState } from 'react';
import type { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="app-shell">
      <Sidebar isOpen={sidebarOpen} />

      <div className="app-main">
        <Topbar
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="app-content">
          {children}
        </main>
      </div>
    </div>
  );
}