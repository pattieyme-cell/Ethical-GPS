import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import Layout from './components/Layout';
import AnalysisCard from './components/AnalysisCard';
import { Login } from './components/Login';
import { SignUp } from './components/SignUp';
import { Intro } from './components/Intro';
import { Consequences } from './components/Consequences';
import { Books } from './components/Books';
import { Feedback } from './components/Feedback';
import { Profile } from './components/Profile';
import { ShareCard } from './components/ShareCard';
import { MentorChat } from './components/MentorChat';
import { ViewType, DecisionEntry, DecisionAnalysis } from './types';
import { analyzeDecision } from './services/geminiService';
import { useAuth } from './contexts/AuthContext';
import { api } from './services/api';

const MainApp: React.FC = () => {
  const { isAuthenticated, user, token, logout, isLoading } = useAuth();
  
  // App State Navigation handling (Auth vs Guest)
  const [activeView, setActiveView] = useState<ViewType>(ViewType.LOGIN);
  const [hasSeenIntro, setHasSeenIntro] = useState(false);
  
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<DecisionAnalysis | null>(null);
  const [history, setHistory] = useState<DecisionEntry[]>([]);
  
  // Voice state
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Sharing state
  const shareCardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        if (!hasSeenIntro) {
          setActiveView(ViewType.INTRO);
        } else {
          setActiveView(ViewType.HOME);
          loadHistory();
        }
      } else {
        if (activeView !== ViewType.LOGIN && activeView !== ViewType.SIGNUP) {
          setActiveView(ViewType.LOGIN);
        }
      }
    }
  }, [isAuthenticated, isLoading, hasSeenIntro]);

  const loadHistory = async () => {
    if (!token) return;
    try {
      const pastDecisions = await api.getDecisions(token);
      setHistory(pastDecisions);
    } catch (e) {
      console.error("Failed to load history", e);
    }
  };

  const handleDeleteDecision = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!token || !confirm("Are you sure you want to delete this decision?")) return;
    try {
      await api.deleteDecision(id, token);
      setHistory(prev => prev.filter(d => d.id !== id));
    } catch (error) {
      alert("Failed to delete decision");
    }
  };

  const handleAnalyze = async () => {
    if (!input.trim() || !token) return;
    
    setIsAnalyzing(true);
    try {
      const result = await analyzeDecision(input);
      setCurrentAnalysis(result);
      
      const newEntry = await api.saveDecision(input, result, token);
      setHistory(prev => [newEntry, ...prev]);
      setActiveView(ViewType.DASHBOARD);
    } catch (error) {
      alert("Something went wrong with the analysis. Please check your quota or try again later.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onstart = () => setIsRecording(true);
    
    let finalTranscript = input;
    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += ' ' + event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setInput((finalTranscript + ' ' + interimTranscript).trim());
    };

    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => {
      // Small pause handle logic could be added here, but we just stop recording for now
      setIsRecording(false);
    };

    recognition.start();
    
    // Auto stop after 10s if needed, but continuous supports long speech
    setTimeout(() => {
      if(isRecording) recognition.stop();
    }, 15000);
  };

  const toggleSpeech = (text: string) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Nice calming slow mentor voice rate
    utterance.pitch = 1;
    
    // Select a good english voice
    const voices = window.speechSynthesis.getVoices();
    const cleanVoice = voices.find(v => v.name.includes("Google") || v.lang === "en-US") || voices[0];
    if (cleanVoice) utterance.voice = cleanVoice;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleExportImage = async () => {
    if (!shareCardRef.current || isExporting) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(shareCardRef.current, { backgroundColor: null, scale: 2 });
      const imageURL = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imageURL;
      link.download = `EthicsGPS_Insight_${new Date().getTime()}.png`;
      link.click();
    } catch (e) {
      console.error("Failed to export image", e);
      alert("Failed to create the image. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center dark:bg-slate-900 bg-slate-50"><div className="animate-spin h-8 w-8 text-purple-600 border-4 border-t-white rounded-full"></div></div>;

  const renderHome = () => (
    <div className="flex flex-col items-center text-center py-12 px-4 animate-fade-in duration-700">
      <div className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wide text-purple-600 uppercase bg-purple-50 dark:bg-purple-900/30 dark:text-purple-400 rounded-full">
        Welcome, {user?.name || user?.email.split('@')[0]}
      </div>
      <h1 className="serif-font text-5xl md:text-7xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
        A GPS for <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Life's Decisions.</span>
      </h1>
      <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mb-10 leading-relaxed">
        Navigate the fog of emotional confusion. EthicsGPS helps you look at your toughest dilemmas through the lenses of logic, emotion, and morality.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <button 
          onClick={() => setActiveView(ViewType.ANALYZE)}
          className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl font-semibold hover:from-indigo-600 hover:to-purple-600 hover:scale-[1.02] transition-all text-lg"
        >
          Start New Analysis
        </button>
        <button 
          onClick={() => setActiveView(ViewType.HISTORY)}
          className="px-8 py-4 bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white text-slate-700 border border-slate-200 rounded-2xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-lg"
        >
          View Past Decisions
        </button>
      </div>
    </div>
  );

  const renderAnalyze = () => (
    <div className="max-w-3xl mx-auto py-8">
      <div className="glass-panel rounded-3xl p-8">
        <h2 className="serif-font text-3xl font-bold mb-2 text-slate-800 dark:text-white">What's on your mind?</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8">Type or speak your dilemma. Don't worry about clarity—just pour your heart out.</p>
        
        <div className="relative mb-6">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="I want to quit my job because the boss is rude, but the pay is great and I have bills to pay..."
            className="w-full h-64 p-6 bg-slate-50 dark:bg-slate-800/50 border-0 rounded-2xl focus:ring-2 focus:ring-purple-500 text-lg resize-none placeholder:text-slate-400 dark:text-white"
          />
          <button 
            onClick={startVoiceInput}
            className={`absolute bottom-4 right-4 p-4 rounded-full shadow-md transition-all ${
              isRecording ? 'bg-red-500 animate-pulse text-white' : 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50'
            }`}
            title={isRecording ? "Listening..." : "Use microphone"}
          >
            {isRecording ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1 text-white" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
          </button>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || !input.trim()}
          className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {isAnalyzing ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              The Mentor is thinking...
            </>
          ) : (
            'Analyze Dilemma'
          )}
        </button>
      </div>
    </div>
  );

  const renderDashboard = () => {
    if (!currentAnalysis) return null;
    return (
      <div className="animate-fade-in duration-500 pb-20">
        <div className="mb-10 text-center">
          <h2 className="serif-font text-4xl font-bold text-slate-800 dark:text-white mb-4">Your Decision Dashboard</h2>
          <div className="glass-panel p-6 rounded-2xl max-w-2xl mx-auto italic text-slate-600 dark:text-slate-300">
            "{input}"
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-10">
          <AnalysisCard
            title="Logic Card"
            colorClass="bg-gradient-to-r from-indigo-500 to-purple-500"
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
            content={
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-purple-700 dark:text-purple-400 uppercase text-xs mb-2 tracking-wider">Pros</h4>
                  <ul className="space-y-2">
                    {currentAnalysis.logic.pros.map((item, i) => (
                      <li key={i} className="flex gap-2 text-sm"><span className="text-purple-500">•</span> {item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-red-600 dark:text-red-400 uppercase text-xs mb-2 tracking-wider">Cons</h4>
                  <ul className="space-y-2">
                    {currentAnalysis.logic.cons.map((item, i) => (
                      <li key={i} className="flex gap-2 text-sm"><span className="text-red-400">•</span> {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            }
          />

          <AnalysisCard
            title="Emotion Card"
            colorClass="bg-rose-500"
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>}
            content={
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-rose-700 dark:text-rose-400 uppercase text-xs mb-1 tracking-wider">Internal Impact</h4>
                  <p className="text-sm italic">{currentAnalysis.emotion.impactOnSelf}</p>
                </div>
                <div>
                  <h4 className="font-bold text-rose-700 dark:text-rose-400 uppercase text-xs mb-1 tracking-wider">External Impact</h4>
                  <p className="text-sm">{currentAnalysis.emotion.impactOnOthers}</p>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {currentAnalysis.emotion.primaryEmotions.map((emotion, i) => (
                    <span key={i} className="px-2 py-1 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300 text-[10px] font-bold uppercase rounded-md border border-rose-100 dark:border-rose-800">
                      {emotion}
                    </span>
                  ))}
                </div>
              </div>
            }
          />

          <AnalysisCard
            title="Ethics Card"
            colorClass="bg-amber-500"
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            content={
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-amber-700 dark:text-amber-400 uppercase text-xs mb-1 tracking-wider">Principles</h4>
                  <p className="text-sm font-medium">{currentAnalysis.ethics.principles}</p>
                </div>
                <div>
                  <h4 className="font-bold text-amber-700 dark:text-amber-400 uppercase text-xs mb-1 tracking-wider">Moral Weight</h4>
                  <p className="text-sm">{currentAnalysis.ethics.moralWeight}</p>
                </div>
                <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-xl border border-amber-100 dark:border-amber-800">
                  <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 leading-tight">
                    {currentAnalysis.ethics.ethicalAlignment}
                  </p>
                </div>
              </div>
            }
          />
        </div>

        <Consequences analysis={currentAnalysis} />
        <Books analysis={currentAnalysis} />

        <div className="glass-panel mt-10 rounded-3xl p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-900/40 dark:to-purple-900/40"></div>
          <div className="relative z-10 flex flex-col items-center">
            <h3 className="serif-font text-2xl font-bold text-purple-900 dark:text-purple-300 mb-4 flex items-center justify-center gap-3">
              Mentor's Recommendation
              <button 
                onClick={() => toggleSpeech(currentAnalysis.recommendation)}
                className={`p-2 rounded-full ${isSpeaking ? 'bg-purple-200 dark:bg-purple-800 animate-pulse' : 'bg-white dark:bg-slate-800 hover:bg-slate-100'} transition-colors shadow-sm`}
                title="Read aloud"
              >
                🔊
              </button>
            </h3>
            <p className="text-lg text-purple-800 dark:text-purple-100 max-w-3xl mx-auto leading-relaxed italic border-l-4 border-purple-400 pl-4 mb-8">
              "{currentAnalysis.recommendation}"
            </p>
            <button
              onClick={handleExportImage}
              disabled={isExporting}
              className="px-6 py-3 bg-indigo-600/10 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 font-bold rounded-xl border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-600/20 dark:hover:bg-indigo-900/50 transition-colors flex items-center gap-2"
            >
              {isExporting ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
              )}
              {isExporting ? "Rendering Image..." : "Export as Image"}
            </button>
          </div>
        </div>

        <MentorChat dilemma={input} analysis={currentAnalysis} />

        {/* Hidden Share Card */}
        <ShareCard ref={shareCardRef} input={input} analysis={currentAnalysis} userName={user?.name || user?.email.split('@')[0] || "User"} />
      </div>
    );
  };

  const renderHistory = () => (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="serif-font text-4xl font-bold text-slate-800 dark:text-white">Decision History</h2>
      </div>

      {history.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center">
          <p className="text-slate-400 mb-4">Your journey of wisdom hasn't started yet.</p>
          <button onClick={() => setActiveView(ViewType.ANALYZE)} className="text-purple-600 font-bold hover:underline">
            Make your first decision →
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((entry) => (
            <div 
              key={entry.id} 
              className="glass-panel p-6 rounded-2xl hover:-translate-y-1 transition-all cursor-pointer group"
              onClick={() => {
                setCurrentAnalysis(entry.analysis as DecisionAnalysis);
                setInput(entry.input);
                setActiveView(ViewType.DASHBOARD);
              }}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold text-purple-500 uppercase tracking-widest">
                  {new Date(entry.timestamp).toLocaleDateString()} at {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <button 
                  onClick={(e) => handleDeleteDecision(e, entry.id)}
                  className="text-slate-400 hover:text-red-500 transition-colors p-1"
                  title="Delete"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
              <p className="text-slate-700 dark:text-white font-medium truncate mb-2 pr-4">{entry.input}</p>
              <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-1 italic">"{(entry.analysis as DecisionAnalysis).recommendation}"</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const getEmotionTheme = () => {
    if (activeView !== ViewType.DASHBOARD || !currentAnalysis) return "neutral";
    const emotions = currentAnalysis.emotion.primaryEmotions.map(e => e.toLowerCase());
    if (emotions.some(e => e.includes("anger") || e.includes("frustrat") || e.includes("rage"))) return "anger";
    if (emotions.some(e => e.includes("anxiet") || e.includes("nervous") || e.includes("fear") || e.includes("worry"))) return "anxiety";
    if (emotions.some(e => e.includes("joy") || e.includes("happy") || e.includes("hope") || e.includes("excit"))) return "joy";
    if (emotions.some(e => e.includes("passion") || e.includes("love") || e.includes("desire"))) return "passion";
    if (emotions.some(e => e.includes("sad") || e.includes("grief") || e.includes("depress") || e.includes("guilt"))) return "sadness";
    return "neutral";
  };

  return (
    <Layout activeView={activeView} setActiveView={setActiveView} isAuthenticated={isAuthenticated} onLogout={logout} emotionTheme={getEmotionTheme()}>
      {activeView === ViewType.LOGIN && <Login onSwitch={() => setActiveView(ViewType.SIGNUP)} onSuccess={() => setHasSeenIntro(false)} />}
      {activeView === ViewType.SIGNUP && <SignUp onSwitch={() => setActiveView(ViewType.LOGIN)} onSuccess={() => setHasSeenIntro(false)} />}
      {activeView === ViewType.INTRO && <Intro onComplete={() => { setHasSeenIntro(true); setActiveView(ViewType.HOME); loadHistory(); }} />}
      {activeView === ViewType.HOME && renderHome()}
      {activeView === ViewType.ANALYZE && renderAnalyze()}
      {activeView === ViewType.DASHBOARD && renderDashboard()}
      {activeView === ViewType.HISTORY && renderHistory()}
      {activeView === ViewType.FEEDBACK && <Feedback onBack={() => setActiveView(ViewType.HOME)} />}
      {activeView === ViewType.PROFILE && <Profile onBack={() => setActiveView(ViewType.HOME)} />}
    </Layout>
  );
};

export default MainApp;
