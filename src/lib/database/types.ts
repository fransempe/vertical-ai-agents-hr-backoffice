
export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Meet {
  id: string;
  candidate_id: string;
  jd_interviews_id?: string;
  token: string;
  link: string;
  password: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  scheduled_at?: string;
  created_at: string;
  updated_at: string;
  candidate?: {
    name: string;
    email: string;
  };
  jd_interviews?: {
    interview_name: string;
    agent_id: string;
  };
}

export interface Conversation {
  id: string;
  meet_id: string;
  candidate_id: string;
  conversation_data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Agent {
  id: string;
  agent_id: string;
  name: string;
  tech_stack: string;
  description?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface JdInterview {
  id: string;
  agent_id: string;
  interview_name: string;
  job_description: string;
}

export interface DatabaseProvider {

  // Candidates
  createCandidate(candidate: Omit<Candidate, 'id' | 'created_at' | 'updated_at'>): Promise<Candidate>;
  getCandidates(): Promise<Candidate[]>;
  getCandidate(id: string): Promise<Candidate | null>;
  updateCandidate(id: string, updates: Partial<Candidate>): Promise<Candidate>;
  deleteCandidate(id: string): Promise<boolean>;

  // Meets
  createMeet(meet: Omit<Meet, 'id' | 'token' | 'link' | 'password' | 'created_at' | 'updated_at' | 'candidate' | 'jd_interviews'>): Promise<Meet>;
  getMeets(): Promise<Meet[]>;
  getMeet(id: string): Promise<Meet | null>;
  getMeetByToken(token: string): Promise<Meet | null>;
  updateMeet(id: string, updates: Partial<Meet>): Promise<Meet>;
  deleteMeet(id: string): Promise<boolean>;

  // Conversations
  createConversation(conversation: Omit<Conversation, 'id' | 'created_at' | 'updated_at'>): Promise<Conversation>;
  getConversations(): Promise<Conversation[]>;
  getConversation(id: string): Promise<Conversation | null>;
  getConversationsByMeetId(meetId: string): Promise<Conversation[]>;
  getConversationsByCandidateId(candidateId: string): Promise<Conversation[]>;
  updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation>;
  deleteConversation(id: string): Promise<boolean>;

  // Agents
  createAgent(agent: Omit<Agent, 'id' | 'created_at' | 'updated_at'>): Promise<Agent>;
  getAgents(): Promise<Agent[]>;
  getAgent(id: string): Promise<Agent | null>;
  getAgentByAgentId(agentId: string): Promise<Agent | null>;
  updateAgent(id: string, updates: Partial<Agent>): Promise<Agent>;
  deleteAgent(id: string): Promise<boolean>;

  // JD Interviews
  getJdInterviews(): Promise<JdInterview[]>;
  getJdInterview(id: string): Promise<JdInterview | null>;
}