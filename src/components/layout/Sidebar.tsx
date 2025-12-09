'use client';

import Image from 'next/image';
import { 
  RiUserLine, 
  RiCalendarLine, 
  RiChat3Line, 
  RiBarChartLine
} from 'react-icons/ri';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface SidebarProps {
  activeTab: 'candidates' | 'meets' | 'conversations' | 'bulk-upload' | 'reports';
  onTabChange: (tab: 'candidates' | 'meets' | 'conversations' | 'bulk-upload' | 'reports') => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { t } = useLanguage();

  const menuItems = [
    {
      id: 'reports' as const,
      label: t('navigation.reports'),
      icon: RiBarChartLine,
      description: t('reports.loadingReports').replace('...', ''),
    },
    {
      id: 'candidates' as const,
      label: t('navigation.candidates'),
      icon: RiUserLine,
      description: t('candidates.candidatesList').replace(' List', ''),
    },
    {
      id: 'meets' as const,
      label: t('navigation.interviews'),
      icon: RiCalendarLine,
      description: t('interviews.scheduleInterview').replace('Schedule ', ''),
    },
    {
      id: 'conversations' as const,
      label: t('navigation.conversations'),
      icon: RiChat3Line,
      description: t('conversations.candidatesWithConversations').replace('Candidates with ', ''),
    },
    // {
    //   id: 'bulk-upload' as const,
    //   label: t('navigation.bulkUpload'),
    //   icon: RiUploadLine,
    //   description: t('bulkUpload.bulkUploadCandidates').replace('Bulk Upload ', ''),
    // },
  ];

  return (
    <div className="flex flex-col bg-gradient-to-b from-purple-800 via-purple-700 to-pink-600 p-4 space-y-4 rounded-2xl m-4 shadow-2xl w-20" style={{ backgroundImage: 'url(/images/sidebar-bg.svg)', backgroundSize: 'cover' }}>
      
      {/* Top Section - Logo */}
      <div className="flex justify-center">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center backdrop-blur-sm">
          <Image src="/images/acciona-mini-logo.svg" 
          alt="Acciona Logo" height={24} width={24} 
          className="h-6 w-6"
          />
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex flex-col items-center justify-center space-y-4 flex-grow">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`relative group p-3 rounded-full transition-all duration-300 cursor-pointer ${
                isActive 
                  ? 'bg-blue-500 shadow-lg shadow-blue-500/30 scale-110' 
                  : 'bg-white/20 hover:bg-white/30 backdrop-blur-sm'
              }`}
            >
              <item.icon className="text-xl text-white" />
              
              {/* Tooltip */}
              <span className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 hidden group-hover:block bg-black/80 text-white text-xs rounded py-1 px-3 font-sans whitespace-nowrap tracking-wide backdrop-blur-sm">
                {item.label}
              </span>
              
            </button>
          );
        })}
      </div>

      {/* Bottom Section - HR Logo */}
      <div className="flex justify-center mt-auto">
        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
          <span className="text-white text-lg font-bold">HR</span>
        </div>
      </div>
    </div>
  );
}