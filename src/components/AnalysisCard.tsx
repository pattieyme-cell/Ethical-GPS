
import React from 'react';

interface AnalysisCardProps {
  title: string;
  icon: React.ReactNode;
  colorClass: string;
  content: React.ReactNode;
}

const AnalysisCard: React.FC<AnalysisCardProps> = ({ title, icon, colorClass, content }) => {
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden hover:shadow-md transition-all duration-300 h-full flex flex-col`}>
      <div className={`${colorClass} p-4 flex items-center gap-3 transition-colors duration-300`}>
        <div className="bg-white/20 p-2 rounded-lg text-white">
          {icon}
        </div>
        <h3 className="text-white font-semibold text-lg">{title}</h3>
      </div>
      <div className="p-6 flex-1 text-slate-700 dark:text-slate-300 leading-relaxed transition-colors duration-300">
        {content}
      </div>
    </div>
  );
};

export default AnalysisCard;
