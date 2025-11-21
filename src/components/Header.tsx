import React from 'react';
import { PresentationChartLineIcon } from '@heroicons/react/24/outline';

const Header: React.FC = React.memo(() => (
  <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
    <div className="max-w-[95%] mx-auto px-6 h-16 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="bg-indigo-600 p-2 rounded-lg">
          <PresentationChartLineIcon className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">问卷洞察 AI</h1>
          <p className="text-xs text-slate-500">Cloudflare 加速版</p>
        </div>
      </div>
    </div>
  </header>
));
export default Header;