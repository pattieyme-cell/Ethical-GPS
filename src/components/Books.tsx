import React from 'react';

export const Books: React.FC<{ analysis: any }> = ({ analysis }) => {
  if (!analysis?.books) return null;

  return (
    <div className="bg-white dark:bg-[#0B1120] p-8 rounded-3xl shadow-2xl mt-8 animate-fade-in border border-slate-100 dark:border-slate-800/60 relative overflow-hidden group transition-all duration-500">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-full blur-3xl saturate-150 group-hover:scale-110 transition-transform duration-700"></div>
      
      <div className="relative z-10">
        <h3 className="text-2xl font-bold mb-2 flex items-center gap-3 text-slate-800 dark:text-white">
          <span className="text-3xl">📚</span> Recommended Readings
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 italic">Curated psychological and philosophical resources to expand your perspective.</p>
        
        <div className="grid md:grid-cols-2 gap-6">
          {analysis.books.map((book: any, i: number) => (
            <div key={i} className="flex flex-col h-full bg-slate-50 dark:bg-slate-800/40 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-500/50 transition-all duration-300 group/book backdrop-blur-sm">
              <a 
                href={`https://www.google.com/search?q=${encodeURIComponent(book.title + ' ' + book.author + ' book')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100 group-hover/book:text-purple-600 dark:group-hover/book:text-purple-400 transition-colors hover:underline">
                  {book.title}
                </h4>
              </a>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-bold tracking-widest uppercase mt-1 mb-4">By {book.author}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed flex-1">{book.reason}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
