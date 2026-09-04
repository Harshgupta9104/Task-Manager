import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { ToastContainer } from '../ui/Toast';
import { useToast } from '../../hooks/useToast';

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toasts, removeToast } = useToast();

  return (
    <div className="flex h-screen text-gray-900 dark:text-gray-100">
      {/* Ambient gradient background */}
      <div className="ambient-bg" aria-hidden="true">
        <div className="ambient-blob blob-1 animate-float-slow" />
        <div className="ambient-blob blob-2 animate-float-slow" style={{ animationDelay: '-6s' }} />
        <div className="ambient-blob blob-3 animate-float-slow" style={{ animationDelay: '-12s' }} />
      </div>

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar onMenuClick={() => setSidebarOpen(true)} title="TaskFlow" />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}