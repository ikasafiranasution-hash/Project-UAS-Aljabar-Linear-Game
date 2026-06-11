import React from 'react';
import { X, HelpCircle, Heart, Zap, Compass } from 'lucide-react';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TutorialModal({ isOpen, onClose }: TutorialModalProps) {
  if (!isOpen) return null;

  return (
    <div id="tutorial-modal" className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-sm">
      <div 
        id="tutorial-modal-content"
        className="w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-xl border-4 border-[#6D4C41] bg-[#F5F2EB] text-[#3E2723] flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="bg-[#6D4C41] text-white p-4 flex justify-between items-center border-b-4 border-[#2E7D32]">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#F9A825]" />
            <h2 className="text-base font-bold font-sans tracking-wide text-[#F9A825]">
              Cara Bermain — Bubble Paws Valley
            </h2>
          </div>
          <button 
            id="close-tutorial-modal-btn"
            onClick={onClose} 
            className="p-1 hover:bg-black/20 rounded-md transition-colors text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-5 overflow-y-auto min-h-0 space-y-4 text-xs">
          
          {/* Quick Start Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#EFEBE4] p-3 rounded-lg border border-[#6D4C41]/10 space-y-1">
              <span className="font-extrabold text-[#2E7D32] flex items-center gap-1">
                🎯 1. SASAR & TEMBAK
              </span>
              <p className="text-gray-700 leading-relaxed text-[11px]">
                Arahkan kursor atau sentuh layar untuk membidik bersama <strong>Luna the Stardust Guardian</strong>. <strong>Klik / Ketuk</strong> untuk melontarkan bubble. Cocokkan <strong>3 bubble sewarna</strong> untuk memecahkannya!
              </p>
            </div>

            <div className="bg-[#EFEBE4] p-3 rounded-lg border border-[#6D4C41]/10 space-y-1">
              <span className="font-extrabold text-[#2E7D32] flex items-center gap-1">
                📐 2. FISIKA PANTULAN VEKTOR
              </span>
              <p className="text-gray-700 leading-relaxed text-[11px]">
                Pantulkan gelembung ke dinding kiri/kanan untuk sudut sulit! <strong>Tembakan Pantulan (Bounce Shot) memberikan Bonus Skor Ganda 2x Lipat!</strong>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Column 1: Power-up */}
            <div className="bg-white p-3 rounded-lg border border-[#6D4C41]/15 space-y-2">
              <h4 className="font-bold text-[#6D4C41] flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-[#F9A825]" /> Gunakan Item Ajaib
              </h4>
              <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                <div className="flex items-center gap-1 bg-green-50 p-1.5 rounded border border-green-200 col-span-1">
                  <span>🌈</span>
                  <span><strong>Rainbow:</strong> Bebas warna</span>
                </div>
                <div className="flex items-center gap-1 bg-orange-50 p-1.5 rounded border border-orange-200 col-span-1">
                  <span>💣</span>
                  <span><strong>Bomb:</strong> Ledak area radius 2</span>
                </div>
                <div className="flex items-center gap-1 bg-blue-50 p-1.5 rounded border border-blue-200 col-span-2">
                  <span>📐</span>
                  <span><strong>Vector Assist:</strong> Menggambar lintasan real-time lengkap sebelum dan sesudah memantul untuk memahami refleksi vektor secara visual!</span>
                </div>
              </div>
            </div>

            {/* Column 2: lives & swap */}
            <div className="bg-white p-3 rounded-lg border border-[#6D4C41]/15 space-y-2">
              <h4 className="font-bold text-[#6D4C41] flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> Sistem Nyawa & Aturan
              </h4>
              <ul className="text-[10.5px] space-y-1 text-gray-700">
                <li className="flex items-start gap-1">
                  <span>❤️</span>
                  <span>Dibekali <strong>3 Nyawa</strong>, berkurang jika waktu habis atau gelembung melewati garis batas merah.</span>
                </li>
                <li className="flex items-start gap-1">
                  <span>🔄</span>
                  <span>Tombol <strong>SWAP</strong> menukar bubble aktif dengan 5 detik cooldown taktis.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Level Objectives */}
          <div className="bg-[#2E7D32]/10 p-3 rounded-lg border border-[#2E7D32]/30 space-y-1.5">
            <h4 className="font-bold text-[#2E7D32] flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-[#2E7D32]" /> Struktur 3 Level Petualangan
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center text-[10.5px]">
              <div className="p-1.5 bg-white/60 border border-[#2E7D32]/20 rounded">
                <span className="font-bold text-[#2E7D32] block">Level 1: Sunny Valley</span>
                Dasar menembak gelembung
              </div>
              <div className="p-1.5 bg-white/60 border border-[#2E7D32]/20 rounded">
                <span className="font-bold text-amber-700 block">Level 2: Whispering Canyon</span>
                Pantulan taktis & tantangan sudut pantul
              </div>
              <div className="p-1.5 bg-white/60 border border-[#2E7D32]/20 rounded">
                <span className="font-bold text-red-700 block">Level 3: Mystic Woods</span>
                Rintangan Stone Bubble yang kuat (butuh 2 tembakan)
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-[#EFEBE4] p-3 flex justify-end border-t border-[#6D4C41]/20">
          <button
            id="start-game-from-tutorial"
            onClick={onClose}
            className="bg-[#2E7D32] hover:bg-[#256428] text-white font-bold py-1.5 px-5 rounded-lg text-xs shadow transition-all transform hover:scale-105 cursor-pointer"
          >
            Lanjutkan Bermain 🐾
          </button>
        </div>
      </div>
    </div>
  );
}
