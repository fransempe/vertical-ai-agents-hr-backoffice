'use client';

import { Button } from '@/components/ui/button';
import { RiMenuLine } from 'react-icons/ri';

interface NavbarProps {
  onMenuClick?: () => void;
  title?: string;
}

export function Navbar({ onMenuClick, title = "HR Interview Dashboard" }: NavbarProps) {

  return (
    <header className="bg-gradient-to-r from-purple-800 via-purple-700 to-pink-600 rounded-2xl m-4 px-6 py-4 shadow-2xl" style={{ backgroundImage: 'url(/images/sidebar-bg.svg)', backgroundSize: 'cover' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden hover:bg-white/20 backdrop-blur-sm text-white"
          >
            <RiMenuLine className="w-5 h-5" />
          </Button>
          
          <div>
            <h1 className="text-lg font-semibold text-white">
              {title}
            </h1>
            <p className="text-sm text-white/70">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}