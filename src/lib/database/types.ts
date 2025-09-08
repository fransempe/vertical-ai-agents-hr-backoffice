
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
}

export interface Conversation {
  id: string;
  meet_id: string;
  candidate_id: string;
  conversation_data: any;
  created_at: string;
  updated_at: string;
}

export interface DatabaseProvider {

  // Candidates
  createCandidate(candidate: Omit<Candidate, 'id' | 'created_at' | 'updated_at'>): Promise<Candidate>;
  getCandidates(): Promise<Candidate[]>;
  getCandidate(id: string): Promise<Candidate | null>;
  updateCandidate(id: string, updates: Partial<Candidate>): Promise<Candidate>;
  deleteCandidate(id: string): Promise<boolean>;

  // Meets
  createMeet(meet: Omit<Meet, 'id' | 'token' | 'link' | 'password' | 'created_at' | 'updated_at'>): Promise<Meet>;
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
}