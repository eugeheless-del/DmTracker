// Base entity interface
export interface BaseEntity {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
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
export type TwistInput = Omit<Twist, 'id' | 'created_at' | 'updated_at'>;
export type PCInput = Omit<PC, 'id' | 'created_at' | 'updated_at'>;
export type NPCInput = Omit<NPC, 'id' | 'created_at' | 'updated_at'>;

// Non-Player Character (NPC)
export interface NPC extends BaseEntity {
  role?: string;
  appearance?: string;
  notes?: string;
  location?: string;
  status?: 'alive' | 'dead' | 'missing';
}

// Player Character (PC)
export interface PC extends BaseEntity {
  playerName?: string;
  class?: string;
  level?: number;
  race?: string;
  hp?: number;
  ac?: number;
  notes?: string;
}

// Twist - plot event or complication
export interface Twist {
  id: string;
  title: string; // Renamed from 'name'
  description?: string;
  trigger_condition?: string; // Condition that triggers the twist
  type?: 'revelation' | 'enemy' | 'opportunity' | 'obstacle' | 'alliance';
  consequence?: string;
  status?: 'hidden' | 'ready' | 'revealed' | 'completed'; // twist status
  created_at: string;
  updated_at: string;
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
  addNpc: (npc: Omit<NPC, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateNpc: (id: string, data: Partial<Omit<NPC, 'id' | 'created_at'>>) => Promise<void>;
  deleteNpc: (id: string) => Promise<void>;
  getNpcById: (id: string) => NPC | undefined;

  // PC actions
  addPc: (pc: Omit<PC, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updatePc: (id: string, data: Partial<Omit<PC, 'id' | 'created_at'>>) => Promise<void>;
  deletePc: (id: string) => Promise<void>;
  getPcById: (id: string) => PC | undefined;

  // Twist actions
  addTwist: (twist: Omit<Twist, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateTwist: (id: string, data: Partial<Omit<Twist, 'id' | 'created_at'>>) => Promise<void>;
  deleteTwist: (id: string) => Promise<void>;
  getTwistById: (id: string) => Twist | undefined;

  // Session actions
  addSession: (session: Omit<Session, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateSession: (id: string, data: Partial<Omit<Session, 'id' | 'created_at'>>) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  getSessionById: (id: string) => Session | undefined;

  // Utility
  loadFromSupabase: () => Promise<void>;
  clearAll: () => Promise<void>;
  searchEntities: (query: string) => SearchResult[];
}
