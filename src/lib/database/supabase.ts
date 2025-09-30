import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseProvider, Candidate, Meet, Conversation, Agent } from './types';
import { generateRandomPassword } from '../utils/password';

export class SupabaseProvider implements DatabaseProvider {
  private client: SupabaseClient;

  constructor(url: string, anonKey: string) {
    this.client = createClient(url, anonKey);
  }

  // Candidates
  async createCandidate(candidate: Omit<Candidate, 'id' | 'created_at' | 'updated_at'>): Promise<Candidate> {
    const { data, error } = await this.client
      .from('candidates')
      .insert({
        id: uuidv4(),
        ...candidate,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getCandidates(): Promise<Candidate[]> {
    const { data, error } = await this.client
      .from('candidates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getCandidate(id: string): Promise<Candidate | null> {
    const { data, error } = await this.client
      .from('candidates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  }

  async updateCandidate(id: string, updates: Partial<Candidate>): Promise<Candidate> {
    const { data, error } = await this.client
      .from('candidates')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteCandidate(id: string): Promise<boolean> {
    const { error } = await this.client
      .from('candidates')
      .delete()
      .eq('id', id);

    return !error;
  }

  // Meets
  async createMeet(meet: Omit<Meet, 'id' | 'token' | 'link' | 'password' | 'created_at' | 'updated_at'>): Promise<Meet> {
    const id = uuidv4();
    const token = uuidv4();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
    const link = `${baseUrl}/?token=${token}&meet_id=${id}`;
    
    // Generate random password
    const password = generateRandomPassword(15);

    const { data, error } = await this.client
      .from('meets')
      .insert({
        id,
        token,
        link,
        password,
        ...meet,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getMeets(): Promise<Meet[]> {
    const { data, error } = await this.client
      .from('meets')
      .select(`
        *,
        candidate:candidates(name, email)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getMeet(id: string): Promise<Meet | null> {
    const { data, error } = await this.client
      .from('meets')
      .select(`
        *,
        candidate:candidates(name, email)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) return null;
    return data;
  }

  async getMeetByToken(token: string): Promise<Meet | null> {
    const { data, error } = await this.client
      .from('meets')
      .select(`
        *,
        candidate:candidates(name, email)
      `)
      .eq('token', token)
      .maybeSingle();

    if (error) return null;
    return data;
  }

  async updateMeet(id: string, updates: Partial<Meet>): Promise<Meet> {
    const { data, error } = await this.client
      .from('meets')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteMeet(id: string): Promise<boolean> {
    const { error } = await this.client
      .from('meets')
      .delete()
      .eq('id', id);

    return !error;
  }

  // Conversations
  async createConversation(conversation: Omit<Conversation, 'id' | 'created_at' | 'updated_at'>): Promise<Conversation> {
    const { data, error } = await this.client
      .from('conversations')
      .insert({
        id: uuidv4(),
        ...conversation,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getConversations(): Promise<Conversation[]> {
    const { data, error } = await this.client
      .from('conversations')
      .select(`
        *,
        meet:meets(id, token, status),
        candidate:candidates(name, email)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getConversation(id: string): Promise<Conversation | null> {
    const { data, error } = await this.client
      .from('conversations')
      .select(`
        *,
        meet:meets(id, token, status),
        candidate:candidates(name, email)
      `)
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  }

  async getConversationsByMeetId(meetId: string): Promise<Conversation[]> {
    const { data, error } = await this.client
      .from('conversations')
      .select(`
        *,
        meet:meets(id, token, status),
        candidate:candidates(name, email)
      `)
      .eq('meet_id', meetId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getConversationsByCandidateId(candidateId: string): Promise<Conversation[]> {
    const { data, error } = await this.client
      .from('conversations')
      .select(`
        *,
        meet:meets(id, token, status),
        candidate:candidates(name, email)
      `)
      .eq('candidate_id', candidateId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation> {
    const { data, error } = await this.client
      .from('conversations')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteConversation(id: string): Promise<boolean> {
    const { error } = await this.client
      .from('conversations')
      .delete()
      .eq('id', id);

    return !error;
  }

  // Agents
  async createAgent(agent: Omit<Agent, 'id' | 'created_at' | 'updated_at'>): Promise<Agent> {
    const { data, error } = await this.client
      .from('agents')
      .insert({
        id: uuidv4(),
        ...agent,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getAgents(): Promise<Agent[]> {
    const { data, error } = await this.client
      .from('agents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getAgent(id: string): Promise<Agent | null> {
    const { data, error } = await this.client
      .from('agents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  }

  async getAgentByAgentId(agentId: string): Promise<Agent | null> {
    const { data, error } = await this.client
      .from('agents')
      .select('*')
      .eq('agent_id', agentId)
      .single();

    if (error) return null;
    return data;
  }

  async updateAgent(id: string, updates: Partial<Agent>): Promise<Agent> {
    const { data, error } = await this.client
      .from('agents')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteAgent(id: string): Promise<boolean> {
    const { error } = await this.client
      .from('agents')
      .delete()
      .eq('id', id);

    return !error;
  }
}