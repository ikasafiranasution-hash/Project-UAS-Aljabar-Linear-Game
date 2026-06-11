export type BubbleColor = 'blue' | 'purple' | 'green' | 'yellow' | 'orange';

export interface Bubble {
  id: string;
  x: number;
  y: number;
  color: BubbleColor;
  isPowerUp?: 'rainbow' | 'bomb' | 'vector_assist';
  isPopping?: boolean;
  popProgress?: number; // 0 to 1
  obstacle?: 'stone' | 'ice' | 'chain';
  stoneHealth?: number; // Supports stone health (boulder needs 2 hits)
}

export interface GridPos {
  row: number;
  col: number;
}

export interface ShootingBubble {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: BubbleColor;
  isPowerUp?: 'rainbow' | 'bomb' | 'vector_assist';
  radius: number;
  obstacle?: 'stone' | 'ice' | 'chain';
  bounces?: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  size: number;
  life: number; // in frames
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  alpha: number;
  scale: number;
  life: number;
}

export interface LevelConfig {
  id: number;
  name: string;
  rowsCount: number;
  targetScore: number;
  allowedAmmo: number;
  timeLimitSec: number; // e.g. 90 seconds
  initialGrid: (BubbleColor | null)[][];
}
