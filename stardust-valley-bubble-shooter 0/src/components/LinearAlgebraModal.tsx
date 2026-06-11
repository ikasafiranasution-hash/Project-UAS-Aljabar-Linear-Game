import React, { useState } from 'react';
import { X, RotateCcw, Compass, Grid, ArrowRightLeft, Radio } from 'lucide-react';

const COLORS_HEX: Record<string, string> = {
  blue: '#3B82F6',   // Bright blue
  purple: '#A855F7', // Deep purple
  green: '#22C55E',  // Vibrant green
  yellow: '#EAB308', // Amber yellow
  orange: '#F97316'  // Rich orange
};

interface LinearAlgebraModalProps {
  isOpen: boolean;
  onClose: () => void;
  liveAngle?: number;
  liveUx?: number;
  liveUy?: number;
  liveGrid?: any[][];
}

export default function LinearAlgebraModal({ 
  isOpen, 
  onClose,
  liveAngle,
  liveUx,
  liveUy,
  liveGrid
}: LinearAlgebraModalProps) {
  const [activeTab, setActiveTab] = useState<'vector' | 'matrix' | 'reflection' | 'distance'>('vector');

  // Interactive State for Tab 1 (Vector)
  const [aimAngle, setAimAngle] = useState(45); // degrees
  const angleRad = (aimAngle * Math.PI) / 180;
  const vx = Math.cos(angleRad);
  const vy = -Math.sin(angleRad); // negative because screen y goes down

  // Interactive State for Tab 3 (Reflection)
  const [refVelX, setRefVelX] = useState(4);
  const [refVelY, setRefVelY] = useState(-3);
  const [wallNormalX, setWallNormalX] = useState(-1); // -1 for left wall bouncing right, or RHS wall
  // Formula: v' = v - 2(v . n)n
  const dotProduct = (refVelX * wallNormalX) + (refVelY * 0);
  const finalVelX = refVelX - 2 * dotProduct * wallNormalX;
  const finalVelY = refVelY;

  // Interactive State for Tab 4 (Distance Collision)
  const [bubbleAX, setBubbleAX] = useState(150);
  const [bubbleAY, setBubbleAY] = useState(100);
  const [bubbleBX, setBubbleBX] = useState(210);
  const [bubbleBY, setBubbleBY] = useState(130);
  const radius = 24;
  const distance = Math.sqrt(Math.pow(bubbleAX - bubbleBX, 2) + Math.pow(bubbleAY - bubbleBY, 2));
  const isColliding = distance <= radius * 2;

  if (!isOpen) return null;

  return (
    <div id="linear-algebra-modal" className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-sm">
      <div 
        id="la-modal-content"
        className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-xl border-4 border-[#6D4C41] bg-[#F5F2EB] text-[#3E2723] flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="bg-[#6D4C41] text-white p-4 flex justify-between items-center border-b-4 border-[#2E7D32]">
          <div className="flex items-center gap-2">
            <Compass className="w-6 h-6 text-[#F9A825] animate-spin-slow" />
            <h2 className="text-xl font-bold font-sans tracking-wide text-[#F9A825]">
              Implementasi Aljabar Linear — Bubble Paws Valley
            </h2>
          </div>
          <button 
            id="close-la-modal-btn"
            onClick={onClose} 
            className="p-1 hover:bg-black/20 rounded-md transition-colors text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap border-b border-[#6D4C41]/20 bg-[#EFEBE4]">
          <button
            onClick={() => setActiveTab('vector')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-all border-b-4 ${
              activeTab === 'vector'
                ? 'border-[#2E7D32] bg-[#F5F2EB] text-[#2E7D32]'
                : 'border-transparent text-[#6D4C41]/70 hover:bg-[#6D4C41]/5'
            }`}
          >
            <Compass className="w-4 h-4" />
            1. Vektor Arah Tembakan
          </button>
          <button
            onClick={() => setActiveTab('matrix')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-all border-b-4 ${
              activeTab === 'matrix'
                ? 'border-[#2E7D32] bg-[#F5F2EB] text-[#2E7D32]'
                : 'border-transparent text-[#6D4C41]/70 hover:bg-[#6D4C41]/5'
            }`}
          >
            <Grid className="w-4 h-4" />
            2. Matriks Grid Posisi
          </button>
          <button
            onClick={() => setActiveTab('reflection')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-all border-b-4 ${
              activeTab === 'reflection'
                ? 'border-[#2E7D32] bg-[#F5F2EB] text-[#2E7D32]'
                : 'border-transparent text-[#6D4C41]/70 hover:bg-[#6D4C41]/5'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            3. Refleksi Pantulan Dinding
          </button>
          <button
            onClick={() => setActiveTab('distance')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-all border-b-4 ${
              activeTab === 'distance'
                ? 'border-[#2E7D32] bg-[#F5F2EB] text-[#2E7D32]'
                : 'border-transparent text-[#6D4C41]/70 hover:bg-[#6D4C41]/5'
            }`}
          >
            <Radio className="w-4 h-4" />
            4. Jarak Euclidean & Tabrakan
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 overflow-y-auto min-h-0">
          {/* TAB 1: VECTOR ATTEMPT */}
          {activeTab === 'vector' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <span className="inline-block bg-[#2E7D32]/10 text-[#2E7D32] text-xs font-bold px-2.5 py-1 rounded-full">
                  Teori Vektor Launcher
                </span>
                <p className="text-sm leading-relaxed">
                  Saat pemain membidik, arah tembakan direpresentasikan sebagai <strong>Vektor Satuan (Unit Vector)</strong> û. 
                  Vektor satuan memiliki panjang (magnitude) bernilai 1.
                </p>
                <div className="bg-white p-4 rounded-lg border border-[#6D4C41]/20 font-mono text-xs space-y-2 shadow-inner">
                  <p className="text-[#2E7D32] font-semibold">// Persamaan Trigonometri Vektor Arah</p>
                  <p className="text-lg font-bold text-center my-3 bg-[#F5F2EB] p-2 rounded">
                    û = [ cos(θ), -sin(θ) ]
                  </p>
                  <p>Sudut bidik simulator (θ) = <span className="font-bold text-[#F9A825]">{aimAngle}°</span></p>
                  <p>cos({aimAngle}°) = {Math.cos(angleRad).toFixed(4)}</p>
                  <p>sin({aimAngle}°) = {Math.sin(angleRad).toFixed(4)}</p>
                  <div className="border-t border-[#6D4C41]/10 pt-2 text-sm font-semibold">
                    Hasil Vektor Arah Simulator:<br />
                    <span className="text-[#2E7D32]">û_sim = [ {vx.toFixed(4)}, {vy.toFixed(4)} ]</span>
                  </div>
                </div>

                {liveAngle !== undefined && (
                  <div className="bg-[#E8F5E9] p-4 rounded-lg border border-[#2E7D32]/30 font-mono text-xs space-y-2 shadow-sm animate-pulse">
                    <p className="text-[#2E7D32] font-extrabold">// 🎯 VEKTOR GAMEPLAY REAL-TIME (LIVE)</p>
                    <p>Membaca koordinat tarikan kursor kuncup kucing:</p>
                    <p>Sudut Tembak Aktif = <span className="font-black text-[#E65100]">{Math.round(liveAngle)}°</span></p>
                    <div className="border-t border-[#2E7D32]/20 pt-2 text-[11px] font-black">
                      Vektor Arah Proyeksi:<br />
                      <span className="text-[#E65100]">û_live = [ {liveUx?.toFixed(4)}, {liveUy?.toFixed(4)} ]</span>
                    </div>
                  </div>
                )}
                <div className="bg-[#F9A825]/10 p-3 rounded-lg border border-[#F9A825]/40 text-xs text-[#5D4037]">
                  <strong>Catatan UAS:</strong> Nilai Y yang bernilai negatif di atas dikarenakan sistem koordinat layar komputer (Web Canvas) menempatkan sumbu Y positif mengarah <em>ke bawah</em>, sedangkan arah bidik mengarah <em>ke atas</em>.
                </div>
              </div>

              {/* Live Interactive Visualization */}
              <div className="bg-[#EFEBE4] p-4 rounded-lg border border-[#6D4C41]/20 flex flex-col justify-between">
                <h4 className="text-sm font-bold text-[#6D4C41] mb-2 flex items-center gap-1">
                  <Compass className="w-4 h-4 text-[#F9A825]" /> Simulasi Live Vektor Satuan
                </h4>
                
                {/* Aiming Canvas simulation */}
                <div className="flex-1 min-h-[160px] bg-white rounded border border-[#6D4C41]/15 relative flex items-center justify-center overflow-hidden">
                  <svg className="w-full h-full min-h-[180px]" viewBox="0 0 200 200">
                    <circle cx="100" cy="180" r="15" fill="#6D4C41" />
                    {/* Aim Line with points */}
                    <line 
                      x1="100" 
                      y1="180" 
                      x2={100 + vx * 90} 
                      y2={180 + vy * 90} 
                      stroke="#F9A825" 
                      strokeWidth="3" 
                      strokeDasharray="4 4"
                    />
                    <circle cx={100 + vx * 90} cy={180 + vy * 90} r="6" fill="#2E7D32" />
                    {/* Coordinate axes */}
                    <line x1="10" y1="180" x2="190" y2="180" stroke="#ccc" strokeWidth="1" />
                    <line x1="100" y1="10" x2="100" y2="190" stroke="#ccc" strokeWidth="1" />
                    {/* Angle Arc */}
                    <path 
                      d={`M ${100 + Math.cos(0)*30} 180 A 30 30 0 0 0 ${100 + vx*30} ${180 + vy*30}`} 
                      fill="none" 
                      stroke="#2E7D32" 
                      strokeWidth="2" 
                    />
                    <text x="135" y="170" fill="#2E7D32" className="text-[10px] font-bold">θ = {aimAngle}°</text>
                    <text x="12" y="195" fill="#888" className="text-[8px] font-mono">X-Axis</text>
                    <text x="105" y="20" fill="#888" className="text-[8px] font-mono">-Y (Up)</text>
                  </svg>
                </div>

                <div className="mt-4 space-y-1">
                  <div className="flex justify-between text-xs text-[#6D4C41] font-semibold">
                    <span>Sesuaikan Sudut (θ):</span>
                    <span className="text-[#2E7D32]">{aimAngle}°</span>
                  </div>
                  <input 
                    type="range" 
                    min="15" 
                    max="165" 
                    value={aimAngle} 
                    onChange={(e) => setAimAngle(Number(e.target.value))}
                    className="w-full accent-[#2E7D32] h-2 bg-gray-200 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                    <span>15° (Kanan)</span>
                    <span>90° (Tegak)</span>
                    <span>165° (Kiri)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GRID MATRIX */}
          {activeTab === 'matrix' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <span className="inline-block bg-[#2E7D32]/10 text-[#2E7D32] text-xs font-bold px-2.5 py-1 rounded-full">
                  Matriks & Representasi Grid
                </span>
                <p className="text-sm leading-relaxed">
                  Papan permainan Bubble Shooter direpresentasikan dalam matematika sebagai <strong>Matriks 2 Dimensi</strong> berukuran M x N (misal 10 x 8). Setiap elemen matriks menyimpan status slot bubble:
                </p>
                <div className="bg-white p-4 rounded-lg border border-[#6D4C41]/20 font-mono text-xs space-y-2 shadow-inner">
                  <p className="text-[#2E7D32] font-semibold">// Indeks Matriks Hexagonal Grid</p>
                  <p className="text-[11px] leading-tight">
                    Baris Gasal (Genap): 8 kolom <br />
                    Baris Ganjil: 8 kolom (Tergeser setengah radius ke kanan, meminimalkan ruang kosong / densitas struktur sarang lebah).
                  </p>
                  <div className="border-t border-[#6D4C41]/10 pt-2 space-y-1">
                    <p>Rumus Konversi Grid (r, c) ke Koordinat Layar (X, Y):</p>
                    <div className="p-2 bg-[#F5F2EB] rounded text-[11px] font-bold">
                      X = c * Diameter + (r % 2 === 1 ? Radius : 0)<br />
                      Y = r * (Diameter * sin(60°))
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-white border border-[#6D4C41]/10 rounded-lg text-xs space-y-1">
                  <strong>Penerapan Matriks:</strong>
                  <ul className="list-disc pl-4 space-y-1 text-[#5D4037]">
                    <li>Operasi DFS/BFS (Breadth-First Search) menggunakan indeks tetangga matriks untuk mendeteksi rumpun warna sama (minimal 3) untuk dipecahkan.</li>
                    <li>Sistem "Floating Bubble": Menganalisis matriks untuk menemukan sub-grup yang tidak memiliki jalur terhubung ke baris indeks 0, lalu merontokkan bubble tersebut menggunakan gravitasi.</li>
                  </ul>
                </div>
              </div>

              {/* Grid Demo Visualizer */}
              <div className="bg-[#EFEBE4] p-4 rounded-lg border border-[#6D4C41]/20 flex flex-col justify-between">
                <h4 className="text-sm font-bold text-[#6D4C41] mb-2 flex items-center gap-1">
                  <Grid className="w-4 h-4 text-[#F9A825]" /> Visualisasi Matriks Hexagonal
                </h4>
                
                <div className="flex-1 bg-white p-3 rounded border border-[#6D4C41]/15 flex flex-col justify-center items-center">
                  {liveGrid && liveGrid.length > 0 ? (
                    <>
                      <p className="text-[10px] text-emerald-600 mb-2 font-mono text-center font-bold animate-pulse">
                        ● MATRIKS GAMEPLAY LIVE [{liveGrid.length} Baris x 8 Kolom]
                      </p>
                      
                      <div className="space-y-1 select-none overflow-y-auto max-h-[160px] p-2 bg-gray-50 rounded w-full border border-gray-150">
                        {liveGrid.map((rowArr, row) => (
                          <div 
                            key={row} 
                            className="flex gap-0.5 justify-center"
                            style={{ paddingLeft: row % 2 === 1 ? '11px' : '0px' }}
                          >
                            {rowArr.map((cell, col) => {
                              let bubbleHex = '#ECEFF1'; // slate gray for empty
                              let borderStyle = 'border-gray-300';
                              let titleText = `M[${row}][${col}] = Empty`;

                              if (cell) {
                                if (cell.obstacle === 'stone') {
                                  bubbleHex = '#757575';
                                  borderStyle = 'border-[#424242]';
                                  titleText = `M[${row}][${col}] = STONE`;
                                } else {
                                  bubbleHex = COLORS_HEX[cell.color] || '#3B82F6';
                                  borderStyle = 'border-white';
                                  titleText = `M[${row}][${col}] = ${cell.color}`;
                                }
                              }

                              return (
                                <div 
                                  key={col} 
                                  className={`w-3.5 h-3.5 rounded-full flex items-center justify-center relative border shadow-sm text-[5px] text-white font-mono scale-95 hover:scale-125 transition-transform cursor-pointer`}
                                  style={{ backgroundColor: bubbleHex }}
                                  title={titleText}
                                >
                                  {cell ? (cell.obstacle === 'stone' ? '🪨' : cell.color[0].toUpperCase()) : '.'}
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-[10px] text-gray-500 mb-2 font-mono text-center">Matriks [4 x 8] Representasi Papan Bubble</p>
                      
                      <div className="space-y-1">
                        {[0, 1, 2, 3].map((row) => (
                          <div 
                            key={row} 
                            className="flex gap-1"
                            style={{ paddingLeft: row % 2 === 1 ? '10px' : '0px' }}
                          >
                            {[0, 1, 2, 3, 4, 5, 6, 7].map((col) => {
                              let color = '#ccc';
                              if ((row + col) % 3 === 0) color = '#3B82F6'; // Blue
                              else if ((row + col) % 3 === 1) color = '#A855F7'; // Purple
                              else color = '#22C55E'; // Green

                              return (
                                <div 
                                  key={col} 
                                  className="w-4 h-4 rounded-full flex items-center justify-center relative hover:scale-125 transition-transform cursor-pointer"
                                  style={{ backgroundColor: color }}
                                  title={`M[${row}][${col}]`}
                                >
                                  <span className="text-[6px] text-white font-mono scale-[0.7]">
                                    {row},{col}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  <div className="mt-3 border-t border-gray-100 pt-1.5 w-full text-[9px] space-y-1 font-mono text-gray-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#3B82F6]"></span>
                        <span>B: Blue</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#22C55E]"></span>
                        <span>G: Green</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#A855F7]"></span>
                        <span>P: Purple</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#ECEFF1] border border-dashed border-gray-400"></span>
                        <span>.: Empty Slot</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WALL REFLECTION */}
          {activeTab === 'reflection' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <span className="inline-block bg-[#2E7D32]/10 text-[#2E7D32] text-xs font-bold px-2.5 py-1 rounded-full">
                  Teori Refleksi Pantulan
                </span>
                <p className="text-sm leading-relaxed">
                  Pantulan bubble pada dinding kiri atau kanan mengikuti hukum fisika elastis sempurna yang didasarkan pada <strong>Vektor Normal Dinding</strong> n dan operasi <strong>Dot Product (Perkalian Titik)</strong>.
                </p>
                <div className="bg-white p-4 rounded-lg border border-[#6D4C41]/20 font-mono text-xs space-y-2 shadow-inner">
                  <p className="text-[#2E7D32] font-semibold">// Persamaan Refleksi Linear Algebra</p>
                  <p className="text-sm font-bold text-center my-2 bg-[#F5F2EB] p-2 rounded leading-relaxed">
                    v' = v - 2(v · n)n
                  </p>
                  <div>
                    <p>Di mana:</p>
                    <ul className="list-disc pl-4 space-y-1 text-gray-700">
                      <li>v = Vektor kecepatan sebelum memantul</li>
                      <li>n = Vektor normal permukaan dinding</li>
                      <li>v' = Vektor kecepatan setelah pantulan</li>
                    </ul>
                  </div>
                  <div className="border-t border-[#6D4C41]/10 pt-2 space-y-1">
                    <p>Karena dinding vertikal berkoodinat datar, maka n = [1, 0] (dinding kiri) atau n = [-1, 0] (dinding kanan).</p>
                    <p>Mari kita hitung:</p>
                    <p className="text-[#2E7D32] font-semibold">
                      v · n = ({refVelX} * {wallNormalX}) + ({refVelY} * 0) = {dotProduct}
                    </p>
                    <p className="text-[#2E7D32] font-bold">
                      v' = [ {refVelX} - 2*({dotProduct})*({wallNormalX}), {refVelY} ] = [ {finalVelX}, {finalVelY} ]
                    </p>
                  </div>
                </div>
              </div>

              {/* Dynamic Wall Bounce Simulator */}
              <div className="bg-[#EFEBE4] p-4 rounded-lg border border-[#6D4C41]/20 flex flex-col justify-between">
                <h4 className="text-sm font-bold text-[#6D4C41] mb-2 flex items-center gap-1">
                  <ArrowRightLeft className="w-4 h-4 text-[#F9A825]" /> Simulator Interaktif Hukum Pantulan
                </h4>

                <div className="flex-1 min-h-[180px] bg-white rounded border border-[#6D4C41]/15 relative flex flex-col justify-between p-3 overflow-hidden">
                  <div className="flex-1 relative border-r-4 border-gray-400">
                    <svg className="w-full h-full" viewBox="0 0 200 120">
                      {/* Bouncing wall (Right line) */}
                      <line x1="180" y1="0" x2="180" y2="120" stroke="#6D4C41" strokeWidth="4" />
                      <text x="185" y="60" fill="#6D4C41" transform="rotate(90 185 60)" className="text-[7px] font-bold">DINDING (Normal n = [-1,0])</text>

                      {/* Before Vector line */}
                      <line x1="20" y1="100" x2="180" y2="40" stroke="#3B82F6" strokeWidth="2" markerEnd="url(#arrow-blue)" />
                      <text x="50" y="80" fill="#3B82F6" className="text-[8px] font-mono font-bold">v = [{refVelX}, {refVelY}]</text>

                      {/* After Vector line */}
                      <line x1="180" y1="40" x2="20" y2="10" stroke="#2E7D32" strokeWidth="2" strokeDasharray="3 3" />
                      <line x1="180" y1="40" x2="70" y2="2" stroke="#2E7D32" strokeWidth="2" />
                      <text x="100" y="25" fill="#2E7D32" className="text-[8px] font-mono font-bold">v' = [{finalVelX}, {finalVelY}]</text>

                      <circle cx="180" cy="40" r="8" fill="#F9A825" />
                    </svg>
                  </div>

                  <div className="mt-2 text-[10px] bg-gray-50 p-2 rounded font-mono text-gray-600">
                    Sederhananya, pada dinding lurus vertikal, memantul hanya akan membalikkan tanda komponen sumbu X (<span className="text-[#3B82F6]">Vx</span> menjadi <span className="text-[#2E7D32]">-Vx</span>), sedangkan sumbu Y tetap searah!
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button 
                    onClick={() => {
                      setRefVelX(refVelX * -1);
                    }}
                    className="flex-1 py-1.5 px-3 bg-[#6D4C41] hover:bg-[#5d4037] text-white rounded text-xs font-semibold shadow transition-all flex items-center justify-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Balikkan Arah Vx
                  </button>
                  <button 
                    onClick={() => {
                      setWallNormalX(wallNormalX === -1 ? 1 : -1);
                    }}
                    className="flex-1 py-1.5 px-3 bg-[#2E7D32] hover:bg-[#256428] text-white rounded text-xs font-semibold shadow transition-all flex items-center justify-center gap-1"
                  >
                    Ubah Normal Normal Dinding
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ACCURACY DISTANCE CHECK */}
          {activeTab === 'distance' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <span className="inline-block bg-[#2E7D32]/10 text-[#2E7D32] text-xs font-bold px-2.5 py-1 rounded-full">
                  Formula Jarak Euclidean & Tabrakan
                </span>
                <p className="text-sm leading-relaxed">
                  Bagaimana bubble tahu kapan harus berhenti menempel di barisan? Di setiap frame pergerakan, engine menghitung jarak antara pusat bubble yang meluncur dengan pusat setiap bubble di papan menggunakan <strong>Jarak Euclidean 2D</strong>.
                </p>
                <div className="bg-white p-4 rounded-lg border border-[#6D4C41]/20 font-mono text-xs space-y-2 shadow-inner">
                  <p className="text-[#2E7D32] font-semibold">// Jarak Euclidean Pangkal Dua Titik</p>
                  <p className="text-sm font-bold text-center my-2 bg-[#F5F2EB] p-2 rounded">
                    d = √((x₂ - x₁)² + (y₂ - y₁)²)
                  </p>
                  <div className="space-y-1 text-[11px] text-gray-700">
                    <p>Posisi Bubble Aktif (A): ({bubbleAX}, {bubbleAY})</p>
                    <p>Posisi Bubble Papan (B): ({bubbleBX}, {bubbleBY})</p>
                    <p>Panjang Jarak Riil (d) = <span className="font-bold text-[#2E7D32]">{distance.toFixed(2)} px</span></p>
                    <p>Kumulatif Radius Aman (2 * R) = <span className="font-bold text-[#6D4C41]">{radius * 2} px (2x24)</span></p>
                  </div>
                  <div className={`mt-3 p-2 rounded text-center font-bold text-xs ${
                    isColliding 
                      ? 'bg-red-100 text-red-700 border border-red-300 animate-pulse'
                      : 'bg-green-100 text-green-700 border border-green-300'
                  }`}>
                    Status: {isColliding ? 'TABRAKAN (Jarak ≤ 48 px)' : 'BEBAS BERGERAK (Jarak > 48 px)'}
                  </div>
                </div>
              </div>

              {/* Distance Interactive Widget */}
              <div className="bg-[#EFEBE4] p-4 rounded-lg border border-[#6D4C41]/20 flex flex-col justify-between">
                <h4 className="text-sm font-bold text-[#6D4C41] mb-2 flex items-center gap-1">
                  <Radio className="w-4 h-4 text-[#F9A825]" /> Interactive Euclidean Drag-Test
                </h4>

                <div className="flex-1 min-h-[180px] bg-white rounded border border-[#6D4C41]/15 relative overflow-hidden">
                  <svg className="w-full h-full min-h-[160px]" viewBox="0 0 350 180">
                    {/* Connection line indicating distance path */}
                    <line 
                      x1={bubbleAX} 
                      y1={bubbleAY} 
                      x2={bubbleBX} 
                      y2={bubbleBY} 
                      stroke={isColliding ? '#EF4444' : '#2E7D32'} 
                      strokeWidth="2" 
                      strokeDasharray="3 3"
                    />

                    {/* Bubble A (Aimable / Moving) */}
                    <circle cx={bubbleAX} cy={bubbleAY} r={radius} fill="#3B82F6" opacity="0.8" stroke="#1D4ED8" strokeWidth="2" />
                    <text x={bubbleAX - 10} y={bubbleAY + 4} fill="white" className="text-[10px] font-mono font-bold">A</text>

                    {/* Bubble B (Fixed) */}
                    <circle cx={bubbleBX} cy={bubbleBY} r={radius} fill="#A855F7" opacity="0.8" stroke="#6B21A8" strokeWidth="2" />
                    <text x={bubbleBX - 10} y={bubbleBY + 4} fill="white" className="text-[10px] font-mono font-bold">B</text>

                    {/* Collision Overlay indication */}
                    {isColliding && (
                      <circle cx={(bubbleAX+bubbleBX)/2} cy={(bubbleAY+bubbleBY)/2} r="18" fill="none" stroke="#EF4444" strokeWidth="2" className="animate-ping" />
                    )}

                    {/* Info text floating */}
                    <text x="10" y="165" fill="#5D4037" className="text-[10px] font-mono font-semibold bg-white">
                      Jarak d = {distance.toFixed(1)} | {isColliding ? '💥 TABRAKAN' : '✅ SEJAJAR'}
                    </text>
                  </svg>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs text-[#6D4C41] font-semibold">
                    <span>Geser Bubble Biru (Sum. X):</span>
                    <span className="text-[#2E7D32]">{bubbleAX} px</span>
                  </div>
                  <input 
                    type="range" 
                    min="100" 
                    max="290" 
                    value={bubbleAX} 
                    onChange={(e) => setBubbleAX(Number(e.target.value))}
                    className="w-full accent-[#3B82F6] h-2 bg-gray-200 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#EFEBE4] p-4 flex justify-between items-center border-t border-[#6D4C41]/20">
          <p className="text-xs text-[#6D4C41]/75 italic font-sans">
            *Dirancang khusus untuk kebutuhan Presentasi Sidang / UAS Aljabar Linear Teknik Informatika.
          </p>
          <button
            id="close-la-modal-bottom-btn"
            onClick={onClose}
            className="bg-[#2E7D32] hover:bg-[#256428] text-white font-bold py-1.5 px-4 rounded text-sm shadow transition-colors"
          >
            Selesai & Lanjut Gameplay
          </button>
        </div>
      </div>
    </div>
  );
}
