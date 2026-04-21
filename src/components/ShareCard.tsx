import React, { forwardRef } from 'react';
import { DecisionAnalysis } from '../types';

interface ShareCardProps {
  input: string;
  analysis: DecisionAnalysis;
  userName: string;
}

export const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(({ input, analysis, userName }, ref) => {
  return (
    <div
      className="absolute -left-[9999px] top-0" // Hide it offscreen
    >
      <div 
        ref={ref}
        className="w-[1080px] h-[1920px] bg-gradient-to-br from-slate-900 via-[#1a1130] to-purple-900 text-white p-16 flex flex-col justify-between font-sans relative overflow-hidden"
      >
        {/* Background glow effects */}
        <div className="absolute top-[-200px] left-[-200px] w-[800px] h-[800px] bg-purple-600/30 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-200px] right-[-200px] w-[800px] h-[800px] bg-indigo-600/30 blur-[150px] rounded-full"></div>

        <div className="relative z-10 flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-4 mb-20 opacity-80">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
              G
            </div>
            <h2 className="text-3xl font-bold tracking-tight">EthicsGPS Insight</h2>
          </div>

          {/* User's Dilemma */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-purple-300 uppercase tracking-widest mb-4">{userName}'s Dilemma</h3>
            <p className="text-4xl leading-snug italic font-light opacity-90 border-l-4 border-indigo-500 pl-8">
              "{input}"
            </p>
          </div>

          {/* Main Advice */}
          <div className="bg-white/5 backdrop-blur-md rounded-3xl p-12 border border-white/10 mb-auto relative">
            <div className="absolute -top-8 -right-8 text-8xl opacity-10">⚖️</div>
            <h3 className="text-2xl font-bold text-purple-300 uppercase tracking-widest mb-6">The Mentor's Advice</h3>
            <p className="text-5xl leading-tight font-medium">
              "{analysis.recommendation}"
            </p>
            <div className="mt-12 flex gap-4 flex-wrap">
              {analysis.emotion.primaryEmotions.map((emotion, idx) => (
                <span key={idx} className="px-6 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full text-xl font-bold uppercase tracking-wider text-purple-200">
                  {emotion}
                </span>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-white/10 flex justify-between items-end opacity-75">
            <div>
              <p className="text-2xl font-semibold mb-2">Made with EthicsGPS</p>
              <p className="text-xl font-light">Navigate life with clarity.</p>
            </div>
            <div className="text-2xl font-mono">ethical-gps.vercel.app</div>
          </div>
        </div>
      </div>
    </div>
  );
});

ShareCard.displayName = "ShareCard";
