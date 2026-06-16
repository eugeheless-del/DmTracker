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

export type ConditionType = 'LOCATION' | 'NPC' | 'ITEM' | 'CUSTOM';

export interface TwistCondition {
  id: string;
  type: ConditionType;
  label: string;
  isMet: boolean;
}

export type NPCConnectionType = 'involved' | 'victim' | 'culprit' | 'witness';

export interface NPCTwistConnection {
  id: string;
  npc_id: string;
  twist_id: string;
  connection_type: NPCConnectionType;
  description?: string;
  created_at: string;
  npc?: NPC; // Для удобства при загрузке с JOIN
  twist?: Twist;
}

// Non-Player Character (NPC)
export interface NPC extends BaseEntity {
  role?: string;
  appearance?: string;
  notes?: string;
  location?: string;
  status?: 'alive' | 'dead' | 'missing';
  twist_connections?: NPCTwistConnection[];
  owned_items?: string[];
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
  conditions?: TwistCondition[];
  isReady?: boolean;
  connected_npcs?: NPCTwistConnection[];
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
  user_id: string;
  name: string;
  description?: string;
  image_url?: string;
  linked_npc_ids: string[];
  created_at?: string;
  updated_at?: string;
}

export interface MapItem {
  id: string;
  name: string;
  image_url: string;
  description?: string;
  created_at?: string;
}

export interface MapPin {
  id: string;
  map_id: string;
  location_id: string;
  x_coord: number;
  y_coord: number;
  location?: Location; // Подтягиваем данные локации для отображения
}

export type LocationInput = Omit<Location, 'id' | 'user_id' | 'created_at' | 'updated_at'> & {
  linked_npc_ids?: string[];
  file?: File;
};

export type EventType = 'quest' | 'combat' | 'travel' | 'downtime' | 'npc' | 'other';

export interface TimelineEvent {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  event_date: string; // YYYY-MM-DD
  event_type: EventType;
  completed: boolean;
  npc_ids: string[];
  created_at?: string;
  updated_at?: string;
}

export type CharacterFormType = 'pc' | 'npc';

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
  npcTwistConnections: NPCTwistConnection[];

  // NPC actions
  addNpc: (npc: Omit<NPC, 'id' | 'created_at' | 'updated_at'>) => Promise<NPC>;
  updateNpc: (id: string, data: Partial<Omit<NPC, 'id' | 'created_at'>>) => Promise<void>;
  deleteNpc: (id: string) => Promise<void>;
  getNpcById: (id: string) => NPC | undefined;
  addNPCTwistConnection: (
    npcId: string,
    twistId: string,
    connectionType: NPCConnectionType,
    description?: string
  ) => Promise<NPCTwistConnection>;
  removeNPCTwistConnection: (connectionId: string) => Promise<void>;
  loadTwistConnections: (twistId: string) => Promise<NPCTwistConnection[]>;
  loadNPCConnections: (npcId: string) => Promise<NPCTwistConnection[]>;
  addNPCItem: (npcId: string, itemName: string, description?: string) => Promise<void>;

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
  addCondition: (twistId: string, condition: Omit<TwistCondition, 'id'>) => Promise<void>;
  toggleCondition: (twistId: string, conditionId: string) => Promise<void>;
  checkTwistStatus: (twistId: string) => Promise<void>;

  // Session actions
  addSession: (session: Omit<Session, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateSession: (id: string, data: Partial<Omit<Session, 'id' | 'created_at'>>) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  getSessionById: (id: string) => Session | undefined;

  // Location actions
  locations: Location[];
  selectedLocationId: string | null;
  fetchLocations: () => Promise<void>;
  addLocation: (location: LocationInput) => Promise<void>;
  updateLocation: (
    id: string,
    data: Partial<Omit<Location, 'id' | 'user_id' | 'created_at' | 'updated_at'>> & { file?: File }
  ) => Promise<void>;
  deleteLocation: (id: string) => Promise<void>;
  uploadLocationImage: (userId: string, locationId: string, file: File) => Promise<string>;
  deleteLocationImage: (filePath: string) => Promise<void>;
  getLocationImageUrl: (imagePath: string) => string;
  toggleNpcInLocation: (locationId: string, npcId: string) => Promise<void>;
  loadLocations: () => Promise<void>;

  // Map actions
  maps: MapItem[];
  activeMap: MapItem | null;
  mapPins: MapPin[];
  isMapEditMode: boolean;
  mapsLoading: boolean;
  mapsError: Error | null;
  fetchMaps: () => Promise<void>;
  uploadMapImage: (userId: string, mapId: string, file: File) => Promise<string>;
  deleteMapImage: (filePath: string) => Promise<void>;
  getMapImageUrl: (imagePath: string) => string;
  addMap: (name: string, imageUrl: string, file?: File) => Promise<MapItem>;
  updateMap: (id: string, data: Partial<Omit<MapItem, 'id' | 'created_at'>> & { file?: File }) => Promise<MapItem>;
  deleteMap: (id: string) => Promise<void>;
  fetchMapPins: (mapId: string) => Promise<void>;
  addPin: (mapId: string, locationId: string, x: number, y: number) => Promise<MapPin>;
  deletePin: (pinId: string) => Promise<void>;
  setActiveMap: (map: MapItem | null) => void;
  toggleMapEditMode: () => void;

  // Timeline event actions
  events: TimelineEvent[];
  selectedDate: string; // YYYY-MM-DD
  calendarMonth: number; // 0-11
  calendarYear: number;
  eventSearchQuery: string;
  isEventModalOpen: boolean;
  editingEvent: TimelineEvent | null;
  timelineEventsLoaded: boolean;
  fetchEvents: () => Promise<void>;
  addEvent: (eventData: Omit<TimelineEvent, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<TimelineEvent>;
  updateEvent: (id: string, data: Partial<Omit<TimelineEvent, 'id' | 'created_at' | 'updated_at' | 'user_id'>>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  setSelectedDate: (date: string) => void;
  changeCalendarMonth: (offset: -1 | 1) => void;
  setEventSearchQuery: (query: string) => void;
  openEventModal: (event?: TimelineEvent) => void;
  closeEventModal: () => void;
  filteredEventsByDate: () => TimelineEvent[];

  // Global hotkey UI state
  showHotkeysHelp: boolean;
  showCharacterForm: boolean;
  characterFormType: CharacterFormType;
  showTwistForm: boolean;
  showSessionForm: boolean;
  openCharacterForm: (type: CharacterFormType) => void;
  closeCharacterForm: () => void;
  openTwistForm: () => void;
  closeTwistForm: () => void;
  openSessionForm: () => void;
  closeSessionForm: () => void;
  openHotkeysHelp: () => void;
  closeHotkeysHelp: () => void;
  toggleHotkeysHelp: () => void;

  // Utility
  loadFromSupabase: () => Promise<void>;
  clearAll: () => Promise<void>;
  searchEntities: (query: string) => SearchResult[];
}
