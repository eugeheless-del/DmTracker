// Base entity interface
export interface BaseEntity {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
}

// Non-Player Character (NPC)
export interface NPC extends BaseEntity {
  description?: string;
  appearance?: string;
  notes?: string;
  alignment?: string;
  location?: string;
}

// Player Character (PC)
export interface PC extends BaseEntity {
  playerName?: string;
  class?: string;
  level?: number;
  race?: string;
  hp?: number;
  maxHp?: number;
  alignment?: string;
  notes?: string;
}

// Twist - plot event or complication
export interface Twist extends BaseEntity {
  description?: string;
  type?: 'revelation' | 'enemy' | 'opportunity' | 'obstacle' | 'alliance';
  consequence?: string;
  resolved?: boolean;
  sessionId?: string;
}

// Gaming Session
export interface Session extends BaseEntity {
  date?: number; // timestamp
  description?: string;
  npcIds: string[]; // references to NPCs
  pcIds: string[]; // references to PCs
  twistIds: string[]; // references to Twists
  notes?: string;
}

// Store state
export interface StoreState {
  // Data
  npcs: NPC[];
  pcs: PC[];
  twists: Twist[];
  sessions: Session[];

  // NPC actions
  addNpc: (npc: Omit<NPC, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNpc: (id: string, data: Partial<Omit<NPC, 'id' | 'createdAt'>>) => void;
  deleteNpc: (id: string) => void;
  getNpcById: (id: string) => NPC | undefined;

  // PC actions
  addPc: (pc: Omit<PC, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePc: (id: string, data: Partial<Omit<PC, 'id' | 'createdAt'>>) => void;
  deletePc: (id: string) => void;
  getPcById: (id: string) => PC | undefined;

  // Twist actions
  addTwist: (twist: Omit<Twist, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTwist: (id: string, data: Partial<Omit<Twist, 'id' | 'createdAt'>>) => void;
  deleteTwist: (id: string) => void;
  getTwistById: (id: string) => Twist | undefined;

  // Session actions
  addSession: (session: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSession: (id: string, data: Partial<Omit<Session, 'id' | 'createdAt'>>) => void;
  deleteSession: (id: string) => void;
  getSessionById: (id: string) => Session | undefined;

  // Utility
  loadFromStorage: () => void;
  clearAll: () => void;
}
