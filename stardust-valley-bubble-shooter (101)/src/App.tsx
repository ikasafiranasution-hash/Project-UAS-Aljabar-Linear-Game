import React, { useState } from 'react';
import GameBoard from './components/GameBoard';
import TutorialModal from './components/TutorialModal';
import LinearAlgebraModal from './components/LinearAlgebraModal';
import { BookOpen, Compass, Sparkles, Sprout, ShieldAlert, Heart, RefreshCw, Zap, Award } from 'lucide-react';
import countrysideBg from './assets/images/countryside_bg_1781109463061.png';

export default function App() {
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isLinearAlgebraOpen, setIsLinearAlgebraOpen] = useState(false);

  // Lifted real-time mathematical states for Linear Algebra HUD reflection
  const [liveAngle, setLiveAngle] = useState(90);
  const [liveUx, setLiveUx] = useState(0.0);
  const [liveUy, setLiveUy] = useState(-1.0);
  const [liveGrid, setLiveGrid] = useState<any[][]>([]);

  return (
    <div 
      className="min-h-screen text-[#3E2723] flex flex-col items-center justify-center py-4 px-4 font-sans selection:bg-[#2E7D32]/25 relative overflow-y-auto bg-cover bg-center"
      style={{ backgroundImage: `url(${countrysideBg})` }}
    >
      
      {/* Semi-transparent dark overlay for cinematic depth */}
      <div className="absolute inset-0 bg-black/10 pointer-events-none z-0"></div>
      
      {/* Dynamic Ambient Background Highlights */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#2E7D32] via-[#F9A825] to-[#6D4C41] z-10"></div>

      {/* Main Game Interface Board takes ultimate focus */}
      <main className="w-full max-w-5xl flex items-center justify-center animate-fade-in z-10">
        <GameBoard 
          onOpenTutorial={() => setIsTutorialOpen(true)}
          onOpenLinearAlgebra={() => setIsLinearAlgebraOpen(true)}
          onUpdateLinearAlgebra={(angle: number, ux: number, uy: number, grid: any[][]) => {
            setLiveAngle(angle);
            setLiveUx(ux);
            setLiveUy(uy);
            setLiveGrid(grid);
          }}
        />
      </main>

      {/* Global Action Guides & Academic Project Credits in elegant woody glass capsule */}
      <div id="footer-actions" className="flex items-center justify-center gap-4 mt-4 text-[11px] font-black font-sans z-10 uppercase bg-[#FFFCE8]/90 border-2 border-[#5D4037]/25 rounded-full px-5 py-1.5 shadow-md">
        <button 
          id="open-tutorial-footer-btn"
          onClick={() => setIsTutorialOpen(true)}
          className="text-[#6D4C41] hover:text-[#5D4037] flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <BookOpen className="w-3.5 h-3.5 text-[#2E7D32]" />
          <span>Cara Bermain</span>
        </button>
        <span className="text-[#5D4037]/45 font-light">|</span>
        <button 
          id="open-la-footer-btn"
          onClick={() => setIsLinearAlgebraOpen(true)}
          className="text-[#2E7D32] hover:text-[#256428] flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <Compass className="w-3.5 h-3.5 text-[#F9A825]" />
          <span>Matematika di Balik Game</span>
        </button>
      </div>

      {/* MODAL WINDOWS */}
      <TutorialModal 
        isOpen={isTutorialOpen} 
        onClose={() => setIsTutorialOpen(false)} 
      />
      <LinearAlgebraModal 
        isOpen={isLinearAlgebraOpen} 
        onClose={() => setIsLinearAlgebraOpen(false)} 
        liveAngle={liveAngle}
        liveUx={liveUx}
        liveUy={liveUy}
        liveGrid={liveGrid}
      />

    </div>
  );
}
