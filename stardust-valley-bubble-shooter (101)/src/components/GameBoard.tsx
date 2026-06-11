/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, RotateCcw, Volume2, VolumeX, BookOpen, Calculator, 
  HelpCircle, Sparkles, Heart, Award, Zap, AlertTriangle, ChevronRight, Pause, Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BubbleColor, Bubble, GridPos, ShootingBubble, Particle, FloatingText, LevelConfig 
} from '../types';
import { AudioEngine } from './AudioEngine';
import countrysideBg from '../assets/images/countryside_bg_1781109463061.png';

interface GameBoardProps {
  onOpenTutorial: () => void;
  onOpenLinearAlgebra: () => void;
  onUpdateLinearAlgebra?: (angle: number, ux: number, uy: number, grid: any[][]) => void;
}

// Global constant sizes for rendering
const CANVAS_WIDTH = 520;
const CANVAS_HEIGHT = 580;
const BUBBLE_RADIUS = 15;
const BUBBLE_DIAMETER = BUBBLE_RADIUS * 2;
const OFFSET_X = 42.5; // centers the 14 bubbles on board perfectly: 14 * 30 = 420. Shifted layers start at 42.5 and end perfectly at 477.5
const OFFSET_Y = 25; // 15-20px distance from top HUD

const MAX_ROWS = 17;
const MAX_COLS = 14;
const DEATH_ROW_INDEX = 14;

// 3 Level configurations
const LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: "Lvl 1: Sunny Valley",
    rowsCount: 8,
    targetScore: 1000,
    allowedAmmo: 48,
    timeLimitSec: 100,
    initialGrid: [
      ['blue', 'blue', 'green', 'green', 'yellow', 'yellow', 'purple', 'purple', 'green', 'green', 'blue', 'blue', 'yellow', 'yellow'],
      ['purple', 'blue', 'green', 'yellow', 'yellow', 'green', 'blue', 'purple', 'blue', 'purple', 'green', 'yellow', 'orange', 'orange'],
      ['green', 'purple', 'blue', 'yellow', 'yellow', 'blue', 'purple', 'green', 'purple', 'green', 'blue', 'yellow', 'orange', 'orange'],
      ['orange', 'green', 'purple', 'blue', 'blue', 'purple', 'green', 'orange', 'blue', 'green', 'orange', 'purple', 'yellow', 'yellow'],
      ['yellow', 'orange', 'green', 'purple', 'purple', 'green', 'orange', 'yellow', 'purple', 'blue', 'green', 'yellow', 'blue', 'blue'],
      [null, 'yellow', 'orange', 'green', 'green', 'orange', 'yellow', 'blue', 'green', 'yellow', 'orange', 'blue', 'blue', null],
    ]
  },
  {
    id: 2,
    name: "Lvl 2: Whispering Canyon",
    rowsCount: 9,
    targetScore: 1800,
    allowedAmmo: 54,
    timeLimitSec: 120,
    initialGrid: [
      ['orange', 'orange', 'purple', 'purple', 'blue', 'blue', 'green', 'green', 'yellow', 'yellow', 'orange', 'orange', 'purple', 'purple'],
      ['green', 'orange', 'yellow', 'yellow', 'orange', 'blue', 'purple', 'blue', 'purple', 'blue', 'green', 'yellow', 'orange', 'orange'],
      ['blue', 'yellow', 'purple', 'green', 'green', 'purple', 'yellow', 'blue', 'yellow', 'purple', 'green', 'orange', 'blue', 'blue'],
      ['purple', 'green', 'orange', 'blue', 'blue', 'orange', 'green', 'purple', 'green', 'orange', 'yellow', 'purple', 'yellow', 'yellow'],
      ['yellow', 'purple', 'green', 'orange', 'orange', 'green', 'purple', 'yellow', 'blue', 'green', 'orange', 'blue', 'purple', 'purple'],
      ['orange', 'yellow', 'purple', 'blue', 'blue', 'purple', 'yellow', 'orange', 'yellow', 'purple', 'green', 'orange', 'yellow', 'yellow'],
      ['green', 'orange', 'yellow', 'purple', 'purple', 'yellow', 'orange', 'green', 'blue', 'orange', 'purple', 'green', 'blue', 'blue'],
      [null, 'blue', 'green', 'orange', 'orange', 'green', 'blue', 'purple', 'green', 'yellow', 'orange', 'blue', 'purple', null],
    ]
  },
  {
    id: 3,
    name: "Lvl 3: Mystic Woods",
    rowsCount: 10,
    targetScore: 2500,
    allowedAmmo: 60,
    timeLimitSec: 140,
    initialGrid: [
      ['blue', 'purple', 'green', 'yellow', 'orange', 'yellow', 'green', 'purple', 'orange', 'yellow', 'green', 'purple', 'blue', 'blue'],
      ['purple', 'green', 'yellow', 'orange', 'orange', 'yellow', 'green', 'blue', 'yellow', 'orange', 'green', 'purple', 'orange', 'orange'],
      ['green', 'yellow', 'orange', 'blue', 'blue', 'orange', 'yellow', 'green', 'blue', 'yellow', 'orange', 'purple', 'yellow', 'yellow'],
      ['yellow', 'orange', 'blue', 'purple', 'purple', 'blue', 'orange', 'yellow', 'purple', 'green', 'orange', 'blue', 'purple', 'purple'],
      ['orange', 'blue', 'purple', 'green', 'green', 'purple', 'blue', 'orange', 'yellow', 'purple', 'green', 'orange', 'yellow', 'yellow'],
      ['purple', 'orange', 'yellow', 'blue', 'blue', 'yellow', 'orange', 'purple', 'blue', 'orange', 'purple', 'green', 'blue', 'blue'],
      ['green', 'yellow', 'blue', 'purple', 'purple', 'blue', 'yellow', 'green', 'yellow', 'green', 'orange', 'blue', 'purple', 'purple'],
      ['yellow', 'blue', 'purple', 'green', 'green', 'purple', 'blue', 'yellow', 'purple', 'blue', 'green', 'yellow', 'orange', 'orange'],
      ['orange', 'purple', 'green', 'yellow', 'yellow', 'green', 'purple', 'orange', 'blue', 'green', 'orange', 'purple', 'yellow', 'yellow'],
      [null, 'orange', 'purple', 'green', 'green', 'purple', 'orange', 'blue', 'green', 'yellow', 'orange', 'blue', 'purple', null],
    ]
  }
];

const COLOR_THEME_LABELS: Record<BubbleColor, string> = {
  blue: 'Crystal',
  purple: 'Cosmic',
  green: 'Nature',
  yellow: 'Solar',
  orange: 'Flame'
};

const COLORS_HEX: Record<BubbleColor, string> = {
  blue: '#3B82F6',   // Bright blue
  purple: '#A855F7', // Deep purple
  green: '#22C55E',  // Vibrant green
  yellow: '#EAB308', // Amber yellow
  orange: '#F97316'  // Rich orange
};

