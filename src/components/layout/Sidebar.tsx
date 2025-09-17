'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  activeTab: 'candidates' | 'meets' | 'conversations' | 'bulk-upload' | 'processes';
  onTabChange: (tab: 'candidates' | 'meets' | 'conversations' | 'bulk-upload' | 'processes') => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const menuItems = [
  {
    id: 'candidates' as const,
    label: 'Candidates',
    icon: '👥',
    description: 'Manage candidates',
  },
  {
    id: 'meets' as const,
    label: 'Interviews',
    icon: '📅',
    description: 'Schedule interviews',
  },
  {
    id: 'conversations' as const,
    label: 'Conversations',
    icon: '💬',
    description: 'View chat history',
  },
  {
    id: 'bulk-upload' as const,
    label: 'Bulk Upload',
    icon: '📂',
    description: 'Import candidates',
  },
  {
    id: 'processes' as const,
    label: 'Processes',
    icon: '⚙️',
    description: 'AI Analysis',
  },
];

export function Sidebar({ activeTab, onTabChange, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  return (
    <div className={`bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } flex flex-col`}>
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                HR Backoffice
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Interview Management</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isCollapsed ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            )}
          </Button>
        </div>
      </div>
      
      <nav className="flex-1 p-2">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all duration-200 ${
                activeTab === item.id
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
              } ${isCollapsed ? 'justify-center' : ''}`}
            >
              <span className="text-xl">{item.icon}</span>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{item.label}</div>
                  <div className="text-xs opacity-75 truncate">{item.description}</div>
                </div>
              )}
            </button>
          ))}
        </div>
      </nav>
      
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        {!isCollapsed ? (
          <div className="text-center">
            <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-2">
              HR
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">HR Team</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">Admin Panel</p>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              HR
            </div>
          </div>
        )}
      </div>
    </div>
  );
}