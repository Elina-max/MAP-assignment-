// Import only what we need from Supabase, avoiding the realtime functionality
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://ydfdjhbxaoqzhangllsx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkZmRqaGJ4YW9xemhhbmdsbHN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5OTA5NTMsImV4cCI6MjA2MjU2Njk1M30.XmgG9DfmCu6ijhmUkSNC4GGQgzNn12lTMylO7Z_cwaQ';

// Create the Supabase client with realtime functionality completely disabled
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storage: AsyncStorage,
    autoRefreshToken: true,
    detectSessionInUrl: false
  },
  global: {
    headers: { 'x-application-name': 'namibia-hockey-app' },
  },
  // Explicitly disable realtime to avoid WebSocket dependencies
  realtime: {
    params: {
      eventsPerSecond: 0
    }
  }
});

// Define database types
export interface Team {
  id?: string;
  name: string;
  division: string;
  coach: string;
  players_count?: number;
  created_at?: string;
}

export interface Player {
  id?: string;
  name: string;
  team: string;
  team_id?: string;
  position: string;
  goals?: number;
  assists?: number;
  yellow_cards?: number;
  red_cards?: number;
  image?: string;
  created_at?: string;
}

export interface Event {
  id?: string;
  title: string;
  date: string;
  location: string;
  description?: string;
  image?: string;
  registration_deadline: string;
  status: string;
  created_at?: string;
}

// Team operations
export const teamService = {
  async getTeams(): Promise<Team[]> {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching teams:', error);
      return [];
    }
    
    return data || [];
  },
  
  async getTeamById(id: string): Promise<Team | null> {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`Error fetching team with id ${id}:`, error);
      return null;
    }
    
    return data;
  },
  
  async createTeam(team: Team): Promise<Team | null> {
    const { data, error } = await supabase
      .from('teams')
      .insert([team])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating team:', error);
      return null;
    }
    
    return data;
  },
  
  async updateTeam(id: string, updates: Partial<Team>): Promise<Team | null> {
    const { data, error } = await supabase
      .from('teams')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error(`Error updating team with id ${id}:`, error);
      return null;
    }
    
    return data;
  },
  
  async deleteTeam(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`Error deleting team with id ${id}:`, error);
      return false;
    }
    
    return true;
  }
};

// Player operations
export const playerService = {
  async getPlayers(): Promise<Player[]> {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching players:', error);
      return [];
    }
    
    return data || [];
  },
  
  async getPlayersByTeam(teamId: string): Promise<Player[]> {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('team_id', teamId)
      .order('name');
    
    if (error) {
      console.error(`Error fetching players for team ${teamId}:`, error);
      return [];
    }
    
    return data || [];
  },
  
  async getPlayerById(id: string): Promise<Player | null> {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`Error fetching player with id ${id}:`, error);
      return null;
    }
    
    return data;
  },
  
  async createPlayer(player: Player): Promise<Player | null> {
    const { data, error } = await supabase
      .from('players')
      .insert([player])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating player:', error);
      return null;
    }
    
    return data;
  },
  
  async updatePlayer(id: string, updates: Partial<Player>): Promise<Player | null> {
    const { data, error } = await supabase
      .from('players')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error(`Error updating player with id ${id}:`, error);
      return null;
    }
    
    return data;
  },
  
  async deletePlayer(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('players')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`Error deleting player with id ${id}:`, error);
      return false;
    }
    
    return true;
  }
};

// Event operations
export const eventService = {
  async getEvents(): Promise<Event[]> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date');
    
    if (error) {
      console.error('Error fetching events:', error);
      return [];
    }
    
    return data || [];
  },
  
  async getUpcomingEvents(): Promise<Event[]> {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('date', today)
      .order('date');
    
    if (error) {
      console.error('Error fetching upcoming events:', error);
      return [];
    }
    
    return data || [];
  },
  
  async getEventById(id: string): Promise<Event | null> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`Error fetching event with id ${id}:`, error);
      return null;
    }
    
    return data;
  },
  
  async createEvent(event: Event): Promise<Event | null> {
    const { data, error } = await supabase
      .from('events')
      .insert([event])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating event:', error);
      return null;
    }
    
    return data;
  },
  
  async updateEvent(id: string, updates: Partial<Event>): Promise<Event | null> {
    const { data, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error(`Error updating event with id ${id}:`, error);
      return null;
    }
    
    return data;
  },
  
  async deleteEvent(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`Error deleting event with id ${id}:`, error);
      return false;
    }
    
    return true;
  },
  
  async registerForEvent(eventId: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('event_registrations')
      .insert([{ event_id: eventId, user_id: userId }]);
    
    if (error) {
      console.error(`Error registering for event ${eventId}:`, error);
      return false;
    }
    
    return true;
  }
};