export default function GameBoard({ onOpenTutorial, onOpenLinearAlgebra, onUpdateLinearAlgebra }: GameBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Core level and gameplay status
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const activeLevel = LEVELS[currentLevelIdx];

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('bubble_paws_valley_high_score');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      try {
        localStorage.setItem('bubble_paws_valley_high_score', score.toString());
      } catch (e) {
        // silent fail
      }
    }
  }, [score, highScore]);

  const [bubblesPopped, setBubblesPopped] = useState(0);
  const [ammoLeft, setAmmoLeft] = useState(activeLevel.allowedAmmo);
  const [timeLeft, setTimeLeft] = useState(activeLevel.timeLimitSec);
  const [lives, setLives] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'cooldown_fail' | 'gameover' | 'levelwin' | 'gamewin'>('start');

  // Next Bubble and Swap States
  const [activeBubbleColor, setActiveBubbleColor] = useState<BubbleColor>('blue');
  const [nextBubbleColor, setNextBubbleColor] = useState<BubbleColor>('purple');
  const [swapCooldown, setSwapCooldown] = useState(0); // 0 to 5 seconds
  const [activePowerUp, setActivePowerUp] = useState<'rainbow' | 'bomb' | 'vector_assist' | null>(null);

  // Power-up Inventory
  const [powerUps, setPowerUps] = useState({
    rainbow: 2,
    bomb: 2,
    vector_assist: 2
  });

  // Music state
  const [isMuted, setIsMuted] = useState(false);
  
  // Aiming Guide line toggle
  const [showAimGuide, setShowAimGuide] = useState(true);

  // Combo system
  const comboRef = useRef(0);
  const comboResetTimerRef = useRef<any>(null);
  const [currentComboCount, setCurrentComboCount] = useState(0);
  const [showComboIndicator, setShowComboIndicator] = useState(false);
  const [comboAnimKey, setComboAnimKey] = useState(0);

  // Linear Algebra reactive values
  const [vectorMath, setVectorMath] = useState({ ux: 0.0, uy: -1.0, angle: 90 });
  const lastMathUpdateRef = useRef(0);

  // Physics dynamic variables
  const gridRef = useRef<(Bubble | null)[][]>([]);
  const shootingBubbleRef = useRef<ShootingBubble | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const mousePosRef = useRef({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 });
  const isMouseDownRef = useRef(false);
  const screenShakeRef = useRef(0); // magnitude of screen shake
  // Academic Statistics state tracking
  const [shotsFired, setShotsFired] = useState(0);
  const [shotsHit, setShotsHit] = useState(0);
  const [bounceShots, setBounceShots] = useState(0);
  const [usedPowerUpInLevel, setUsedPowerUpInLevel] = useState(false);

  // Initialize sounds and music
  useEffect(() => {
    // Soft startup music or sound readiness
    return () => {
      AudioEngine.stopMusic();
    };
  }, []);

  // Sync Level specific ammunitions and timers on state reset
  const initLevel = (levelIdx: number) => {
    AudioEngine.currentLevelIdx = levelIdx;
    const config = LEVELS[levelIdx];
    setScore(0);
    setAmmoLeft(config.allowedAmmo);
    setTimeLeft(config.timeLimitSec);
    setSwapCooldown(0);
    setActivePowerUp(null);
    comboRef.current = 0;

    // Load Grid Matrix
    const rows = MAX_ROWS; // Maximum potential row grid
    const cols = MAX_COLS;
    const initialMatrix: (Bubble | null)[][] = [];

    for (let r = 0; r < rows; r++) {
      const rowArr: (Bubble | null)[] = [];
      const isConfigRow = r < config.initialGrid.length;
      for (let c = 0; c < cols; c++) {
        if (isConfigRow) {
          const colColor = config.initialGrid[r][c];
          if (colColor) {
            const coords = getBubbleCoords(r, c);
            
            // Dynamic Seeding of Obstacles based on levels
            let obs: 'stone' | 'ice' | 'chain' | undefined = undefined;
            if (levelIdx === 1) { // Level 2: Whispering Canyon
              if ((r === 1 || r === 2) && (c >= 3 && c <= 10)) {
                obs = 'ice'; // Frozen Bubble
              }
            } else if (levelIdx === 2) { // Level 3: Mystic Woods
              if (r === 1 && (c === 3 || c === 4 || c === 9 || c === 10)) {
                obs = 'chain'; // Chained Bubble
              } else if (r === 2 && (c === 5 || c === 6 || c === 7 || c === 8)) {
                obs = 'stone'; // solid breakable Stone Block
              }
            }

            rowArr.push({
              id: `${r}-${c}-${Math.random()}`,
              x: coords.x,
              y: coords.y,
              color: colColor,
              obstacle: obs
            });
          } else {
            rowArr.push(null);
          }
        } else {
          rowArr.push(null);
        }
      }
      initialMatrix.push(rowArr);
    }

    gridRef.current = initialMatrix;
    generateNextBubbles();
    particlesRef.current = [];
    floatingTextsRef.current = [];
    setShotsFired(0);
    setShotsHit(0);
    setBounceShots(0);
    setUsedPowerUpInLevel(false);
  };

  const generateNextBubbles = () => {
    const colors: BubbleColor[] = ['blue', 'purple', 'green', 'yellow', 'orange'];
    const active = colors[Math.floor(Math.random() * colors.length)];
    const next = colors[Math.floor(Math.random() * colors.length)];
    setActiveBubbleColor(active);
    setNextBubbleColor(next);
  };

  // Run initial state setup
  useEffect(() => {
    initLevel(currentLevelIdx);
  }, [currentLevelIdx]);

  // Game timer loop
  useEffect(() => {
    if (gameState !== 'playing' || isPaused) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Timer finished check
          handleLifeLost();
          return activeLevel.timeLimitSec;
        }
        return prev - 1;
      });

      // Swap Cooldown decrement
      setSwapCooldown((prev) => (prev > 0 ? Math.max(0, prev - 1) : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, isPaused, currentLevelIdx]);

  const handleLifeLost = () => {
    AudioEngine.playExplosion();
    setLives((prev) => {
      const nextLives = prev - 1;
      if (nextLives <= 0) {
        setGameState('gameover');
      } else {
        // restart current level
        setGameState('cooldown_fail');
        setTimeout(() => {
          initLevel(currentLevelIdx);
          setGameState('playing');
        }, 2200);
      }
      return nextLives;
    });
  };

  // Convert row, col grid indexing to exact math cartesian coordinates (offset and packed hexagonal)
  const getBubbleCoords = (r: number, c: number) => {
    const isOdd = r % 2 === 1;
    // Row separation is D * sin(60 deg) = D * 0.866
    const rowHeight = BUBBLE_DIAMETER * 0.866;
    const x = c * BUBBLE_DIAMETER + BUBBLE_RADIUS + (isOdd ? BUBBLE_RADIUS : 0) + OFFSET_X;
    const y = r * rowHeight + BUBBLE_RADIUS + OFFSET_Y;
    return { x, y };
  };

  // Check closest cell in grid to anchor landing bubbles
  const getClosestGridCell = (x: number, y: number): GridPos | null => {
    let closestDist = Infinity;
    let closestCell: GridPos | null = null;

    for (let r = 0; r < MAX_ROWS; r++) {
      for (let c = 0; c < MAX_COLS; c++) {
        // Prevent indexing error
        const cellCoords = getBubbleCoords(r, c);
        const dist = Math.sqrt(Math.pow(x - cellCoords.x, 2) + Math.pow(y - cellCoords.y, 2));
        if (dist < closestDist) {
          closestDist = dist;
          closestCell = { row: r, col: c };
        }
      }
    }
    return closestCell;
  };

  // Sound toggler
  const handleMuteBtn = () => {
    const mute = AudioEngine.toggleMute();
    setIsMuted(mute);
  };

  // Launcher mouse calculation
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    mousePosRef.current = { x: mx, y: my };

    const now = Date.now();
    if (now - lastMathUpdateRef.current > 40) {
      lastMathUpdateRef.current = now;
      const launcherX = CANVAS_WIDTH / 2;
      const launcherY = CANVAS_HEIGHT - 50; // Lowered launcher position

      const dx = mx - launcherX;
      const dy = my - launcherY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 0) {
        const ux = dx / distance;
        const uy = dy / distance;
        // Angle relative to horizontal ground coordinate
        let angle = Math.round(Math.abs(Math.atan2(uy, ux) * 180 / Math.PI));
        setVectorMath({ ux, uy, angle });
        
        // Push actual real-time state metrics straight upstream to the math modal
        onUpdateLinearAlgebra?.(angle, ux, uy, gridRef.current);
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isMouseDownRef.current = true;
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isMouseDownRef.current = false;
    if (gameState !== 'playing' || isPaused) return;
    if (shootingBubbleRef.current) return; // one bullet on screen at a time

    triggerShootBubble();
  };

  // Shoot trigger
  const triggerShootBubble = () => {
    // Find direction from launcher center to mouse
    const launcherX = CANVAS_WIDTH / 2;
    const launcherY = CANVAS_HEIGHT - 50; // Lowered launcher position

    const dx = mousePosRef.current.x - launcherX;
    const dy = mousePosRef.current.y - launcherY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return;

    // Arah Tembakan (Vektor Satuan)
    const vx = (dx / distance) * 11; // Speed 11
    const vy = (dy / distance) * 11;

    // Do not shoot downwards
    if (vy > -1) return;

    AudioEngine.playShoot();

    // Increment shots fired for academic statistics
    setShotsFired((prev) => prev + 1);

    // Create current bullet
    shootingBubbleRef.current = {
      x: launcherX,
      y: launcherY,
      vx,
      vy,
      color: activeBubbleColor,
      isPowerUp: activePowerUp || undefined,
      radius: BUBBLE_RADIUS,
      bounces: 0
    };

    // Ammo deduct
    setAmmoLeft((prev) => {
      const nextAmmo = prev - 1;
      if (nextAmmo <= 0 && gameState === 'playing' && !shootingBubbleRef.current) {
        // check win status, managed after check
      }
      return nextAmmo;
    });

    // Reset Power-up Selection
    setActivePowerUp(null);

    // Swap Next Bubble setup
    const colors: BubbleColor[] = ['blue', 'purple', 'green', 'yellow', 'orange'];
    setActiveBubbleColor(nextBubbleColor);
    setNextBubbleColor(colors[Math.floor(Math.random() * colors.length)]);
  };

  // Use Power up item
  const usePowerUpItem = (type: 'rainbow' | 'bomb' | 'vector_assist') => {
    if (gameState !== 'playing' || isPaused) return;
    if (powerUps[type] <= 0) return;

    setUsedPowerUpInLevel(true);

    if (type === 'vector_assist') {
      setActivePowerUp('vector_assist');
      setPowerUps((prev) => ({ ...prev, vector_assist: prev.vector_assist - 1 }));
      AudioEngine.playLaser();
      createParticlesBurst(CANVAS_WIDTH / 2, CANVAS_HEIGHT - 60, '#22C55E', 25);
      addFloatingText("VECTOR ASSIST READY! 📐", CANVAS_WIDTH / 2, CANVAS_HEIGHT - 60, '#22C55E');
      return;
    }

    // Set active item for next bullet
    setActivePowerUp(type);
    setPowerUps(prev => ({ ...prev, [type]: prev[type] - 1 }));
  };

  // Swap current shooting bubble with preview
  const swapBubbles = () => {
    if (gameState !== 'playing' || isPaused) return;
    if (swapCooldown > 0) return;

    AudioEngine.playSwap();
    const temp = activeBubbleColor;
    setActiveBubbleColor(nextBubbleColor);
    setNextBubbleColor(temp);

    // Trigger cool down
    setSwapCooldown(5);
  };

  // Connected BFS matching component (finding cluster of same color)
  const getNeighbors = (r: number, c: number): GridPos[] => {
    const neighbors: GridPos[] = [];
    const isOdd = r % 2 === 1;

    // Hexagonal neighbor offsets
    const offsets = isOdd
      ? [
          { r: -1, c: 0 }, { r: -1, c: 1 },
          { r: 0, c: -1 }, { r: 0, c: 1 },
          { r: 1, c: 0 }, { r: 1, c: 1 }
        ]
      : [
          { r: -1, c: -1 }, { r: -1, c: 0 },
          { r: 0, c: -1 }, { r: 0, c: 1 },
          { r: 1, c: -1 }, { r: 1, c: 0 }
        ];

    for (const offset of offsets) {
      const nr = r + offset.r;
      const nc = c + offset.c;
      if (nr >= 0 && nr < MAX_ROWS && nc >= 0 && nc < MAX_COLS) {
        neighbors.push({ row: nr, col: nc });
      }
    }
    return neighbors;
  };

  // Find same color matching cluster
  const findCluster = (startRow: number, startCol: number, matchColor: BubbleColor): GridPos[] => {
    const queue: GridPos[] = [{ row: startRow, col: startCol }];
    const visited = new Set<string>();
    visited.add(`${startRow}-${startCol}`);
    const cluster: GridPos[] = [];

    while (queue.length > 0) {
      const current = queue.shift()!;
      cluster.push(current);

      const neighbors = getNeighbors(current.row, current.col);
      for (const neighbor of neighbors) {
        const neighborBubble = gridRef.current[neighbor.row][neighbor.col];
        if (
          neighborBubble && 
          neighborBubble.color === matchColor && 
          !neighborBubble.isPopping &&
          neighborBubble.obstacle !== 'stone' && // Stones never match by colors
          !visited.has(`${neighbor.row}-${neighbor.col}`)
        ) {
          visited.add(`${neighbor.row}-${neighbor.col}`);
          queue.push(neighbor);
        }
      }
    }
    return cluster;
  };

  // Drop floating bubble calculations (Breadth First Search check from root Row 0)
  const dropFloatingBubbles = (): number => {
    const rootConnected = new Set<string>();
    const queue: GridPos[] = [];

    // All active elements in row 0 are roots
    for (let c = 0; c < MAX_COLS; c++) {
      const b = gridRef.current[0][c];
      if (b && !b.isPopping) {
        rootConnected.add(`0-${c}`);
        queue.push({ row: 0, col: c });
      }
    }

    while (queue.length > 0) {
      const current = queue.shift()!;
      const neighbors = getNeighbors(current.row, current.col);
      for (const neighbor of neighbors) {
        const key = `${neighbor.row}-${neighbor.col}`;
        const neighborBubble = gridRef.current[neighbor.row][neighbor.col];
        if (neighborBubble && !neighborBubble.isPopping && !rootConnected.has(key)) {
          rootConnected.add(key);
          queue.push(neighbor);
        }
      }
    }

    let dropCount = 0;
    // Rontokkan all elements that is disconnected from row 0
    for (let r = 0; r < MAX_ROWS; r++) {
      for (let c = 0; c < MAX_COLS; c++) {
        const b = gridRef.current[r][c];
        if (b && !b.isPopping && !rootConnected.has(`${r}-${c}`)) {
          // Play falling animation / create particle float text
          createParticlesBurst(b.x, b.y, COLORS_HEX[b.color], 8);
          gridRef.current[r][c] = null; // Removed from board
          dropCount++;
        }
      }
    }

    return dropCount;
  };

  const executeBombPowerUp = (midRow: number, midCol: number) => {
    let hits = 0;

    // Pop all cells within Chebyshev radius of 1 or 2
    for (let r = Math.max(0, midRow - 2); r <= Math.min(MAX_ROWS - 1, midRow + 2); r++) {
      for (let c = Math.max(0, midCol - 2); c <= Math.min(MAX_COLS - 1, midCol + 2); c++) {
        const b = gridRef.current[r][c];
        if (b) {
          if (b.obstacle === 'stone') {
            const currentHealth = b.stoneHealth ?? 2;
            const newHealth = currentHealth - 1;
            b.stoneHealth = newHealth;
            if (newHealth <= 0) {
              createParticlesBurst(b.x, b.y, '#9E9E9E', 22);
              gridRef.current[r][c] = null;
              hits++;
            } else {
              createParticlesBurst(b.x, b.y, '#E0E0E0', 10);
            }
          } else {
            createParticlesBurst(b.x, b.y, COLORS_HEX[b.color] || '#3B82F6', 20);
            gridRef.current[r][c] = null;
            hits++;
          }
        }
      }
    }
    screenShakeRef.current = 15; // heavy shake screen
    AudioEngine.playExplosion();
    return hits;
  };

  // Check board empty condition
  const checkWinCondition = () => {
    let count = 0;
    for (let r = 0; r < MAX_ROWS; r++) {
      for (let c = 0; c < MAX_COLS; c++) {
        if (gridRef.current[r][c] !== null) {
          count++;
        }
      }
    }

    if (count === 0) {
      // WIN ALL BUBBLES CLEARED!
      if (currentLevelIdx < LEVELS.length - 1) {
        setGameState('levelwin');
      } else {
        setGameState('gamewin');
      }
      AudioEngine.playCombo(6);
    } else if (ammoLeft <= 0 && !shootingBubbleRef.current) {
      // Ran out of ammo!
      handleLifeLost();
    }
  };

  // Particle explosion burst creator
  const createParticlesBurst = (x: number, y: number, color: string, count = 12) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 4;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        alpha: 1,
        size: 2 + Math.random() * 4,
        life: 25 + Math.random() * 20
      });
    }
  };

  const addFloatingText = (text: string, x: number, y: number, color = '#F9A825') => {
    floatingTextsRef.current.push({
      id: `${Math.random()}`,
      text,
      x,
      y,
      color,
      alpha: 1,
      scale: 1,
      life: 50
    });
  };

  // Loop processing physics tick by tick on animation frames
  useEffect(() => {
    let animFrameId: number;

    const updatePhysics = () => {
      // Screen shake reduction
      if (screenShakeRef.current > 0) {
        screenShakeRef.current *= 0.9;
        if (screenShakeRef.current < 0.5) screenShakeRef.current = 0;
      }

      // Check shooting bubble motion
      const bullet = shootingBubbleRef.current;
      if (bullet) {
        bullet.x += bullet.vx;
        bullet.y += bullet.vy;

        // Wall reflection bounce check
        if (bullet.x - BUBBLE_RADIUS <= OFFSET_X) {
          bullet.x = OFFSET_X + BUBBLE_RADIUS;
          bullet.vx = -bullet.vx;
          bullet.bounces = (bullet.bounces || 0) + 1;
          AudioEngine.playWallBounce();
        } else if (bullet.x + BUBBLE_RADIUS >= CANVAS_WIDTH - OFFSET_X) {
          bullet.x = CANVAS_WIDTH - OFFSET_X - BUBBLE_RADIUS;
          bullet.vx = -bullet.vx;
          bullet.bounces = (bullet.bounces || 0) + 1;
          AudioEngine.playWallBounce();
        }

        // Screen top ceiling anchor check
        if (bullet.y - BUBBLE_RADIUS <= OFFSET_Y) {
          // Snap bullet directly to row 0
          const snapCell = getClosestGridCell(bullet.x, OFFSET_Y + BUBBLE_RADIUS);
          if (snapCell) {
            anchorBubbleToGrid(snapCell.row, snapCell.col, bullet);
          } else {
            anchorBubbleToGrid(0, 4, bullet);
          }
          shootingBubbleRef.current = null;
        } else {
          // Check collision with existing bubbles at board
          let collided = false;
          let snapRow = -1;
          let snapCol = -1;

          for (let r = 0; r < MAX_ROWS; r++) {
            for (let c = 0; c < MAX_COLS; c++) {
              const staticBubble = gridRef.current[r][c];
              if (staticBubble && !staticBubble.isPopping) {
                const distX = bullet.x - staticBubble.x;
                const distY = bullet.y - staticBubble.y;
                const distance = Math.sqrt(distX * distX + distY * distY);

                // Check distance within 2 radii with small collision padding buffer
                if (distance <= BUBBLE_DIAMETER - 2) {
                  collided = true;
                  break;
                }
              }
            }
            if (collided) break;
          }

          if (collided) {
            // Find closest empty neighbor
            const targetCell = getClosestGridCell(bullet.x, bullet.y);
            if (targetCell) {
              anchorBubbleToGrid(targetCell.row, targetCell.col, bullet);
            }
            shootingBubbleRef.current = null;
          }
        }
      }

      // Update particles
      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08; // subtle gravities
        p.alpha -= 1 / p.life;
        p.life--;
      });
      particlesRef.current = particlesRef.current.filter((p) => p.life > 0 && p.alpha > 0);

      // Update Floating texts
      floatingTextsRef.current.forEach((ft) => {
        ft.y -= 0.6; // rise up
        ft.life--;
        ft.alpha = ft.life / 50;
      });
      floatingTextsRef.current = floatingTextsRef.current.filter((ft) => ft.life > 0);
    };

    const anchorBubbleToGrid = (row: number, col: number, bul: ShootingBubble) => {
      // Anchors bubble to matrix
      const coords = getBubbleCoords(row, col);
      const newBubble: Bubble = {
        id: `${row}-${col}-${Math.random()}`,
        x: coords.x,
        y: coords.y,
        color: bul.color,
        isPowerUp: bul.isPowerUp || undefined
      };

      gridRef.current[row][col] = newBubble;

      // Check powerups

      if (bul.isPowerUp === 'bomb') {
        const destroyed = executeBombPowerUp(row, col);
        const poppedScore = destroyed * 10;
        setScore((prev) => prev + poppedScore);
        addFloatingText(`BOMB CRASH: +${poppedScore}`, bul.x, bul.y - 10, '#F97316');
        dropFloatingBubbles();
        checkWinCondition();
        return;
      }

      // Check normal matches or Rainbow matchups
      const clColor = bul.isPowerUp === 'rainbow' ? findAdjacentPrimaryColor(row, col) || bul.color : bul.color;
      const matchedCluster = findCluster(row, col, clColor);

      if (matchedCluster.length >= 3) {
        // Pop!
        // Audio pop
        AudioEngine.playPop(1.0 + (comboRef.current * 0.15));

        // Combo system counting!
        comboRef.current += 1;
        
        let multiplier = 1.0;
        let comboName = "EXCELLENT!";
        if (comboRef.current === 2) { multiplier = 1.2; comboName = "GOOD COMBO! x2"; }
        if (comboRef.current === 3) { multiplier = 1.4; comboName = "AMAZING COMBO! x3"; }
        if (comboRef.current >= 4) { multiplier = 1.6; comboName = "UNSTOPPABLE COMBO! x4"; }

        // Update React Combo states immediately
        setCurrentComboCount(comboRef.current);
        setShowComboIndicator(true);
        setComboAnimKey((prev) => prev + 1);

        // Scale scores
        // 3 bubbles = 30 points, 4 bubbles = 50 points, 5 bubbles = 80 points (plus more if larger cluster)
        let baseScore = 30;
        if (matchedCluster.length === 4) baseScore = 50;
        if (matchedCluster.length >= 5) baseScore = 80 + (matchedCluster.length - 5) * 15;

        // Linear algebra wall reflections (bounce) multiplier bonus (+50% per wall bounce)
        const bouncesCount = bul.bounces || 0;
        const reflectionMultiplier = 1.0 + (bouncesCount * 0.5);
        const totalEarned = Math.round(baseScore * multiplier * reflectionMultiplier);
        setScore((prev) => prev + totalEarned);

        // Track academic stats
        setShotsHit((prev) => prev + 1);
        if (bouncesCount > 0) {
          setBounceShots((prev) => prev + bouncesCount);
        }

        // Sound chime chord for combo triggers or bounce triggers
        if (bouncesCount > 0) {
          AudioEngine.playCombo(bouncesCount + 3);
        } else if (comboRef.current >= 2) {
          AudioEngine.playCombo(comboRef.current);
        }

        // Show combo and bounce alerts
        addFloatingText(comboName, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40, '#F9A825');
        if (bouncesCount > 0) {
          addFloatingText(`Vector Bounce x${reflectionMultiplier.toFixed(1)}!`, bul.x, bul.y - 32, '#FFD54F');
          addFloatingText(`+${totalEarned} Pts (Bonus Bounce!)`, bul.x, bul.y - 12, '#F5824C');
        } else {
          addFloatingText(`+${totalEarned} Points`, bul.x, bul.y - 12, '#22C55E');
        }

        // trigger pops for matched color cluster
        matchedCluster.forEach((cell) => {
          const b = gridRef.current[cell.row][cell.col];
          if (b) {
            createParticlesBurst(b.x, b.y, COLORS_HEX[b.color], 15);
            gridRef.current[cell.row][cell.col] = null;
          }
        });

        // Detonate adjacent obstacles (ice cracks, chains break, rocks disintegrate)
        const clusterNeighbors = new Set<string>();
        matchedCluster.forEach((cell) => {
          const neighbors = getNeighbors(cell.row, cell.col);
          neighbors.forEach((n) => {
            clusterNeighbors.add(`${n.row}-${n.col}`);
          });
        });

        clusterNeighbors.forEach((key) => {
          const [nrStr, ncStr] = key.split('-');
          const nr = parseInt(nrStr);
          const nc = parseInt(ncStr);
          const b = gridRef.current[nr]?.[nc];
          if (b && !b.isPopping) {
            if (b.obstacle === 'stone') {
              // Destroy solid stone block
              createParticlesBurst(b.x, b.y, '#9E9E9E', 22);
              addFloatingText("STONE POPPED +50", b.x, b.y - 12, '#EEEEEE');
              gridRef.current[nr][nc] = null;
              setScore((prev) => prev + 50);
              AudioEngine.playExplosion();
            } else if (b.obstacle === 'ice') {
              // Melt ice surrounding the bubble
              b.obstacle = undefined;
              createParticlesBurst(b.x, b.y, '#E0F7FA', 16);
              addFloatingText("ICE CRACKED! +20", b.x, b.y, '#00E5FF');
              setScore((prev) => prev + 20);
              AudioEngine.playFreeze();
            } else if (b.obstacle === 'chain') {
              // Unlock chain locked bubble
              b.obstacle = undefined;
              createParticlesBurst(b.x, b.y, '#D7CCC8', 16);
              addFloatingText("CHAIN UNLOCKED! +20", b.x, b.y, '#FFE082');
              setScore((prev) => prev + 20);
              AudioEngine.playSwap();
            }
          }
        });

        // Trigger rontok (drop unattached floating bubbles)
        const dropped = dropFloatingBubbles();
        if (dropped > 0) {
          const extraScores = dropped * 15;
          setScore((prev) => prev + extraScores);
          addFloatingText(`Rontok Runtun: +${extraScores}`, bul.x, bul.y + 15, '#F97316');
        }

        // reset combo triggers lazily
        if (comboResetTimerRef.current) clearTimeout(comboResetTimerRef.current);
        comboResetTimerRef.current = setTimeout(() => {
          comboRef.current = 0;
          setShowComboIndicator(false);
          setCurrentComboCount(0);
        }, 4000); // 4 sec retention window

      } else {
        // Match less than 3, combo broken
        comboRef.current = 0;
        setShowComboIndicator(false);
        setCurrentComboCount(0);
      }

      // Check bottom boundary Game Over triggers
      if (checkReachedBottomLimit()) {
        handleLifeLost();
      }

      checkWinCondition();
    };

    const findAdjacentPrimaryColor = (row: number, col: number): BubbleColor | null => {
      const neighbors = getNeighbors(row, col);
      for (const n of neighbors) {
        const b = gridRef.current[n.row][n.col];
        if (b) return b.color;
      }
      return null;
    };

    const checkReachedBottomLimit = (): boolean => {
      // Bottom line coordinate is at index DEATH_ROW_INDEX
      for (let c = 0; c < MAX_COLS; c++) {
        if (gridRef.current[DEATH_ROW_INDEX][c] !== null) {
          return true;
        }
      }
      return false;
    };

    // Render logic to standard canvas framework
    const drawCanvas = () => {
      if (!canvasRef.current) return;
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      // Clear layout
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Support Screen Shake effect
      ctx.save();
      if (screenShakeRef.current > 0) {
        const rx = (Math.random() - 0.5) * screenShakeRef.current;
        const ry = (Math.random() - 0.5) * screenShakeRef.current;
        ctx.translate(rx, ry);
      }

      // DRAW ARENA BOUNDARIES & WOODEN WALL PILLARS (Beautiful Solid Arcades Frame)
      ctx.save();

      // Left Solid Wood Pillar
      const leftColGrad = ctx.createLinearGradient(0, 0, OFFSET_X, 0);
      leftColGrad.addColorStop(0, '#21100B'); // Deep rustic dark brown shadow
      leftColGrad.addColorStop(0.35, '#3E2723'); // Rich cocoa wood
      leftColGrad.addColorStop(0.75, '#5D4037'); // Warm accent woodgrain
      leftColGrad.addColorStop(1, '#2E1B15'); // Dark side groove
      ctx.fillStyle = leftColGrad;
      ctx.fillRect(0, 0, OFFSET_X, CANVAS_HEIGHT);

      // Sleek gloss inner highlight line for 3D wood bevel
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(OFFSET_X / 2, 0);
      ctx.lineTo(OFFSET_X / 2, CANVAS_HEIGHT);
      ctx.stroke();

      // Sleek, neat golden boundary line separating play zone and left margin
      ctx.strokeStyle = '#FFD54F';
      ctx.lineWidth = 4;
      ctx.shadowColor = 'rgba(255, 213, 79, 0.7)';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(OFFSET_X, 0);
      ctx.lineTo(OFFSET_X, CANVAS_HEIGHT);
      ctx.stroke();

      // Right Solid Wood Pillar
      const rightColGrad = ctx.createLinearGradient(CANVAS_WIDTH - OFFSET_X, 0, CANVAS_WIDTH, 0);
      rightColGrad.addColorStop(0, '#2E1B15'); // Dark side groove
      rightColGrad.addColorStop(0.25, '#5D4037'); // Warm accent woodgrain
      rightColGrad.addColorStop(0.65, '#3E2723'); // Rich cocoa wood
      rightColGrad.addColorStop(1, '#21100B'); // Deep rustic dark brown shadow
      ctx.fillStyle = rightColGrad;
      ctx.fillRect(CANVAS_WIDTH - OFFSET_X, 0, OFFSET_X, CANVAS_HEIGHT);

      // Sleek gloss inner highlight
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(CANVAS_WIDTH - OFFSET_X / 2, 0);
      ctx.lineTo(CANVAS_WIDTH - OFFSET_X / 2, CANVAS_HEIGHT);
      ctx.stroke();

      // Sleek, neat golden boundary line separating play zone and right margin
      ctx.strokeStyle = '#FFD54F';
      ctx.lineWidth = 4;
      ctx.shadowColor = 'rgba(255, 213, 79, 0.7)';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(CANVAS_WIDTH - OFFSET_X, 0);
      ctx.lineTo(CANVAS_WIDTH - OFFSET_X, CANVAS_HEIGHT);
      ctx.stroke();

      // Top wood ceiling beam - solid and connecting left and right pillars cleanly
      const ceilGrad = ctx.createLinearGradient(OFFSET_X, 0, OFFSET_X, OFFSET_Y);
      ceilGrad.addColorStop(0, '#1E0E0A');
      ceilGrad.addColorStop(0.5, '#4E342E');
      ceilGrad.addColorStop(1, '#2E1B15');
      ctx.fillStyle = ceilGrad;
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.fillRect(OFFSET_X, 0, CANVAS_WIDTH - 2 * OFFSET_X, OFFSET_Y);

      // Gold ceiling line
      ctx.strokeStyle = '#FFD54F';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(OFFSET_X, OFFSET_Y);
      ctx.lineTo(CANVAS_WIDTH - OFFSET_X, OFFSET_Y);
      ctx.stroke();

      ctx.restore();

      // Horizontal WARNING Limit line
      const warningRowHeight = BUBBLE_DIAMETER * 0.866;
      const warningY = DEATH_ROW_INDEX * warningRowHeight + BUBBLE_RADIUS + OFFSET_Y;
      ctx.setLineDash([6, 6]); // beautiful dashed line
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.45)'; // soft transparent red only for low warnings
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(OFFSET_X, warningY);
      ctx.lineTo(CANVAS_WIDTH - OFFSET_X, warningY);
      ctx.stroke();
      ctx.setLineDash([]); // clear dash

      // Render Static Grid Bubbles
      for (let r = 0; r < MAX_ROWS; r++) {
        for (let c = 0; c < MAX_COLS; c++) {
          const b = gridRef.current[r][c];
          if (b) {
            drawBubbleShape(ctx, b.x, b.y, b.color, b.isPowerUp, b.obstacle, b.stoneHealth);
          }
        }
      }

      // Target HUD guideline vector pointing from launcher
      if (gameState === 'playing' && !isPaused && !shootingBubbleRef.current && showAimGuide) {
        const launcherX = CANVAS_WIDTH / 2;
        const launcherY = CANVAS_HEIGHT - 50;

        const dx = mousePosRef.current.x - launcherX;
        const dy = mousePosRef.current.y - launcherY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 10 && dy < -5) {
          const uX = dx / distance;
          const uY = dy / distance;
          const angle = Math.round(Math.abs(Math.atan2(uY, uX) * 180 / Math.PI));

          // Draw highly integrated vector math HUD overlay directly on board!
          ctx.save();
          // Draw a small scientific metadata badge on the canvas
          ctx.fillStyle = 'rgba(46, 125, 50, 0.15)';
          ctx.strokeStyle = '#2E7D32';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(launcherX - 90, launcherY - 95, 180, 26, 6);
          ctx.fill();
          ctx.stroke();

          ctx.font = 'bold 10px "JetBrains Mono", monospace';
          ctx.fillStyle = '#1B5E20';
          ctx.textAlign = 'center';
          ctx.shadowColor = 'transparent';
          ctx.fillText(`θ: ${angle}° | û: [${uX.toFixed(3)}, ${uY.toFixed(3)}]`, launcherX, launcherY - 78);
          ctx.restore();

          // TRAJECTORY TRACE CALCULATIONS
          // Let's trace steps of size 5px
          let traceX = launcherX;
          let traceY = launcherY;
          let traceVX = uX * 6;
          let traceVY = uY * 6;
          let bounced = false;
          let bouncePointX = 0;
          let bouncePointY = 0;
          let collisionDetected = false;
          let snapCell: GridPos | null = null;

          const tracePoints: { x: number; y: number; isBounced: boolean }[] = [];

          const maxSteps = activePowerUp === 'vector_assist' ? 140 : 80;

          // Trace to find landing point
          for (let step = 0; step < maxSteps; step++) {
            traceX += traceVX;
            traceY += traceVY;

            // Wall bounce constraints
            if (traceX - BUBBLE_RADIUS <= OFFSET_X) {
              traceX = OFFSET_X + BUBBLE_RADIUS;
              traceVX = -traceVX;
              bounced = true;
              bouncePointX = traceX;
              bouncePointY = traceY;
            } else if (traceX + BUBBLE_RADIUS >= CANVAS_WIDTH - OFFSET_X) {
              traceX = CANVAS_WIDTH - OFFSET_X - BUBBLE_RADIUS;
              traceVX = -traceVX;
              bounced = true;
              bouncePointX = traceX;
              bouncePointY = traceY;
            }

            // Top boundary of the arena
            if (traceY - BUBBLE_RADIUS <= OFFSET_Y) {
              traceY = OFFSET_Y + BUBBLE_RADIUS;
              collisionDetected = true;
              snapCell = getClosestGridCell(traceX, traceY);
              break;
            }

            // Check collision with any existing non-null bubble in the grid
            let hitBubble = false;
            for (let r = 0; r < MAX_ROWS; r++) {
              for (let c = 0; c < MAX_COLS; c++) {
                const b = gridRef.current[r]?.[c];
                if (b) {
                  const dist = Math.sqrt(Math.pow(traceX - b.x, 2) + Math.pow(traceY - b.y, 2));
                  if (dist <= BUBBLE_DIAMETER - 2) {
                    hitBubble = true;
                    break;
                  }
                }
              }
              if (hitBubble) break;
            }

            if (hitBubble) {
              collisionDetected = true;
              const prevX = traceX - traceVX;
              const prevY = traceY - traceVY;
              snapCell = getClosestGridCell(prevX, prevY);
              break;
            }

            tracePoints.push({ x: traceX, y: traceY, isBounced: bounced });
          }

          // DRAW THE TRAJECTORY
          tracePoints.forEach((pt, i) => {
            // Dotted pattern spacing
            if (i % 3 !== 0) return;

            ctx.beginPath();
            ctx.arc(pt.x, pt.y, activePowerUp === 'vector_assist' ? 3.5 : 2.5, 0, Math.PI * 2);

            if (pt.isBounced) {
              // Different visual language for bounced segment (orange / flame)
              ctx.fillStyle = '#E65100';
            } else {
              // Standard segment (gold)
              ctx.fillStyle = '#F9A825';
            }
            ctx.fill();
          });

          // Draw Wall Normal Vectors at bounce spot under Vector Assist
          if (activePowerUp === 'vector_assist' && bounced && bouncePointX > 0) {
            ctx.save();
            ctx.strokeStyle = '#D50000';
            ctx.lineWidth = 2;
            const normalDir = bouncePointX < CANVAS_WIDTH / 2 ? 1 : -1;
            
            // Draw normal line
            ctx.beginPath();
            ctx.moveTo(bouncePointX, bouncePointY);
            ctx.lineTo(bouncePointX + normalDir * 35, bouncePointY);
            ctx.stroke();

            // Arrow head
            ctx.beginPath();
            ctx.moveTo(bouncePointX + normalDir * 35, bouncePointY);
            ctx.lineTo(bouncePointX + normalDir * 28, bouncePointY - 4);
            ctx.lineTo(bouncePointX + normalDir * 28, bouncePointY + 4);
            ctx.fillStyle = '#D50000';
            ctx.fill();

            // Draw label
            ctx.font = 'bold 8px "JetBrains Mono", monospace';
            ctx.fillStyle = '#D50000';
            ctx.fillText(
              `n̂ = [${normalDir}, 0]`, 
              bouncePointX + normalDir * 15, 
              bouncePointY - 6
            );
            ctx.restore();
          }

          // GHOST CANDIDATE BLEND PREVIEW UNDER VECTOR ASSIST
          if (activePowerUp === 'vector_assist' && snapCell) {
            const snapCoords = getBubbleCoords(snapCell.row, snapCell.col);
            
            ctx.save();
            ctx.globalAlpha = 0.45;
            drawBubbleShape(
              ctx, 
              snapCoords.x, 
              snapCoords.y, 
              activeBubbleColor, 
              undefined, 
              undefined
            );
            ctx.restore();

            // Target crosshair rings
            ctx.strokeStyle = '#22C55E';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(snapCoords.x, snapCoords.y, BUBBLE_RADIUS + 4, 0, Math.PI * 2);
            ctx.setLineDash([4, 3]);
            ctx.stroke();
          }
        }
      }

      // Render Active Bullet in Motion
      const bullet = shootingBubbleRef.current;
      if (bullet) {
        drawBubbleShape(ctx, bullet.x, bullet.y, bullet.color, bullet.isPowerUp, bullet.obstacle, bullet.stoneHealth);
      }

      // Render Particles Explosion bursts
      particlesRef.current.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Render Floating scoring indicators
      floatingTextsRef.current.forEach((ft) => {
        ctx.save();
        ctx.globalAlpha = ft.alpha;
        ctx.fillStyle = ft.color;
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      });

      ctx.restore(); // screen shake restore
    };

    // Draw single Bubble shape with custom soft 3D shading & obstacle overlays
    const drawBubbleShape = (
      ctx: CanvasRenderingContext2D, 
      x: number, 
      y: number, 
      color: BubbleColor, 
      powerUpType?: 'rainbow' | 'bomb' | 'vector_assist',
      obstacleType?: 'stone' | 'ice' | 'chain',
      stoneHealth?: number
    ) => {
      ctx.save();

      // RENDER STONE OBSTACLE (Grey textured breakable boulder)
      if (obstacleType === 'stone') {
        const hex = '#757575'; // soft granite charcoal
        ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 3;

        ctx.strokeStyle = '#424242';
        ctx.lineWidth = 2.5;

        // Base circle
        ctx.beginPath();
        ctx.arc(x, y, BUBBLE_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = hex;
        ctx.fill();
        ctx.stroke();

        // 3D rock texture bevel shading
        const rockGrad = ctx.createRadialGradient(x - 5, y - 5, 2, x, y, BUBBLE_RADIUS);
        rockGrad.addColorStop(0, '#9E9E9E');
        rockGrad.addColorStop(0.7, '#616161');
        rockGrad.addColorStop(1, '#212121');
        
        ctx.shadowColor = 'transparent'; // clear shadows for overlays
        ctx.beginPath();
        ctx.arc(x, y, BUBBLE_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = rockGrad;
        ctx.fill();

        // Cracked lines on the stone for nice tactile detail of breakable object
        if (stoneHealth === 1) {
          ctx.strokeStyle = '#111111';
          ctx.lineWidth = 2.6; // Heavy visible fracture
          ctx.beginPath();
          ctx.moveTo(x - 12, y - 8);
          ctx.lineTo(x - 2, y + 2);
          ctx.lineTo(x + 10, y - 4);
          ctx.moveTo(x - 4, y + 10);
          ctx.lineTo(x + 4, y - 2);
          ctx.moveTo(x - 10, y + 6);
          ctx.lineTo(x + 8, y + 8);
          ctx.stroke();
        } else {
          // Undamaged standard cracks
          ctx.strokeStyle = '#212121';
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          ctx.moveTo(x - 10, y - 6);
          ctx.lineTo(x - 2, y + 1);
          ctx.lineTo(x + 8, y - 4);
          ctx.stroke();
        }

        ctx.restore();
        return;
      }

      const hex = COLORS_HEX[color] || '#3B82F6';

      // Glossy high-contrast shadows underneath bubbles for absolute separation
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 4;

      // Clean white borders
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.4;

      // Base bubble circle fill
      ctx.beginPath();
      ctx.arc(x, y, BUBBLE_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = hex;
      ctx.fill();
      ctx.stroke();

      // Ultra-shiny glass radial glow overlay
      const grad = ctx.createRadialGradient(
        x - BUBBLE_RADIUS / 2.5, 
        y - BUBBLE_RADIUS / 2.5, 
        1, 
        x, 
        y, 
        BUBBLE_RADIUS
      );
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.82)');   // spectacular high-gloss core focus
      grad.addColorStop(0.35, 'rgba(255, 255, 255, 0.32)'); // glossy ring gradient
      grad.addColorStop(0.8, 'rgba(255, 255, 255, 0.05)');  
      grad.addColorStop(1, 'rgba(0, 0, 0, 0.25)');          // deep contrast edge

      ctx.shadowColor = 'transparent'; // reset shadow for glass overlay
      ctx.beginPath();
      ctx.arc(x, y, BUBBLE_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Gorgeous bright 3D white crescent highlights (high-fidelity glints)
      ctx.beginPath();
      ctx.arc(x - BUBBLE_RADIUS / 3.5, y - BUBBLE_RADIUS / 3.5, BUBBLE_RADIUS / 3.6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
      ctx.fill();

      // Tiny secondary bottom reflection glint for ultimate glass-like depth
      ctx.beginPath();
      ctx.arc(x + BUBBLE_RADIUS / 2.5, y + BUBBLE_RADIUS / 2.5, BUBBLE_RADIUS / 5.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.fill();

      // Draw sweet and cozy cartoon faces inside normal bubbles!
      if (!powerUpType && !obstacleType) {
        ctx.save();
        ctx.strokeStyle = 'rgba(62, 39, 35, 0.7)'; // soft dark brown for warm, friendly features
        ctx.fillStyle = 'rgba(62, 39, 35, 0.7)';
        ctx.lineWidth = 1.3;
        ctx.lineCap = 'round';

        if (color === 'blue') {
          // Sweet sleeping face: closed curved eyes and smiling mouth
          ctx.beginPath();
          ctx.arc(x - 5.5, y - 1, 2.2, Math.PI, 0, false);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(x + 5.5, y - 1, 2.2, Math.PI, 0, false);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(x, y + 2.2, 2.2, 0, Math.PI, false);
          ctx.stroke();
        } else if (color === 'yellow') {
          // Excited happy: caret eyes and small oval mouth
          ctx.beginPath();
          ctx.moveTo(x - 8, y - 1); ctx.lineTo(x - 6, y - 3.2); ctx.lineTo(x - 4, y - 1);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(x + 4, y - 1); ctx.lineTo(x + 6, y - 3.2); ctx.lineTo(x + 8, y - 1);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(x, y + 2, 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (color === 'green') {
          // Cheerful: round dot eyes and happy smile
          ctx.beginPath();
          ctx.arc(x - 5, y - 1.8, 1.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(x + 5, y - 1.8, 1.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(x, y + 1, 2.8, 0, Math.PI, false);
          ctx.stroke();
        } else if (color === 'purple') {
          // Shy wink: dot eye, curved eye, quiet small circle mouth
          ctx.beginPath();
          ctx.arc(x - 5.5, y - 1.8, 1.3, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(x + 5.5, y - 1.8, 2, Math.PI, 0, false);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(x, y + 2, 1.3, 0, Math.PI * 2);
          ctx.stroke();
        } else if (color === 'orange') {
          // Funny cute cat style: squiggle eyes and wavy cat mouth 'w'
          ctx.beginPath();
          ctx.moveTo(x - 7, y - 2.5); ctx.lineTo(x - 4.5, y - 1);
          ctx.moveTo(x - 7, y - 1); ctx.lineTo(x - 4.5, y - 2.5);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(x + 4.5, y - 2.5); ctx.lineTo(x + 7, y - 1);
          ctx.moveTo(x + 4.5, y - 1); ctx.lineTo(x + 7, y - 2.5);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(x - 1.4, y + 1.8, 1.6, 0, Math.PI, false);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(x + 1.4, y + 1.8, 1.6, 0, Math.PI, false);
          ctx.stroke();
        }
        
        // Add subtle pink blush spots on every bubble cheek for cozy depth!
        ctx.fillStyle = 'rgba(239, 110, 142, 0.5)';
        ctx.beginPath();
        ctx.arc(x - 8.5, y + 1, 1.3, 0, Math.PI * 2);
        ctx.arc(x + 8.5, y + 1, 1.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // Power-up interior emoji signs
      if (powerUpType) {
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 14px sans-serif';

        if (powerUpType === 'rainbow') {
          ctx.fillText('🌈', x, y);
        } else if (powerUpType === 'bomb') {
          ctx.fillText('💣', x, y);
        } else if (powerUpType === 'vector_assist') {
          ctx.fillText('📐', x, y);
        }
      }

      // ICE OBSTACLE OVERLAY (Frosted glass cylinder block)
      if (obstacleType === 'ice') {
        const iceGrad = ctx.createRadialGradient(x, y, 5, x, y, BUBBLE_RADIUS + 1);
        iceGrad.addColorStop(0, 'rgba(224, 247, 250, 0.45)');
        iceGrad.addColorStop(0.7, 'rgba(128, 222, 234, 0.65)');
        iceGrad.addColorStop(1, 'rgba(0, 188, 212, 0.82)');

        ctx.strokeStyle = '#00ACC1';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, BUBBLE_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = iceGrad;
        ctx.fill();
        ctx.stroke();

        // Mini snowflake sparkle details inside frost
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(x, y - 8); ctx.lineTo(x, y + 8);
        ctx.moveTo(x - 8, y); ctx.lineTo(x + 8, y);
        ctx.moveTo(x - 5, y - 5); ctx.lineTo(x + 5, y + 5);
        ctx.moveTo(x - 5, y + 5); ctx.lineTo(x + 5, y - 5);
        ctx.stroke();
      }

      // CHAIN OBSTACLE OVERLAY (Thick iron handcuffs crossing)
      if (obstacleType === 'chain') {
        ctx.strokeStyle = '#3E2723'; // thick outline of chains
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(x - BUBBLE_RADIUS + 4, y - BUBBLE_RADIUS + 4);
        ctx.lineTo(x + BUBBLE_RADIUS - 4, y + BUBBLE_RADIUS - 4);
        ctx.moveTo(x - BUBBLE_RADIUS + 4, y + BUBBLE_RADIUS - 4);
        ctx.lineTo(x + BUBBLE_RADIUS - 4, y - BUBBLE_RADIUS + 4);
        ctx.stroke();

        // Inner silver highlights representing forged metal Links
        ctx.strokeStyle = '#EEEEEE';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#9E9E9E';
        ctx.fill();
        ctx.stroke();
      }

      ctx.restore();
    };

    // Main render loop
    const tick = () => {
      updatePhysics();
      drawCanvas();
      animFrameId = requestAnimationFrame(tick);
    };

    animFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameId);
  }, [gameState, isPaused, activeBubbleColor]);

  // Start the actual game process
  const handleStartGame = () => {
    AudioEngine.startMusic();
    setGameState('playing');
  };

  const handleRestartLevel = () => {
    initLevel(currentLevelIdx);
    setGameState('playing');
  };

  const nextLevel = () => {
    const nextIdx = currentLevelIdx + 1;
    if (nextIdx < LEVELS.length) {
      setCurrentLevelIdx(nextIdx);
      initLevel(nextIdx);
      setGameState('playing');
    }
  };

  const handleRetryFull = () => {
    setLives(3);
    setCurrentLevelIdx(0);
    initLevel(0);
    setGameState('playing');
  };

  return (
    <div 
       id="game-main-board" 
      className="relative w-full max-w-[1020px] h-[675px] bg-gradient-to-b from-[#2E1B15] to-[#140A07] border-[10px] border-[#3D2517] rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between selection:bg-transparent font-sans text-[#3E2723]"
    >

      {/* 2. HEADER HUD ATAS (Individual Compact Woody Gloss Pills) */}
      <div 
        id="hud-header"
        className="w-full px-4 pt-3 pb-2 flex items-center justify-between gap-2 text-white z-10 font-sans relative"
      >
        {/* SKOR (h-[48px]) */}
        <div className="flex-1 max-w-[110px] bg-gradient-to-b from-[#5c3e35] to-[#3a221b] border-2 border-[#a0705a] rounded-2xl py-0.5 px-1.5 shadow-[0_3px_5px_rgba(0,0,0,0.35),inset_0_1px_1.5px_rgba(255,255,255,0.25)] flex flex-col items-center justify-center text-center relative overflow-hidden h-[48px]">
          <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
          <span className="text-[8.5px] font-black text-[#FFD54F] tracking-wider uppercase leading-none mb-0.5">SKOR</span>
          <div className="flex items-center gap-1 font-extrabold text-xs text-[#FFD54F]">
            <Trophy className="w-3 h-3 text-[#FFD54F]" />
            <span>{score}</span>
          </div>
        </div>

        {/* SISA WAKTU */}
        <div className="flex-1 max-w-[115px] bg-gradient-to-b from-[#5c3e35] to-[#3a221b] border-2 border-[#a0705a] rounded-2xl py-0.5 px-1.5 shadow-[0_3px_5px_rgba(0,0,0,0.35),inset_0_1px_1.5px_rgba(255,255,255,0.25)] flex flex-col items-center justify-center text-center relative overflow-hidden h-[48px]">
          <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
          <span className="text-[8.5px] font-black text-white/90 tracking-wider uppercase leading-none mb-0.5">SISA WAKTU</span>
          <div className="flex items-center gap-1 font-extrabold text-xs text-white">
            <span className="text-xs">🕒</span>
            <span className={`text-[11px] font-black font-mono tracking-tight ${timeLeft <= 15 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
              {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* LEVEL PROGRESS PANEL (Compact Capsule - Redesigned to dynamic text output) */}
        <div className="flex-[2.1] max-w-[285px] bg-gradient-to-b from-[#5c3e35] to-[#3a221b] border-2 border-[#a0705a] rounded-2xl py-0.5 px-3 shadow-[0_3px_5px_rgba(0,0,0,0.35),inset_0_1px_1.5px_rgba(255,255,255,0.25)] flex flex-col justify-center items-center relative overflow-hidden h-[48px]">
          <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
          
          {(() => {
            const percent = Math.min(100, Math.round((score / activeLevel.targetScore) * 100));
            const activeBlocks = Math.min(10, Math.floor(percent / 10));
            const emptyBlocks = 10 - activeBlocks;
            const progressStr = '█'.repeat(activeBlocks) + '░'.repeat(emptyBlocks);

            return (
              <div className="font-mono text-[11px] font-bold text-center tracking-wide text-[#FFD54F]">
                Level {activeLevel.id} <span className="text-white/40 font-light">[</span><span className="text-emerald-400 font-semibold">{progressStr}</span><span className="text-white/40 font-light">]</span> {percent}%
              </div>
            );
          })()}

          <div className="flex items-center justify-between gap-3 text-[7.5px] font-black mt-0.5 uppercase tracking-wider text-white/70">
            <span>TARGET: {activeLevel.targetScore}</span>
            <span className="text-[#FFD54F]/90 animate-pulse">
              KURANG {(activeLevel.targetScore - score) > 0 ? (activeLevel.targetScore - score) : 0} POIN
            </span>
          </div>
        </div>

        {/* AMUNISI */}
        <div className="flex-1 max-w-[110px] bg-gradient-to-b from-[#5c3e35] to-[#3a221b] border-2 border-[#a0705a] rounded-2xl py-0.5 px-1.5 shadow-[0_3px_5px_rgba(0,0,0,0.35),inset_0_1px_1.5px_rgba(255,255,255,0.25)] flex flex-col items-center justify-center text-center relative overflow-hidden h-[48px]">
          <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
          <span className="text-[8.5px] font-black text-white/90 tracking-wider uppercase leading-none mb-0.5">AMUNISI</span>
          <div className="flex items-center gap-1 font-extrabold text-xs text-[#FFD54F]">
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-blue-500 via-sky-300 to-white shadow border border-white/30 inline-block"></span>
            <span>{ammoLeft}</span>
          </div>
        </div>

        {/* NYAWA */}
        <div className="flex-1 max-w-[115px] bg-gradient-to-b from-[#5c3e35] to-[#3a221b] border-2 border-[#a0705a] rounded-2xl py-0.5 px-2 shadow-[0_3px_5px_rgba(0,0,0,0.35),inset_0_1px_1.5px_rgba(255,255,255,0.25)] flex flex-col items-center justify-center text-center relative overflow-hidden h-[48px]">
          <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
          <span className="text-[8.5px] font-black text-white/90 tracking-wider uppercase leading-none mb-0.5">NYAWA</span>
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((heartIdx) => (
              <Heart 
                key={heartIdx} 
                className={`w-[14px] h-[14px] transition-all duration-300 ${
                  heartIdx <= lives 
                    ? 'text-red-500 fill-red-500 animate-pulse drop-shadow-[0_2px_3px_rgba(239,68,68,0.85)] scale-110' 
                    : 'text-[#4E342E] fill-black/30 opacity-30 scale-90'
                }`} 
              />
            ))}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            id="sound-control-btn"
            onClick={handleMuteBtn}
            className="w-10 h-10 bg-gradient-to-b from-[#5c3e35] to-[#3a221b] border-2 border-[#a0705a] rounded-full flex items-center justify-center text-white shadow-md hover:scale-105 active:scale-95 transition-transform cursor-pointer"
            title={isMuted ? 'Muted' : 'Sound active'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400 animate-pulse" /> : <Volume2 className="w-4 h-4 text-white" />}
          </button>
          <button
            id="pause-active-btn"
            onClick={() => setIsPaused(!isPaused)}
            disabled={gameState !== 'playing'}
            className="w-10 h-10 bg-gradient-to-b from-[#5c3e35] to-[#3a221b] border-2 border-[#a0705a] rounded-full flex items-center justify-center text-white shadow-md disabled:opacity-45 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
            title="Pause game"
          >
            <Pause className="w-3.5 h-3.5 fill-white text-white" />
          </button>
        </div>
      </div>

      {/* 3. MIDDLE SECTION: MASTER COLUMNS ON THE BACKDROP */}
      <div id="game-main-columns" className="flex-1 w-full flex flex-row items-center justify-center px-4 relative z-10 select-none gap-4">
        
        {/* LEFT PANEL: ITEM AJIB (Sleeker and wider per prompt) */}
        <div 
          id="powerup-inventory-panel"
          className="w-[116px] bg-[#1a0e0b]/85 backdrop-blur-sm border-[3px] border-[#3D2517] rounded-3xl p-2 flex flex-col items-center justify-between shadow-2xl h-[420px] relative select-none animate-fade-in shrink-0"
        >
          {/* Section capsule header banner */}
          <div className="w-full bg-gradient-to-r from-amber-500 to-orange-600 py-1 px-1 rounded-xl border border-[#FFD54F] text-center uppercase tracking-wider text-white text-[8px] font-black shadow-md">
            ITEM AJIB
          </div>

          <div className="flex flex-col gap-2 w-full mt-1.5 justify-self-center">
            
            {/* 1. Pelangi powerup */}
            <div className="group relative w-full flex flex-col items-center">
              <button
                id="power-up-rainbow-btn"
                onClick={() => usePowerUpItem('rainbow')}
                disabled={powerUps.rainbow <= 0 || activePowerUp === 'rainbow' || gameState !== 'playing'}
                className={`w-[42px] h-[42px] rounded-full border-[2px] shadow-md hover:scale-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center relative ${
                  activePowerUp === 'rainbow'
                    ? 'bg-gradient-to-b from-yellow-300 to-amber-500 border-[#FFD54F] ring-1 ring-yellow-400/50'
                    : 'bg-[#120806] border-[#4E342E]'
                }`}
              >
                <span className="text-lg">🌈</span>
                {/* Count Badge */}
                <span className="absolute -top-1 -right-1 bg-gradient-to-tr from-[#CE5022] to-[#F5824C] border border-[#FFD54F] text-white text-[7px] font-black h-4 w-4 rounded-full flex items-center justify-center shadow">
                  {powerUps.rainbow}
                </span>
              </button>
              <span className="text-[7px] font-black text-gray-300 mt-0.5 uppercase tracking-wide">PELANGI</span>
            </div>

            {/* 2. Boom powerup */}
            <div className="group relative w-full flex flex-col items-center">
              <button
                id="power-up-bomb-btn"
                onClick={() => usePowerUpItem('bomb')}
                disabled={powerUps.bomb <= 0 || activePowerUp === 'bomb' || gameState !== 'playing'}
                className={`w-[42px] h-[42px] rounded-full border-[2px] shadow-md hover:scale-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center relative ${
                  activePowerUp === 'bomb'
                    ? 'bg-gradient-to-b from-yellow-300 to-amber-500 border-[#FFD54F] ring-1 ring-yellow-400/50'
                    : 'bg-[#120806] border-[#4E342E]'
                }`}
              >
                <span className="text-lg">💣</span>
                {/* Count Badge */}
                <span className="absolute -top-1 -right-1 bg-gradient-to-tr from-[#CE5022] to-[#F5824C] border border-[#FFD54F] text-white text-[7px] font-black h-4 w-4 rounded-full flex items-center justify-center shadow">
                  {powerUps.bomb}
                </span>
              </button>
              <span className="text-[7px] font-black text-gray-300 mt-0.5 uppercase tracking-wide">BOOM</span>
            </div>

            {/* 3. Vector Assist powerup */}
            <div className="group relative w-full flex flex-col items-center">
              <button
                id="power-up-vector-assist-btn"
                onClick={() => usePowerUpItem('vector_assist')}
                disabled={powerUps.vector_assist <= 0 || activePowerUp === 'vector_assist' || gameState !== 'playing'}
                className={`w-[42px] h-[42px] rounded-full border-[2px] shadow-md hover:scale-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center relative ${
                  activePowerUp === 'vector_assist'
                    ? 'bg-gradient-to-b from-yellow-300 to-amber-500 border-[#FFD54F] ring-1 ring-yellow-400/50'
                    : 'bg-[#120806] border-[#4E342E]'
                }`}
              >
                <span className="text-lg">📐</span>
                {/* Count Badge */}
                <span className="absolute -top-1 -right-1 bg-gradient-to-tr from-[#CE5022] to-[#F5824C] border border-[#FFD54F] text-white text-[7px] font-black h-4 w-4 rounded-full flex items-center justify-center shadow">
                  {powerUps.vector_assist}
                </span>
              </button>
              <span className="text-[7px] font-black text-gray-300 mt-0.5 uppercase tracking-wide">VEKTOR</span>
            </div>

            {/* 5. Garis trajectory line toggle */}
            <div className="group relative w-full flex flex-col items-center">
              <button
                id="aim-guide-toggle-btn"
                onClick={() => setShowAimGuide((prev) => !prev)}
                className={`w-[42px] h-[42px] rounded-full border-[2px] shadow-md hover:scale-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center relative ${
                  showAimGuide
                    ? 'bg-gradient-to-b from-emerald-400 to-green-600 border-[#AEEA00] ring-1 ring-emerald-450/30'
                    : 'bg-[#120806] border-[#4E342E]'
                  }`}
                >
                  <span className="text-lg">📏</span>
                  {/* Count/Status Badge */}
                  <span className={`absolute -top-1 -right-1 border border-[#FFD54F] text-white text-[6px] font-black h-4 w-4 rounded-full flex items-center justify-center shadow ${
                    showAimGuide ? 'bg-emerald-500' : 'bg-red-500'
                  }`}>
                    {showAimGuide ? '✓' : '✗'}
                  </span>
                </button>
                <span className="text-[7px] font-black text-gray-300 mt-0.5 uppercase tracking-wide">GARIS</span>
              </div>

          </div>

          {/* Guide Quick math button */}
          <button
            id="algebra-linear-quick-btn"
            onClick={onOpenLinearAlgebra}
            className="w-full py-1 bg-gradient-to-b from-[#8C5E45] to-[#513627] border border-[#3D2517] rounded-xl text-white font-extrabold text-[7.5px] tracking-wide shadow-md flex items-center justify-center gap-0.5 transition-all hover:scale-105"
          >
            <Calculator className="w-2 h-2 text-yellow-300" />
            <span>VEKTOR</span>
          </button>
        </div>

        {/* CENTER PANEL: THE ARENA SPACE */}
        <div id="play-arena-wrapper" className="relative flex flex-col items-center justify-center flex-1 h-full z-10">
          <div 
            id="arena-canvas-container"
            className="relative overflow-hidden rounded-[24px] border-[5px] border-[#3D2517] bg-cover bg-center shadow-2xl"
            style={{ 
              width: `${CANVAS_WIDTH}px`, 
              height: `${CANVAS_HEIGHT}px`,
              backgroundImage: `url(${countrysideBg})`
            }}
          >
            {/* 3D Atmosphere Filter Overlays (Matching Level Themes) */}
            {currentLevelIdx === 1 && (
              <div className="absolute inset-0 bg-[#e05638]/15 mix-blend-color-burn pointer-events-none z-0"></div>
            )}
            {currentLevelIdx === 2 && (
              <div className="absolute inset-0 bg-[#120023]/40 mix-blend-multiply pointer-events-none z-0"></div>
            )}

            {/* Micro-Scene: Centered Celestial Sun / Moon Indicator inside play arena container */}
            <div className="absolute top-8 right-16 pointer-events-none z-0">
              {currentLevelIdx === 0 && (
                <div className="relative w-12 h-12 bg-amber-100/30 rounded-full shadow-[0_0_35px_15px_rgba(255,235,59,0.3)] flex items-center justify-center animate-pulse">
                  <div className="w-8 h-8 bg-yellow-400 rounded-full shadow"></div>
                </div>
              )}
              {currentLevelIdx === 1 && (
                <div className="relative w-12 h-12 bg-orange-100/20 rounded-full shadow-[0_0_35px_15px_rgba(244,81,30,0.25)] flex items-center justify-center animate-pulse">
                  <div className="w-8 h-8 bg-orange-500 rounded-full shadow"></div>
                </div>
              )}
              {currentLevelIdx === 2 && (
                <div className="relative w-10 h-10 bg-indigo-100/90 rounded-full shadow-[0_0_30px_12px_rgba(255,255,255,0.15)] flex items-center justify-center">
                  <div className="w-7 h-7 bg-slate-100 rounded-full relative overflow-hidden shadow-inner">
                    <div className="absolute -top-1 -right-1.5 w-6 h-6 bg-[#1A237E]/95 rounded-full"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Micro-Scene: Twinkling Level 3 Night Stars strictly inside play arena */}
            {currentLevelIdx === 2 && (
              <div className="absolute top-0 left-0 right-0 h-[180px] pointer-events-none opacity-80 z-0">
                <style>{`
                  @keyframes star-flicker {
                    0%, 100% { opacity: 0.3; transform: scale(0.8); }
                    50% { opacity: 1; transform: scale(1.1); }
                  }
                  .star-act { animation: star-flicker 3s ease-in-out infinite; }
                `}</style>
                <div className="absolute top-8 left-12 w-0.5 h-0.5 bg-white rounded-full star-act" style={{ animationDelay: '0s' }}></div>
                <div className="absolute top-14 left-[40%] w-1 h-1 bg-white rounded-full star-act" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-10 right-20 w-0.5 h-0.5 bg-yellow-100 rounded-full star-act" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-20 left-24 w-0.5 h-0.5 bg-white rounded-full star-act" style={{ animationDelay: '1.5s' }}></div>
                <div className="absolute top-22 right-14 w-0.5 h-0.5 bg-indigo-200 rounded-full star-act" style={{ animationDelay: '0.5s' }}></div>
              </div>
            )}

            {/* Micro-Scene: Living Clouds and Birds within play arena borders */}
            <div className="absolute top-10 left-8 opacity-[0.27] animate-drift pointer-events-none z-0">
              <svg width="60" height="20" fill="white" viewBox="0 0 100 30">
                <path d="M 15 25 a 12 12 0 0 1 12 -12 a 15 15 0 0 1 25 -4 a 12 12 0 0 1 20 4 a 10 10 0 0 1 15 12 z" />
              </svg>
            </div>
            <div className="absolute top-20 right-12 opacity-[0.18] animate-drift pointer-events-none z-0" style={{ animationDelay: '-11s' }}>
              <svg width="50" height="16" fill="white" viewBox="0 0 70 25">
                <path d="M 8 18 a 10 10 0 0 1 10 -10 a 12 12 0 0 1 18 -3 a 10 10 0 0 1 16 13 z" />
              </svg>
            </div>

            <div className="absolute top-6 left-0 pointer-events-none z-0 animate-bird-slow" style={{ animationDelay: '0s' }}>
              <svg width="15" height="10" viewBox="0 0 24 15" fill="none" stroke="#2c5e8c" strokeWidth="2" strokeLinecap="round" opacity="0.4">
                <path d="M2,9 Q6,2 12,8 Q18,2 22,9" />
              </svg>
            </div>

            {/* Interactive canvas centered */}
            <canvas
              id="game-canvas"
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              onMouseMove={handleMouseMove}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              className="absolute left-0 top-0 cursor-crosshair z-10 bg-transparent"
            />

            {/* NEXT PREVIEW CARD (Resized into sleeker and beautiful format per Point 4) */}
            <div 
              id="next-bubble-card"
              className="absolute bottom-4 left-[132px] z-20 bg-[#FFFCE8]/95 border-[3.5px] border-[#3D2517] rounded-2xl w-[60px] h-[82px] shadow-2xl flex flex-col items-center justify-between py-1.5 pointer-events-none select-none animate-fade-in"
            >
              <span className="text-[8px] font-black text-[#5D4037] pb-0.5 border-b border-[#5D4037]/15 w-full text-center tracking-widest uppercase">NEXT</span>
              <div 
                className="w-7 h-7 rounded-full border-2 border-white shadow-md relative flex flex-col items-center justify-center transition-all duration-350"
                style={{ backgroundColor: COLORS_HEX[nextBubbleColor] }}
              >
                <div className="absolute inset-0.5 rounded-full bg-gradient-to-tr from-transparent to-white/45 pointer-events-none"></div>
                {/* Cute sleeping face inside next bubble */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <div className="flex gap-1 mb-0.5">
                    <span className="text-[6.5px] font-extrabold text-[#3E2723]/70 select-none leading-none">^</span>
                    <span className="text-[6.5px] font-extrabold text-[#3E2723]/70 select-none leading-none">^</span>
                  </div>
                  <span className="text-[5.5px] font-bold text-[#3E2723]/70 select-none leading-none">‿</span>
                </div>
              </div>
              <span className="text-[7.5px] font-black tracking-wide text-[#2E7D32] uppercase block truncate w-full text-center px-0.5">
                {COLOR_THEME_LABELS[nextBubbleColor]}
              </span>
            </div>

            {/* SWAP CONTROL BUTTON CARD (Resized matching Next Card - Placed on the right of the cat mascot) */}
            <button
               id="bubbles-swap-card-btn"
               onClick={swapBubbles}
               disabled={swapCooldown > 0 || gameState !== 'playing'}
               className="absolute bottom-4 right-[132px] z-20 bg-[#FFFCE8]/95 border-[3.5px] border-[#3D2517] rounded-2xl w-[60px] h-[82px] shadow-2xl flex flex-col items-center justify-between py-1.5 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
               title="Tukar Amunisi"
             >
              <div className="absolute top-1 right-1">
                <RotateCcw className="w-2.5 h-2.5 text-[#3D2517]/80 font-black animate-spin-slow" />
              </div>
              <span className="text-[8px] font-black text-[#5D4037] pb-0.5 border-b border-[#5D4037]/15 w-full text-center tracking-widest uppercase">SWAP</span>
              <div 
                className="w-7 h-7 rounded-full border-2 border-white shadow-md relative flex flex-col items-center justify-center transition-all duration-350"
                style={{ backgroundColor: COLORS_HEX[activeBubbleColor] }}
              >
                <div className="absolute inset-0.5 rounded-full bg-gradient-to-tr from-transparent to-white/45 pointer-events-none"></div>
                {/* Cute sleeping face inside swap bubble */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <div className="flex gap-1 mb-0.5">
                    <span className="text-[6.5px] font-extrabold text-[#3E2723]/70 select-none leading-none">^</span>
                    <span className="text-[6.5px] font-extrabold text-[#3E2723]/70 select-none leading-none">^</span>
                  </div>
                  <span className="text-[5.5px] font-bold text-[#3E2723]/70 select-none leading-none">‿</span>
                </div>
              </div>
              <span className="text-[7.5px] font-black tracking-wide text-amber-700 uppercase block truncate w-full text-center px-0.5">
                {COLOR_THEME_LABELS[activeBubbleColor]}
              </span>
              {swapCooldown > 0 && (
                <div className="absolute inset-1 rounded-2xl bg-black/60 flex items-center justify-center text-xs font-black text-[#FFD54F] font-mono">
                  {swapCooldown}s
                </div>
              )}
            </button>

            {/* Dynamic and satisfying React motion-powered Combo overlay */}
            <AnimatePresence>
              {showComboIndicator && currentComboCount >= 2 && (
                <motion.div
                  key={comboAnimKey}
                  initial={{ opacity: 0, scale: 0.6, y: 15 }}
                  animate={{ opacity: 1, scale: 1.15, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -25 }}
                  transition={{ type: 'spring', damping: 10, stiffness: 220 }}
                  className="absolute left-1/2 -translate-x-1/2 top-1/4 z-30 pointer-events-none select-none flex flex-col items-center bg-gradient-to-r from-yellow-500 via-amber-600 to-yellow-500 text-[#FFFCE8] border-[3px] border-[#3D2517] rounded-2xl py-1.5 px-5 shadow-[0_12px_24px_rgba(0,0,0,0.4)]"
                >
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#FFED4A] drop-shadow-sm">DAHSYAT! COMBO</span>
                  <span className="text-2xl font-black italic tracking-tighter text-[#FFFCE8] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                    X <span className="text-[#FFED4A]">{currentComboCount}</span>
                  </span>
                  <div className="absolute inset-0 bg-white/10 rounded-2xl animate-pulse pointer-events-none"></div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* MASCOT CAT LAUNCHER (Centered tree stump - Scaled 20% + Shadow) */}
            <div 
              id="mascot-cat-launcher-overlay" 
              className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex flex-col items-center drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)]"
            >
              {/* Wood-pedestal log */}
              <div className="w-28 h-9 bg-gradient-to-b from-[#8C5E45] to-[#513627] rounded-t-xl border-t-4 border-l-4 border-r-4 border-[#3D2517] relative shadow-lg">
                <div className="absolute inset-x-1 top-0.5 h-0.5 bg-[#D7CCC8]/30 rounded-full"></div>
              </div>

              {/* Orange happy kitten body with opened yawning circular mouth */}
              <div className="w-24 h-22 bg-gradient-to-b from-[#F5824C] to-[#CE5022] rounded-full border-[3.5px] border-[#3D2517] relative -mt-[64px] shadow-md flex items-center justify-center animate-wiggle-slow overflow-visible">
                
                {/* Pointing ears */}
                <div className="absolute -top-3.5 left-1 w-0 h-0 border-l-[9px] border-l-transparent border-r-[9px] border-r-transparent border-b-[16px] border-b-[#F5824C] rotate-[-20deg]">
                  <div className="absolute -left-1 top-4.5 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[11px] border-b-pink-300"></div>
                </div>
                <div className="absolute -top-3.5 right-1 w-0 h-0 border-l-[9px] border-l-transparent border-r-[9px] border-r-transparent border-b-[16px] border-b-[#F5824C] rotate-[20deg]">
                  <div className="absolute -right-1 top-4.5 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[11px] border-b-pink-300"></div>
                </div>

                {/* Closed happy eyes */}
                <div className="absolute top-[18px] left-[22px] text-[15px] font-extrabold text-[#3E2723] leading-none select-none font-mono">^</div>
                <div className="absolute top-[18px] right-[22px] text-[15px] font-extrabold text-[#3E2723] leading-none select-none font-mono">^</div>

                {/* Soft pink cheeks */}
                <div className="w-3 h-1.5 bg-pink-400 rounded-full opacity-65 absolute top-[27px] left-[13px]"></div>
                <div className="w-3 h-1.5 bg-pink-400 rounded-full opacity-65 absolute top-[27px] right-[13px]"></div>

                {/* Whiskers */}
                <div className="absolute left-[1px] top-9 w-3.5 h-[0.5px] bg-[#3E2723]/30"></div>
                <div className="absolute left-[2px] top-11.5 w-3.5 h-[0.5px] bg-[#3E2723]/30"></div>
                <div className="absolute right-[1px] top-9 w-3.5 h-[0.5px] bg-[#3E2723]/30"></div>
                <div className="absolute right-[2px] top-11.5 w-3.5 h-[0.5px] bg-[#3E2723]/30"></div>

                {/* Wide open mouth container acting as the Active Bubble Cradle */}
                <div className="w-13 h-13 rounded-full bg-[#1A0E0B] border-[3px] border-[#3D2517] absolute -bottom-2.5 z-10 flex items-center justify-center overflow-hidden shadow-inner">
                  
                  {/* ACTIVE SHOOTING BUBBLE nested beautifully inside mouth */}
                  <div 
                    className="w-11 h-11 rounded-full border-2 border-white shadow-md relative flex flex-col items-center justify-center transition-all duration-300"
                    style={{ backgroundColor: COLORS_HEX[activeBubbleColor] }}
                  >
                    <div className="absolute inset-0.5 rounded-full bg-gradient-to-tr from-transparent to-white/45 pointer-events-none"></div>
                    
                    {/* Cute sleeping face inside active shooting bubble */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <div className="flex gap-1.5 mb-0.5 mt-0.5">
                        <span className="text-[7.5px] font-extrabold text-[#3E2723]/70 select-none leading-none">^</span>
                        <span className="text-[7.5px] font-extrabold text-[#3E2723]/70 select-none leading-none">^</span>
                      </div>
                      <span className="text-[6.5px] font-bold text-[#3E2723]/70 select-none leading-none">‿</span>
                    </div>

                    {activePowerUp && (
                      <span className="text-white text-[10px] font-black animate-bounce absolute z-20">
                        {activePowerUp === 'rainbow' ? '🌈' : activePowerUp === 'bomb' ? '💣' : '⚡'}
                      </span>
                    )}
                  </div>

                </div>
              </div>
            </div>

            {/* Start screen overlay */}
            {gameState === 'start' && (
              <div className="absolute inset-0 bg-[#1A0E0B]/95 rounded-xl flex flex-col items-center justify-center text-center p-6 z-20 font-sans border-4 border-[#3D2517] animate-fade-in">
                <span className="text-[#FFC107] font-black text-[10px] tracking-widest uppercase mb-1 drop-shadow animate-pulse">VALLEY RESCUE SPECIAL</span>
                <h1 className="text-[21px] font-black text-white mb-1.5 tracking-wide drop-shadow uppercase">
                  Bubble Paws Valley
                </h1>
                
                {highScore > 0 && (
                  <div className="bg-[#FFD54F]/10 border border-[#FFD54F]/30 px-3.5 py-1 rounded-full mb-3 flex items-center gap-1.5 shadow-inner">
                    <span className="text-xs">🏆</span>
                    <span className="text-[9px] font-extrabold text-[#FFD54F] uppercase tracking-wider">REKOR TERBAIK: {highScore} POIN</span>
                  </div>
                )}

                <div className="bg-[#2E1B15]/90 border border-[#8d5e46]/30 p-2.5 rounded-xl max-w-sm mb-4 text-left">
                  <p className="text-[#FFD54F] text-[9px] font-black uppercase mb-1 flex items-center gap-1">
                    <span>🐱</span> <span>Kisah Lembah Kucing:</span>
                  </p>
                  <p className="text-gray-200 text-[10px] leading-relaxed">
                    Gelembung sihir liar tiba-tiba turun menyelimuti langit pedesaan <strong>Bubble Paws Valley</strong>, mengganggu ketenangan hewan dan ladang subur.
                  </p>
                  <p className="text-gray-300 text-[10px] leading-relaxed mt-1">
                    Sebagai Kucing Penjaga lembah, Anda bertugas meluncurkan gelembung penyeimbang dengan ilmu sudut pantulan vektor presisi tinggi sebelum kehabisan waktu atau amunisi!
                  </p>
                </div>
                <div className="flex flex-col gap-2 w-48 relative z-30">
                  <button
                    id="start-button-game"
                    onClick={handleStartGame}
                    className="w-full bg-[#2E7D32] hover:bg-[#256428] text-white font-extrabold py-2 rounded-lg shadow-md border-b-4 border-emerald-900 active:border-b-0 transform hover:scale-102 active:translate-y-0.5 transition-all text-xs cursor-pointer"
                  >
                    Mulai Petualangan 🐾
                  </button>
                  <button
                    id="open-tutorial-btn-first"
                    onClick={onOpenTutorial}
                    className="w-full bg-[#6D4C41] hover:bg-[#5d4037] text-white font-semibold py-1.5 rounded-lg text-[10px] cursor-pointer"
                  >
                    Panduan & Teori Vektor
                  </button>
                </div>
              </div>
            )}

            {/* Pause Screen Overlay */}
            {isPaused && (
              <div className="absolute inset-0 bg-[#000]/80 rounded-xl flex flex-col items-center justify-center text-center z-20 font-sans border-4 border-[#3D2517]">
                <h2 className="text-xl font-black text-white mb-4">Game Ditunda (Paused)</h2>
                <div className="flex flex-col gap-2 w-44">
                  <button
                    id="resume-btn"
                    onClick={() => setIsPaused(false)}
                    className="bg-[#2E7D32] hover:bg-[#256428] text-white font-bold py-2 rounded-lg shadow-md text-xs cursor-pointer"
                  >
                    Lanjutkan Permainan
                  </button>
                  <button
                    id="restart-current-btn"
                    onClick={handleRestartLevel}
                    className="bg-[#6D4C41] hover:bg-[#5d4037] text-white py-1.5 rounded-lg text-[10px] cursor-pointer"
                  >
                    Mulai Ulang Level
                  </button>
                </div>
              </div>
            )}

            {/* Cooldown fail screen */}
            {gameState === 'cooldown_fail' && (
              <div className="absolute inset-0 bg-[#2b0c0c]/98 rounded-xl flex flex-col items-center justify-center text-center z-20 font-sans border-4 border-red-800 animate-fade-in p-6">
                <div className="w-16 h-16 rounded-full bg-red-950/85 border-4 border-red-600 flex items-center justify-center mb-3 animate-bounce">
                  <span className="text-3xl text-red-500">💔</span>
                </div>
                <h2 className="text-red-500 font-extrabold text-2xl mb-1 tracking-wide uppercase">Nyawa Berkurang!</h2>
                <p className="text-gray-300 text-xs max-w-xs mb-4">
                  Bubble melampaui batas garis merah atau waktu Anda telah berakhir!
                </p>
                <div className="bg-[#1C0808]/90 border border-red-900 px-5 py-2.5 rounded-2xl flex items-center gap-3">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Status Nyawa:</span>
                  <div className="flex gap-1.5">
                    {[1, 2, 3].map((heartIdx) => (
                      <span key={heartIdx} className="text-lg">
                        {heartIdx <= lives ? '❤️' : '🖤'}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-yellow-500 font-extrabold text-[10px] uppercase mt-4 tracking-widest animate-pulse">Menata ulang langit lembah...</p>
              </div>
            )}

            {/* Level Win screen */}
            {gameState === 'levelwin' && (
              <div className="absolute inset-0 bg-[#1C0F0C]/97 rounded-xl flex flex-col items-center justify-center text-center p-5 z-20 font-sans border-4 border-[#FFD54F] overflow-y-auto">
                {/* 3 Winning Stars Celebration */}
                <div className="flex gap-2 mb-2 items-center justify-center">
                  <motion.span initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1.1, rotate: 0 }} transition={{ delay: 0.1, type: "spring" }} className="text-2xl text-yellow-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">⭐</motion.span>
                  <motion.span initial={{ scale: 0, y: -20 }} animate={{ scale: 1.3, y: 0 }} transition={{ delay: 0.25, type: "spring" }} className="text-3xl text-yellow-300 drop-shadow-[0_4px_8px_rgba(255,215,0,0.45)]">⭐</motion.span>
                  <motion.span initial={{ scale: 0, rotate: 30 }} animate={{ scale: 1.1, rotate: 0 }} transition={{ delay: 0.4, type: "spring" }} className="text-2xl text-yellow-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">⭐</motion.span>
                </div>
                <h2 className="text-[#FFD54F] font-black text-xl drop-shadow uppercase tracking-wide">LEVEL SELESAI!</h2>
                <p className="text-gray-300 text-[10px] mt-1 mb-3.5 max-w-xs leading-normal">
                  Kerja Bagus! Seluruh gelembung liar berhasil dipulihkan dengan ilmu sudut pantulan arah vektor presisi!
                </p>

                {/* Academic Statistics */}
                <div className="flex flex-col gap-2 w-full max-w-sm bg-black/45 border border-[#FFD54F]/20 p-3 rounded-xl text-left mb-4 text-[10px]">
                  <span className="text-[#FFD54F] font-black text-center block mb-1 uppercase tracking-widest text-[9px]">Laporan Akademik Vektor</span>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 font-mono text-gray-200">
                    <div className="flex justify-between border-b border-[#ffd54f]/10 pb-0.5">
                      <span>Tembakan:</span>
                      <span className="text-white font-bold">{shotsFired}</span>
                    </div>
                    <div className="flex justify-between border-b border-[#ffd54f]/10 pb-0.5">
                      <span>Kena:</span>
                      <span className="text-emerald-400 font-bold">{shotsHit}</span>
                    </div>
                    <div className="flex justify-between border-b border-[#ffd54f]/10 pb-0.5">
                      <span>Akurasi:</span>
                      <span className="text-cyan-400 font-bold">{Math.round((shotsHit / (shotsFired || 1)) * 100)}%</span>
                    </div>
                    <div className="flex justify-between border-b border-[#ffd54f]/10 pb-0.5">
                      <span>Pantulan:</span>
                      <span className="text-amber-400 font-bold">{bounceShots} kali</span>
                    </div>
                    <div className="flex justify-between col-span-2 border-b border-[#ffd54f]/10 pb-0.5">
                      <span>Waktu Dipakai:</span>
                      <span className="text-white font-bold">{activeLevel.timeLimitSec - timeLeft}s dari {activeLevel.timeLimitSec}s</span>
                    </div>
                  </div>

                  {/* Achievements section */}
                  <div className="mt-2.5 pt-2 border-t border-[#FFFCE8]/10">
                    <span className="text-gray-300 font-extrabold text-[8.5px] block uppercase mb-1.5 tracking-wider">PIALA PRESTASI MAHASISWA</span>
                    <div className="flex flex-col gap-1.5 font-sans">
                      {bounceShots >= 5 && (
                        <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
                          <span className="text-xs text-yellow-400">📐</span>
                          <div>
                            <span className="text-[8.5px] font-black text-amber-300 uppercase block">Vector Master</span>
                            <span className="text-[7.5px] text-gray-400">Melakukan minimal 5 Tembakan Pantulan sukses!</span>
                          </div>
                        </div>
                      )}

                      {(shotsHit / (shotsFired || 1)) >= 0.8 && (
                        <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                          <span className="text-xs text-emerald-400">🎯</span>
                          <div>
                            <span className="text-[8.5px] font-black text-emerald-300 uppercase block">Precision Shooter</span>
                            <span className="text-[7.5px] text-gray-400">Akurasi tembakan Anda melampauid standar 80%!</span>
                          </div>
                        </div>
                      )}

                      {!usedPowerUpInLevel && (
                        <div className="flex items-center gap-1.5 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded">
                          <span className="text-xs text-[#00E5FF]">🧠</span>
                          <div>
                            <span className="text-[8.5px] font-black text-cyan-300 uppercase block">Algebra Genius</span>
                            <span className="text-[7.5px] text-gray-400">Menyelesaikan level murni kalkulasi sudut tanpa power-up!</span>
                          </div>
                        </div>
                      )}

                      {bounceShots < 5 && (shotsHit / (shotsFired || 1)) < 0.8 && usedPowerUpInLevel && (
                        <span className="text-[8.5px] italic text-gray-400 block text-center py-0.5">Bidik pantulan dinding yang presisi untuk meraih Piala Penghargaan!</span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  id="next-level-btn"
                  onClick={nextLevel}
                  className="bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-extrabold py-2 px-5 rounded-lg shadow-lg hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-1 text-[10.5px] cursor-pointer"
                >
                  Ke Level Selanjutnya <ChevronRight className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            )}

            {/* Game Win screen */}
            {gameState === 'gamewin' && (
              <div className="absolute inset-0 bg-[#0F2D17]/95 rounded-xl flex flex-col items-center justify-center text-center p-6 z-20 font-sans border-4 border-[#3D2517] animate-fade-in">
                <Sparkles className="w-10 h-10 text-[#FFD54F] mb-1 animate-pulse" />
                <h1 className="text-xl font-black text-[#FFD54F] mb-1.5 flex items-center gap-1.5">🏆 Kemenangan Akbar!</h1>
                <p className="text-white text-[11px] max-w-xs mb-4">
                  Luar Biasa! Anda telah menyelesaikan seluruh 3 Tingkatan Lembah <strong>Bubble Paws Valley</strong> dan membersihkan langit dari gelembung liar secara sempurna!
                </p>
                
                <div className="flex gap-4 mb-5">
                  <div className="bg-[#10241A] py-1.5 px-4 rounded-xl border border-emerald-500/30 text-center min-w-[90px]">
                    <span className="text-[7.5px] text-gray-400 block uppercase font-mono">SKOR AKHIR</span>
                    <span className="text-base font-black text-emerald-400 font-mono">{score}</span>
                  </div>
                  <div className="bg-[#10241A] py-1.5 px-4 rounded-xl border border-[#FFD54F]/30 text-center min-w-[90px]">
                    <span className="text-[7.5px] text-gray-400 block uppercase font-mono">REKOR TERBAIK</span>
                    <span className="text-base font-black text-[#FFD54F] font-mono">{highScore}</span>
                  </div>
                </div>

                <button
                  id="play-again-full-btn"
                  onClick={handleRetryFull}
                  className="bg-[#2E7D32] hover:bg-[#256428] text-white font-bold py-2 px-6 rounded-lg shadow-md border-b-4 border-emerald-950 active:border-b-0 text-xs transition-all transform hover:scale-105 cursor-pointer"
                >
                  Main Lagi Dari Awal 🌿
                </button>
              </div>
            )}

            {/* Game Over Screen */}
            {gameState === 'gameover' && (
              <div className="absolute inset-0 bg-[#2D0D0F]/95 rounded-xl flex flex-col items-center justify-center text-center p-6 z-20 font-sans border-4 border-[#3D2517] animate-fade-in">
                <AlertTriangle className="w-10 h-10 text-red-500 mb-1.5 animate-bounce" />
                <h2 className="text-red-500 font-black text-xl mb-1 flex items-center gap-1.5">Permainan Berakhir!</h2>
                <p className="text-gray-300 text-[11px] mb-4 max-w-xs leading-normal">
                  Nyawa Anda telah habis sepenuhnya. Lembah kuno Bubble Paws Valley masih membutuhkan kepiawaian hitungan vektor arah Anda!
                </p>

                <div className="flex gap-4 mb-5">
                  <div className="bg-[#1c0a0c] py-1.5 px-4 rounded-xl border border-red-500/20 text-center min-w-[90px]">
                    <span className="text-[7.5px] text-gray-400 block uppercase font-mono">SKOR ANDA</span>
                    <span className="text-base font-black text-red-400 font-mono">{score}</span>
                  </div>
                  <div className="bg-[#1c0a0c] py-1.5 px-4 rounded-xl border border-[#FFD54F]/20 text-center min-w-[90px]">
                    <span className="text-[7.5px] text-gray-400 block uppercase font-mono">REKOR TERBAIK</span>
                    <span className="text-base font-black text-[#FFD54F] font-mono">{highScore}</span>
                  </div>
                </div>

                <button
                  id="restart-game-over-btn"
                  onClick={handleRetryFull}
                  className="bg-[#6D4C41] hover:bg-[#5d4037] text-white font-bold py-2 px-6 rounded-lg shadow-md border-[#3D2517] border-b-4 active:border-b-0 text-xs transition-all transform hover:scale-105 cursor-pointer"
                >
                  Mulai Ulang Permainan 🐾
                </button>
              </div>
            )}

          </div>
        </div>

        {/* INVISIBLE RIGHT PANEL FOR HORIZONTAL SYMMETRICAL RECENTERING */}
        <div className="w-[108px] h-[485px] z-10 relative overflow-visible select-none py-4 pointer-events-none flex flex-col justify-end items-center shrink-0">
          <div className="w-full p-2 bg-[#1a0e0b]/80 border-[3px] border-[#3D2517] rounded-2xl text-center pointer-events-auto">
            <span className="text-[6.5px] text-amber-500/80 font-bold uppercase tracking-wider block">FISIKA VEKTOR</span>
            <span className="text-[7.5px] text-[#FFD54F] font-extrabold block uppercase mt-0.5">VECT VER. 1.2</span>
          </div>
        </div>

      </div>

      {/* 4. FOOTER INFORMASI (Sleek low-profile rule summary per prompt) */}
      <div 
        id="rules-footer"
        className="w-[98%] mx-auto mb-3 bg-[#110705]/80 border-2 border-[#3D2517] rounded-xl px-4 py-1.5 z-10 relative overflow-hidden font-sans shadow-lg flex items-center justify-center text-white/90"
      >
        <div className="flex items-center gap-6 text-[10px] font-bold tracking-wide">
          <div className="flex items-center gap-1.5 text-amber-400">
            <span>🎯</span>
            <span>Target Skor: {activeLevel.targetScore}</span>
          </div>
          <div className="text-[#a0705a]/40 font-light">|</div>
          <div className="flex items-center gap-1.5 text-rose-400">
            <span>⚠️</span>
            <span>Bubble tidak boleh menyentuh garis merah.</span>
          </div>
        </div>
      </div>

    </div>
  );
}
