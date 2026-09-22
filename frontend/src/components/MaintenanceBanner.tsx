import React, { useState, useEffect } from 'react';
import { AlertTriangle, Info, X, ShieldAlert, Wrench } from 'lucide-react';

export const MaintenanceBanner: React.FC = () => {
  const [isMaintenance, setIsMaintenance] = useState<boolean>(() => {
    return localStorage.getItem('bhoomi_maintenance_mode') === 'true';
  });

  const [announcement, setAnnouncement] = useState<string | null>(() => {
    return localStorage.getItem('bhoomi_announcement');
  });

  const [dismissed, setDismissed] = useState<boolean>(false);

  // Listen for storage events (e.g., when Admin toggles maintenance mode in another tab/window)
  useEffect(() => {
    const handleStorageChange = () => {
      const mode = localStorage.getItem('bhoomi_maintenance_mode') === 'true';
      const ann = localStorage.getItem('bhoomi_announcement');
      setIsMaintenance(prev => prev !== mode ? mode : prev);
      setAnnouncement(prev => prev !== ann ? ann : prev);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, []);

  if (isMaintenance) {
    return (
      <div className="bg-gradient-to-r from-amber-600 via-rose-600 to-amber-700 text-white px-4 py-2.5 shadow-lg border-b border-amber-500/50 flex items-center justify-between text-xs sm:text-sm z-50">
        <div className="max-w-7xl mx-auto flex items-center space-x-3 w-full justify-center text-center">
          <div className="p-1 bg-white/20 rounded-lg animate-pulse shrink-0">
            <Wrench className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold tracking-wide">
            SYSTEM MAINTENANCE MODE ACTIVE — Scheduled State Revenue Database Sync in progress. Public registry queries operating in offline-cached standby mode.
          </span>
        </div>
      </div>
    );
  }

  if (announcement && !dismissed) {
    return (
      <div className="bg-gradient-to-r from-sky-900 to-indigo-900 text-sky-100 px-4 py-2 border-b border-sky-700/60 flex items-center justify-between text-xs z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between w-full">
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="font-semibold">{announcement}</span>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 text-sky-300 hover:text-white rounded-lg hover:bg-sky-800 transition-colors ml-2 cursor-pointer"
            title="Dismiss Announcement"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return null;
};
