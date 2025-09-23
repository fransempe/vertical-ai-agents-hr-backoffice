'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: 'candidates' | 'meets' | 'conversations' | 'bulk-upload' | 'processes';
  onTabChange: (tab: 'candidates' | 'meets' | 'conversations' | 'bulk-upload' | 'processes') => void;
}

export function DashboardLayout({ children, activeTab, onTabChange }: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getTitleForTab = (tab: string) => {
    switch (tab) {
      case 'candidates':
        return 'Candidate Management';
      case 'meets':
        return 'Interview Scheduling';
      case 'conversations':
        return 'Interview Conversations';
      case 'bulk-upload':
        return 'Bulk Upload Candidates';
      case 'processes':
        return 'AI Analysis Processes';
      default:
        return 'HR Interview Dashboard';
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-slate-50 dark:bg-slate-900">
      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden" 
          onClick={() => setMobileMenuOpen(false)}
        >
          <div className="absolute inset-0 bg-slate-600 opacity-75"></div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 lg:relative lg:flex lg:flex-shrink-0 transform transition-transform duration-300 ease-in-out ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <Sidebar 
          activeTab={activeTab}
          onTabChange={(tab) => {
            onTabChange(tab);
            setMobileMenuOpen(false);
          }}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar 
          onMenuClick={() => setMobileMenuOpen(true)}
          title={getTitleForTab(activeTab)}
        />
        
        <main className="flex-1 overflow-y-auto h-full">
          <div className="w-full p-4 sm:p-6 min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}