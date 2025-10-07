import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseProvider, Candidate, Meet, Conversation, Agent, JdInterview } from './types';
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
        candidate:candidates(name, email),
        jd_interviews:jd_interviews(id, agent_id, interview_name, job_description)
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
        candidate:candidates(name, email),
        jd_interviews:jd_interviews(id, agent_id, interview_name, job_description)
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
        candidate:candidates(name, email),
        jd_interviews:jd_interviews(id, agent_id, interview_name, job_description)
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

  // JD Interviews
  async getJdInterviews(): Promise<JdInterview[]> {
    const { data, error } = await this.client
      .from('jd_interviews')
      .select('id, agent_id, interview_name, job_description');

    if (error) throw error;
    return data || [];
  }

  async getJdInterview(id: string): Promise<JdInterview | null> {
    const { data, error } = await this.client
      .from('jd_interviews')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  }

  async getMeetsByJdInterviews(): Promise<{ jd_interview: JdInterview; meets: Meet[] }[]> {
    // First get all JD interviews
    const { data: jdInterviews, error: jdError } = await this.client
      .from('jd_interviews')
      .select('id, agent_id, interview_name, job_description');

    if (jdError) throw jdError;

    // Then get meets for each JD interview
    const result: { jd_interview: JdInterview; meets: Meet[] }[] = [];
    for (const jdInterview of jdInterviews || []) {
      const { data: meets, error: meetsError } = await this.client
        .from('meets')
        .select(`
          id,
          candidate_id,
          jd_interviews_id,
          token,
          link,
          password,
          status,
          scheduled_at,
          created_at,
          updated_at,
          candidates(name, email)
        `)
        .eq('jd_interviews_id', jdInterview.id);

      if (meetsError) throw meetsError;

      // Transform the data to match our Meet interface
      const transformedMeets: Meet[] = (meets || []).map((meet) => ({
        id: meet.id,
        candidate_id: meet.candidate_id,
        jd_interviews_id: meet.jd_interviews_id,
        token: meet.token,
        link: meet.link,
        password: meet.password,
        status: meet.status as 'pending' | 'active' | 'completed' | 'cancelled',
        scheduled_at: meet.scheduled_at,
        created_at: meet.created_at,
        updated_at: meet.updated_at,
        candidate: meet.candidates ? (() => {
          
          const candidates = meet.candidates;
          if (Array.isArray(candidates)) {
            // If it's an array, take the first candidate's info
            return candidates[0] ? { name: candidates[0].name, email: candidates[0].email } : undefined;
          } else {
            // If it's a single object (and not null, as checked by `meet.candidates ?`)
            // Explicitly assert the type of 'candidates' to a single object to resolve the 'never' type error.
            const singleCandidate = candidates as { name: string; email: string; };
            return { name: singleCandidate.name, email: singleCandidate.email };
          }
        })() : undefined, 
        jd_interviews: {
          interview_name: jdInterview.interview_name,
          agent_id: jdInterview.agent_id
        }
      }));

      result.push({
        jd_interview: {
          id: jdInterview.id,
          agent_id: jdInterview.agent_id,
          interview_name: jdInterview.interview_name,
          job_description: jdInterview.job_description
        },
        meets: transformedMeets
      });
    }

    return result;
  }
}