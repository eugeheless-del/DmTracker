// Base entity interface
export interface BaseEntity {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
}

// Search result type
export interface SearchResult {
  id: string;
  name: string;
  type: 'pc' | 'npc' | 'twist' | 'session';
  description?: string;
  matchedField?: 'name' | 'role' | 'class' | 'race' | 'type' | 'description';
}

// Тип для данных формы при создании/редактировании
export type TwistInput = Omit<Twist, 'id' | 'createdAt' | 'updatedAt'>;
export type PCInput = Omit<PC, 'id' | 'createdAt' | 'updatedAt'>;
export type NPCInput = Omit<NPC, 'id' | 'createdAt' | 'updatedAt'>;

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
  trigger?: string; // condition that triggers the twist
  type?: 'revelation' | 'enemy' | 'opportunity' | 'obstacle' | 'alliance';
  consequence?: string;
  status?: 'hidden' | 'ready' | 'revealed' | 'completed'; // twist status
  resolved?: boolean;
  sessionId?: string;
  npcIds: string[]; // associated NPC references
  pcIds: string[]; // associated PC references
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
  searchEntities: (query: string) => SearchResult[];
}
