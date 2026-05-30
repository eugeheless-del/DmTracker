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
  type: 'pc' | 'npc' | 'twist' | 'session' | 'locations';
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

// Inventory Item for PC
export interface InventoryItem {
  id: string;
  pc_id: string;
  item_name?: string;
  quantity?: number;
  description?: string;
  created_at?: string;
}

// Status Effect for PC
export interface StatusEffect extends BaseEntity {
  pc_id: string; // Reference to PC
  description?: string;
  is_active?: boolean; // Whether the status is currently active
}

// Player Character (PC)
export interface PC extends BaseEntity {
  player_name?: string;
  class?: string;
  level?: number;
  race?: string;
  hp?: number;
  ac?: number;
  notes?: string;
  inventory?: InventoryItem[];
  statuses?: StatusEffect[];
  telegram_chat_id: string,
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
  date?: string; // YYYY-MM-DD format
  description?: string;
  npc_ids: string[]; // references to NPCs
  pc_ids: string[]; // references to PCs (saved as pc_ids in DB)
  twist_ids: string[]; // references to Twists
  notes?: string;
}

// Input type for Session creation/editing
export type SessionInput = Omit<Session, 'id' | 'created_at' | 'updated_at'>;

export interface Location {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
}

export type LocationInput = Omit<Location, 'id' | 'created_at'>;

// Quirky NPC - generator for "Пьяный Трактирщик" (The Drunk Innkeeper)
export interface QuirkyNPC {
  id: string;
  name: string;
  background: string; // former profession
  physicalQuirk: string; // physical oddity
  smell: string; // distinctive smell
  speechPattern: string; // speech peculiarity
  secretTrade: string; // what they actually trade
  lyingAbout: string; // what they lie about
  mood: 'drunk' | 'paranoid' | 'nostalgic' | 'aggressive';
}

// Template arrays for QuirkyNPC generator
export interface QuirkTemplate {
  backgrounds: string[];
  physicalQuirks: string[];
  smells: string[];
  speechPatterns: string[];
  secretTrades: string[];
  lies: string[];
}

// Input type for QuirkyNPC creation/editing
export type QuirkyNPCInput = Omit<QuirkyNPC, 'id'>;

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

  // Inventory actions
  addInventoryItem: (pcId: string, item: Partial<InventoryItem>) => Promise<void>;
  deleteInventoryItem: (itemId: string) => Promise<void>;
  loadInventoryForPc: (pcId: string) => Promise<void>;

  // Status Effect actions
  addStatus: (pcId: string, statusData: Partial<StatusEffect>) => Promise<void>;
  deleteStatus: (statusId: string) => Promise<void>;

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

  // Location actions
  locations: Location[];
  addLocation: (location: LocationInput) => Promise<void>;
  deleteLocation: (id: string) => Promise<void>;
  loadLocations: () => Promise<void>;

  // Utility
  loadFromSupabase: () => Promise<void>;
  clearAll: () => Promise<void>;
  searchEntities: (query: string) => SearchResult[];
}
