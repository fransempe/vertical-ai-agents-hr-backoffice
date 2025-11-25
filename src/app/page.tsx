'use client';

import { useState, useEffect } from 'react';
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toast } from '@/components/ui/toast';
import { Candidate, Meet, Conversation, Agent, JdInterview } from '@/lib/database/types';
import { 
  RiExternalLinkLine, 
  RiDeleteBinLine, 
  RiLinkM,
  RiUserLine,
  RiTeamLine,
  RiClipboardLine,
  RiMailLine,
  RiCalendarLine,
  RiBarChartLine,
  RiCheckLine,
  RiChat3Line,
  RiRobotLine,
  RiRocketLine,
  RiFolderLine,
  RiArrowRightSLine,
  RiStarLine,
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiUploadLine,
  RiMagicLine,
  RiCalendarEventLine,
  RiCalendarCheckLine,
  RiFileChartLine,
  RiCloseLine,
} from 'react-icons/ri';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { BodyCreateAgentV1ConvaiAgentsCreatePost } from '@elevenlabs/elevenlabs-js/api/resources/conversationalAi/resources/agents/client/requests/BodyCreateAgentV1ConvaiAgentsCreatePost';

export default function Home() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'candidates' | 'meets' | 'conversations' | 'bulk-upload' | 'agents' | 'reports'>('reports');
  
  // Available technologies for multi-select
  const availableTechnologies = [
    'React', 'Angular', 'Vue.js', 'JavaScript', 'TypeScript',
    'Node.js', 'Python', 'Java', 'C#', 'PHP',
    'Go', 'Rust', 'Swift', 'Kotlin', 'Flutter',
    'React Native', 'MongoDB', 'PostgreSQL', 'MySQL',
    'AWS', 'Azure', 'Docker', 'Kubernetes', 'Git'
  ];
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [meets, setMeets] = useState<Meet[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [jdInterviews, setJdInterviews] = useState<JdInterview[]>([]);
  const [meetsByJdInterviews, setMeetsByJdInterviews] = useState<{ jd_interview: JdInterview; meets: Meet[] }[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [expandedReports, setExpandedReports] = useState<Set<string>>(new Set());
  const [candidateCreationTab, setCandidateCreationTab] = useState<'manual' | 'cv'>('cv');
  const [interviewSchedulingTab, setInterviewSchedulingTab] = useState<'ai' | 'manual'>('ai');
  const [scheduledInterviewsCollapsed, setScheduledInterviewsCollapsed] = useState(false);
  const [aiMatches, setAiMatches] = useState<Array<{
    id: string;
    candidate: { name: string; email: string; tech_stack?: string[] };
    jd_interview: { interview_name: string; agent_id: string; id: string };
    match_score: number;
    match_analysis: string;
  }>>([]);
  const [showAiMatches, setShowAiMatches] = useState(false);
  const [expandedAgents, setExpandedAgents] = useState<Set<string>>(new Set());
  const [meetForm, setMeetForm] = useState({ candidate_id: '', jd_interviews_id: '', scheduled_at: '' });
  const [candidateForm, setCandidateForm] = useState({ name: '', email: '', phone: '', cv_file: null as File | null, tech_stack: [] as string[] });
  const [cvOnlyForm, setCvOnlyForm] = useState({ cv_file: null as File | null });
  const [bulkUploadForm, setBulkUploadForm] = useState({ file: null as File | null });
  const [agentForm, setAgentForm] = useState({ agent_id: '', name: '', tech_stack: '', description: '', status: 'active' as 'active' | 'inactive' });
  const [elevenLabsForm, setElevenLabsForm] = useState({ name: '', prompt: '', firstMessage: '', additionalConfig: '' });
  
  const [loading, setLoading] = useState({ candidates: false, meets: false, conversations: false, agents: false, jdInterviews: false, meetsByJdInterviews: false, createCandidate: false, createMeet: false, sendEmail: false, bulkUpload: false, createAgent: false, uploadCV: false, processingCV: false, aiMatching: false, createElevenLabsAgent: false });
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  const [selectedMeetForReport, setSelectedMeetForReport] = useState<Meet | null>(null);
  const [evaluationData, setEvaluationData] = useState<{
    conversation_analysis?: {
      soft_skills?: Record<string, string>;
      technical_assessment?: {
        knowledge_level?: string;
        practical_experience?: string;
        completeness_summary?: {
          total_questions?: number;
          fully_answered?: number;
          partially_answered?: number;
          not_answered?: number;
        };
        alerts?: string[];
        technical_questions?: Array<{
          question: string;
          answer: string;
          answered: string;
          evaluation: string;
        }>;
      };
    };
    match_evaluation?: {
      compatibility_score?: number;
      final_recommendation?: string;
      justification?: string;
      strengths?: string[];
      concerns?: string[];
      technical_match?: {
        exact_matches?: string[];
        partial_matches?: string[];
        critical_gaps?: string[];
      };
    };
  } | null>(null);
  const [loadingEvaluation, setLoadingEvaluation] = useState(false);

  useEffect(() => {
    fetchCandidates();
    fetchMeets();
    fetchConversations();
    fetchAgents();
    fetchJdInterviews();
    fetchMeetsByJdInterviews();
  }, []);


  const fetchCandidates = async () => {
    setLoading(prev => ({ ...prev, candidates: true }));
    try {
      const response = await fetch('/api/candidates');
      if (response.ok) {
        const data = await response.json();
        setCandidates(data);
      }
    } catch (error) {
      console.error('Error fetching candidates:', error);
    } finally {
      setLoading(prev => ({ ...prev, candidates: false }));
    }
  };

  const fetchMeets = async () => {
    setLoading(prev => ({ ...prev, meets: true }));
    try {
      const response = await fetch('/api/meets');
      if (response.ok) {
        const data = await response.json();
        setMeets(data);
      }
    } catch (error) {
      console.error('Error fetching meets:', error);
    } finally {
      setLoading(prev => ({ ...prev, meets: false }));
    }
  };

  const fetchConversations = async () => {
    setLoading(prev => ({ ...prev, conversations: true }));
    try {
      const response = await fetch('/api/conversations');
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(prev => ({ ...prev, conversations: false }));
    }
  };

  const fetchAgents = async () => {
    setLoading(prev => ({ ...prev, agents: true }));
    try {
      const response = await fetch('/api/agents');
      if (response.ok) {
        const data = await response.json();
        setAgents(data);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(prev => ({ ...prev, agents: false }));
    }
  };

  const fetchJdInterviews = async () => {
    setLoading(prev => ({ ...prev, jdInterviews: true }));
    try {
      const response = await fetch('/api/jd-interviews');
      if (response.ok) {
        const data = await response.json();
        setJdInterviews(data);
      } else {
        const errorData = await response.json();
        setToast({ message: `Failed to load JD interviews: ${errorData.error}`, type: 'error' });
      }
    } catch (error) {
      console.error('Error fetching JD interviews:', error);
      setToast({ message: 'Error fetching JD interviews', type: 'error' });
    } finally {
      setLoading(prev => ({ ...prev, jdInterviews: false }));
    }
  };

  const fetchMeetsByJdInterviews = async () => {
    setLoading(prev => ({ ...prev, meetsByJdInterviews: true }));
    try {
      const response = await fetch('/api/meets/by-jd-interviews');
      if (response.ok) {
        const data = await response.json();
        setMeetsByJdInterviews(data);
      } else {
        const errorData = await response.json();
        setToast({ message: `Failed to load reports data: ${errorData.error}`, type: 'error' });
      }
    } catch (error) {
      console.error('Error fetching meets by JD interviews:', error);
      setToast({ message: 'Error fetching reports data', type: 'error' });
    } finally {
      setLoading(prev => ({ ...prev, meetsByJdInterviews: false }));
    }
  };



  const uploadCV = async (file: File, candidateName: string): Promise<{ url: string; fileName: string } | null> => {
    setLoading(prev => ({ ...prev, uploadCV: true }));
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('candidateName', candidateName);

      const response = await fetch('/api/upload/cv', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        return { url: data.url, fileName: data.fileName };
      } else {
        const errorData = await response.json();
        setToast({ message: errorData.error || 'Failed to upload CV', type: 'error' });
        return null;
      }
    } catch (error) {
      console.error('Error uploading CV:', error);
      setToast({ message: 'Failed to upload CV', type: 'error' });
      return null;
    } finally {
      setLoading(prev => ({ ...prev, uploadCV: false }));
    }
  };

  const createCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, createCandidate: true }));
    try {
      let cv_url = null;

      // Upload CV if file is selected
      if (candidateForm.cv_file) {
        if (!candidateForm.name.trim()) {
          setToast({ message: 'Candidate name is required to upload CV', type: 'error' });
          return;
        }
        const uploadResult = await uploadCV(candidateForm.cv_file, candidateForm.name);
        if (!uploadResult) {
          // If CV upload failed, don't create candidate
          return;
        }
        cv_url = uploadResult.url;
      }

      // Create candidate data
      const candidateData = {
        name: candidateForm.name,
        email: candidateForm.email,
        phone: candidateForm.phone,
        tech_stack: candidateForm.tech_stack,
        ...(cv_url && { cv_url })
      };

      const response = await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(candidateData),
      });
      
      if (response.ok) {
        setCandidateForm({ name: '', email: '', phone: '', cv_file: null, tech_stack: [] });
        fetchCandidates();
        setToast({ message: 'Candidate created successfully!', type: 'success' });
        
        // Reset file input
        const fileInput = document.querySelector('input[type="file"][accept=".pdf,.doc,.docx"]') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        throw new Error('Failed to create candidate');
      }
    } catch (error) {
      console.error('Error creating candidate:', error);
      setToast({ message: 'Failed to create candidate', type: 'error' });
    } finally {
      setLoading(prev => ({ ...prev, createCandidate: false }));
    }
  };

  const uploadCVOnly = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, createCandidate: true }));
    try {
      if (!cvOnlyForm.cv_file) {
        setToast({ message: 'Please select a CV file', type: 'error' });
        return;
      }

      // Generate a unique filename for the CV
      const timestamp = Date.now();
      const tempName = `cv${timestamp}`;
      const uploadResult = await uploadCV(cvOnlyForm.cv_file, tempName);
      
      if (!uploadResult) {
        return;
      }

      // Reset form and file input immediately after upload
      setCvOnlyForm({ cv_file: null });
      const fileInput = document.querySelector('input[type="file"][id="cv-only-upload"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      setToast({ 
        message: 'CV uploaded successfully! Starting AI processing...', 
        type: 'success' 
      });

      // Start background processing with the correct filename
      processCV(uploadResult.url, uploadResult.fileName);
      
    } catch (error) {
      console.error('Error uploading CV:', error);
      setToast({ message: 'Failed to upload CV', type: 'error' });
    } finally {
      setLoading(prev => ({ ...prev, createCandidate: false }));
    }
  };

  const processCV = async (cv_url: string, filename: string) => {
    setLoading(prev => ({ ...prev, processingCV: true }));
    try {
      const response = await fetch('/api/read-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cv_url, filename }),
      });

      if (response.ok) {
        await response.json(); // Consume response but don't store it
        setToast({ 
          message: 'CV processing started! The external system will handle candidate creation.', 
          type: 'info' 
        });
      } else {
        const error = await response.json();
        setToast({ 
          message: `Failed to start CV processing: ${error.error}`, 
          type: 'error' 
        });
      }
    } catch (error) {
      console.error('Error processing CV:', error);
      setToast({ message: 'Failed to start CV processing', type: 'error' });
    } finally {
      setLoading(prev => ({ ...prev, processingCV: false }));
    }
  };


  const createMeet = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, createMeet: true }));
    try {
      const meetData = {
        candidate_id: meetForm.candidate_id,
        ...(meetForm.jd_interviews_id && { jd_interviews_id: meetForm.jd_interviews_id })
      };
      
      const response = await fetch('/api/meets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meetData),
      });
      
      if (response.ok) {    
        setMeetForm({ candidate_id: '', jd_interviews_id: '', scheduled_at: '' });
        fetchMeets();
        setToast({ message: 'Interview scheduled successfully!', type: 'success' });
      } else {
        const errorData = await response.json();
        if (response.status === 409) {
          setToast({ message: errorData.error || 'Ya existe una entrevista programada para este candidato en esta búsqueda.', type: 'error' });
        } else {
          throw new Error(errorData.error || 'Failed to create meet');
        }
      }
    } catch (error) {
      console.error('Error creating meet:', error);
      setToast({ message: 'Failed to schedule interview', type: 'error' });
    } finally {
      setLoading(prev => ({ ...prev, createMeet: false }));
    }
  };


  const deleteMeet = async (id: string) => {
    try {
      const response = await fetch(`/api/meets/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        fetchMeets();
      }
    } catch (error) {
      console.error('Error deleting meet:', error);
    }
  };

  const handleCopyLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopySuccess(link);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkUploadForm.file) {
      setToast({ message: 'Please select a file to upload', type: 'error' });
      return;
    }

    setLoading(prev => ({ ...prev, bulkUpload: true }));
    try {
      const formData = new FormData();
      formData.append('file', bulkUploadForm.file);

      const response = await fetch('/api/candidates/bulk-upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setToast({ 
          message: `${result.message}. Imported: ${result.imported}, Skipped: ${result.skipped}`, 
          type: 'success' 
        });
        setBulkUploadForm({ file: null });
        fetchCandidates(); // Refresh candidates list
        
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        setToast({ 
          message: result.error || 'Upload failed', 
          type: 'error' 
        });
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setToast({ message: 'Upload failed', type: 'error' });
    } finally {
      setLoading(prev => ({ ...prev, bulkUpload: false }));
    }
  };

  const handleSendLink = async (meet: Meet) => {
    setLoading(prev => ({ ...prev, sendEmail: true }));
    try {
      // Find the candidate for this meet
      const candidate = candidates.find(c => c.id === meet.candidate_id);
      
      if (!candidate) {
        setToast({ message: 'Candidate not found', type: 'error' });
        return;
      }

      const emailData = {
        to_email: candidate.email,
        subject: `Enlace a tu entrevista - ${candidate.name}`,
        body: `Hola ${candidate.name},\n\nTu entrevista ha sido programada. Por favor utiliza el siguiente enlace para unirte:\n\n${meet.link}\n\nContraseña: ${meet.password}\n\nSaludos cordiales,\nEquipo de RRHH`
      };

      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      const result = await response.json();

      if (response.ok) {
        setToast({ message: `Email sent successfully to ${candidate.email}`, type: 'success' });
      } else {
        setToast({ message: result.error || 'Failed to send email', type: 'error' });
      }
    } catch (error) {
      console.error('Error sending email:', error);
      setToast({ message: 'Failed to send email', type: 'error' });
    } finally {
      setLoading(prev => ({ ...prev, sendEmail: false }));
    }
  };

  const getCandidateConversations = (candidateId: string) => {
    return conversations.filter(conv => conv.candidate_id === candidateId);
  };

  const getCandidatesWithConversations = () => {
    return candidates.filter(candidate => 
      conversations.some(conv => conv.candidate_id === candidate.id)
    );
  };

  const checkExistingInterview = async (candidateId: string, jdInterviewId: string) => {
    try {
      const response = await fetch(`/api/meets?candidate_id=${candidateId}&jd_interview_id=${jdInterviewId}`);
      if (response.ok) {
        const meets = await response.json();
        return meets.length > 0;
      }
      return false;
    } catch (error) {
      console.error('Error checking existing interviews:', error);
      return false;
    }
  };


  const createAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, createAgent: true }));
    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agentForm),
      });
      if (response.ok) {
        const newAgent = await response.json();
        setAgents(prev => [newAgent, ...prev]);
        setAgentForm({ agent_id: '', name: '', tech_stack: '', description: '', status: 'active' });
        setToast({ message: 'Agent created successfully!', type: 'success' });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create agent');
      }
    } catch (error) {
      console.error('Error creating agent:', error);
      setToast({ message: error instanceof Error ? error.message : 'Failed to create agent', type: 'error' });
    } finally {
      setLoading(prev => ({ ...prev, createAgent: false }));
    }
  };

  const deleteAgent = async (id: string) => {
    try {
      const response = await fetch(`/api/agents/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setAgents(prev => prev.filter(agent => agent.id !== id));
        setToast({ message: 'Agent deleted successfully!', type: 'success' });
      } else {
        throw new Error('Failed to delete agent');
      }
    } catch (error) {
      console.error('Error deleting agent:', error);
      setToast({ message: 'Failed to delete agent', type: 'error' });
    }
  };

  const fetchEvaluationReport = async (candidateId: string, jdInterviewId: string) => {
    setLoadingEvaluation(true);
    setEvaluationData(null);
    try {
      const response = await fetch(`/api/meet-evaluations?candidate_id=${candidateId}&jd_interview_id=${jdInterviewId}`);
      if (response.ok) {
        const data = await response.json();
        setEvaluationData(data.evaluation);
      } else {
        const errorData = await response.json();
        console.error('Error fetching evaluation:', errorData);
        setEvaluationData(null);
      }
    } catch (error) {
      console.error('Error fetching evaluation report:', error);
      setEvaluationData(null);
    } finally {
      setLoadingEvaluation(false);
    }
  };

  // Analytics helper functions
  const getStatusCounts = (meets: Meet[]) => {
    return meets.reduce((acc, meet) => {
      acc[meet.status] = (acc[meet.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };

  const getTotalMeets = () => {
    return meetsByJdInterviews.reduce((total, group) => total + group.meets.length, 0);
  };

  const getOverallStatusCounts = () => {
    const allMeets = meetsByJdInterviews.flatMap(group => group.meets);
    return getStatusCounts(allMeets);
  };

  const getStatusPercentage = (status: string, total: number) => {
    const overallCounts = getOverallStatusCounts();
    return total > 0 ? ((overallCounts[status] || 0) / total * 100).toFixed(1) : '0.0';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'active': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return t('interviews.pending');
      case 'active': return t('interviews.active');
      case 'completed': return t('interviews.completed');
      case 'cancelled': return t('interviews.cancelled');
      default: return status;
    }
  };

  const toggleReportExpansion = (jdInterviewId: string) => {
    setExpandedReports(prev => {
      const newSet = new Set(prev);
      if (newSet.has(jdInterviewId)) {
        newSet.delete(jdInterviewId);
      } else {
        newSet.add(jdInterviewId);
      }
      return newSet;
    });
  };

  const toggleAllReports = () => {
    if (expandedReports.size === meetsByJdInterviews.length) {
      // All are expanded, collapse all
      setExpandedReports(new Set());
    } else {
      // Some or none are expanded, expand all
      setExpandedReports(new Set(meetsByJdInterviews.map(group => group.jd_interview.id)));
    }
  };

  const toggleAgentExpansion = (agentId: string) => {
    setExpandedAgents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(agentId)) {
        newSet.delete(agentId);
      } else {
        newSet.add(agentId);
      }
      return newSet;
    });
  };

  const processAIMatching = async () => {
    setLoading(prev => ({ ...prev, aiMatching: true }));
    try {
      const response = await fetch('/api/processes/match-candidates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process AI matching');
      }

      const data = await response.json();
      
      // Transform the API response to match our component structure
      const transformedMatches = data.matches.flatMap((match: { candidate: { id: string; name: string; email: string; tech_stack?: string[] }; matching_interviews: { jd_interviews: { interview_name: string; agent_id: string; id: string }; compatibility_score: number; match_analysis: string }[] }) => 
        match.matching_interviews.map((interview: { jd_interviews: { interview_name: string; agent_id: string; id: string }; compatibility_score: number; match_analysis: string }) => ({
          id: `${match.candidate.id}-${interview.jd_interviews.id}`,
          candidate: {
            name: match.candidate.name,
            email: match.candidate.email,
            tech_stack: match.candidate.tech_stack || []
          },
          jd_interview: {
            interview_name: interview.jd_interviews.interview_name,
            agent_id: interview.jd_interviews.agent_id,
            id: interview.jd_interviews.id
          },
          match_score: interview.compatibility_score,
          match_analysis: interview.match_analysis
        }))
      );
      
      setAiMatches(transformedMatches);
      setShowAiMatches(true);
      setToast({ 
        message: `${data.message}. Encontrados ${transformedMatches.length} matches potenciales.`, 
        type: 'success' 
      });
    } catch (error) {
      console.error('Error processing AI matching:', error);
      setToast({ message: 'Failed to process AI matching', type: 'error' });
    } finally {
      setLoading(prev => ({ ...prev, aiMatching: false }));
    }
  };

  const createCombinedAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, createAgent: true }));
    try {
      // Step 1: Create agent in Eleven Labs
      const elevenLabsData: BodyCreateAgentV1ConvaiAgentsCreatePost = {
        name: elevenLabsForm.name,
        conversationConfig: {
          agent: {
            firstMessage: elevenLabsForm.firstMessage,
            prompt: {
              prompt: elevenLabsForm.prompt,
              llm: "gemini-2.5-flash"
            },
            language: "es",
          },
          tts: { 
            modelId: "eleven_flash_v2_5",
            voiceId: "bN1bDXgDIGX5lw0rtY2B", // Melanie voice ID
          }
        }
      };

      const elevenlabs = new ElevenLabsClient({
        apiKey: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY
      });
      const elevenLabsAgent = await elevenlabs.conversationalAi.agents.create(elevenLabsData);

      // Step 2: Create agent in our local API using the Eleven Labs agent ID
      const localAgentData = {
        agent_id: elevenLabsAgent.agentId,
        name: elevenLabsForm.name,
        tech_stack: agentForm.tech_stack,
        description: elevenLabsForm.prompt, // Use the prompt as description
        status: agentForm.status
      };

      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(localAgentData),
      });

      if (response.ok) {
        const newAgent = await response.json();
        setAgents(prev => [newAgent, ...prev]);
        
        // Reset forms
        setElevenLabsForm({ name: '', prompt: '', firstMessage: '', additionalConfig: '' });
        setAgentForm({ agent_id: '', name: '', tech_stack: '', description: '', status: 'active' });
        
        setToast({ 
          message: `Reclutor IA "${elevenLabsData.name}" creado exitosamente en Eleven Labs y registrado localmente!`, 
          type: 'success' 
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create local agent');
      }
    } catch (error) {
      console.error('Error creating combined agent:', error);
      setToast({ 
        message: error instanceof Error ? error.message : 'Error al crear reclutor IA', 
        type: 'error' 
      });
    } finally {
      setLoading(prev => ({ ...prev, createAgent: false }));
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      <div>


        {activeTab === 'candidates' && (
          <div className="animate-in space-y-6" style={{ height: 'calc(100vh - 160px)' }}>
            {/* Main Candidate Creation Section */}
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">+</span>
                </div>
                <h2 className="text-xl font-semibold">{t('candidates.createCandidate')}</h2>
              </div>

              {/* Tab Navigation */}
              <div className="flex mb-6 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                <button
                  onClick={() => setCandidateCreationTab('cv')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    candidateCreationTab === 'cv'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <span className="flex items-center gap-2 justify-center">
                    <RiMagicLine className="w-4 h-4" />
                    {t('candidates.uploadCVWithAI')}
                  </span>
                </button>
                <button
                  onClick={() => setCandidateCreationTab('manual')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    candidateCreationTab === 'manual'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <span className="flex items-center gap-2 justify-center">
                    <RiUserLine className="w-4 h-4" />
                    {t('candidates.manualEntry')}
                  </span>
                </button>
              </div>

              {/* Manual Entry Tab */}
              {candidateCreationTab === 'manual' && (
                <form onSubmit={createCandidate} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">{t('candidates.fullName')}</label>
                    <Input
                      value={candidateForm.name}
                      onChange={(e) => setCandidateForm({ ...candidateForm, name: e.target.value })}
                      placeholder={t('candidates.fullName')}
                      className="h-12 transition-all focus:scale-[1.02]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">{t('candidates.emailAddress')}</label>
                    <Input
                      type="email"
                      value={candidateForm.email}
                      onChange={(e) => setCandidateForm({ ...candidateForm, email: e.target.value })}
                      placeholder="candidate@company.com"
                      className="h-12 transition-all focus:scale-[1.02]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">{t('candidates.phoneNumber')}</label>
                    <Input
                      value={candidateForm.phone}
                      onChange={(e) => setCandidateForm({ ...candidateForm, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                      className="h-12 transition-all focus:scale-[1.02]"
                    />
                  </div>
                  
                  {/* Tech Stack Multi-Select */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                      {t('candidates.techStack')} <span className="text-slate-500">({t('common.optional')})</span>
                    </label>
                    <div className="border border-slate-300 dark:border-slate-600 rounded-md p-3 bg-white dark:bg-slate-700 max-h-32 overflow-y-auto">
                      <div className="flex flex-wrap gap-2">
                        {availableTechnologies.map((tech) => (
                          <label key={tech} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={candidateForm.tech_stack.includes(tech)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setCandidateForm({
                                    ...candidateForm,
                                    tech_stack: [...candidateForm.tech_stack, tech]
                                  });
                                } else {
                                  setCandidateForm({
                                    ...candidateForm,
                                    tech_stack: candidateForm.tech_stack.filter(t => t !== tech)
                                  });
                                }
                              }}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-slate-700 dark:text-slate-300">{tech}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    {candidateForm.tech_stack.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {candidateForm.tech_stack.map((tech) => (
                          <span
                            key={tech}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          >
                            {tech}
                            <button
                              type="button"
                              onClick={() => {
                                setCandidateForm({
                                  ...candidateForm,
                                  tech_stack: candidateForm.tech_stack.filter(t => t !== tech)
                                });
                              }}
                              className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                      {t('candidates.cvResume')} <span className="text-slate-500">({t('common.optional')})</span>
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setCandidateForm({ ...candidateForm, cv_file: e.target.files?.[0] || null })}
                      className="w-full h-12 p-1 border border-input rounded-md bg-background text-foreground transition-all focus:scale-[1.02] focus:ring-2 focus:ring-ring file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {t('candidates.supportedFormats')}
                    </p>
                  </div>
                  <Button 
                    type="submit" 
                    disabled={loading.createCandidate}
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading.createCandidate || loading.uploadCV ? (
                      <div className="flex items-center gap-2">
                        <div className="loading-spinner"></div>
                        {loading.uploadCV ? t('common.loading') : t('common.create') + '...'}
                      </div>
                    ) : (
                      <span className="flex items-center gap-1"><RiStarLine className="w-4 h-4" /> {t('candidates.createCandidate')}</span>
                    )}
                  </Button>
                </form>
              )}

              {/* CV Upload Tab */}
              {candidateCreationTab === 'cv' && (
                <form onSubmit={uploadCVOnly} className="space-y-6">
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <RiClipboardLine className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
                      {t('candidates.uploadCVOnly')}
                    </h3>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                      {t('candidates.selectCVFile')}
                    </label>
                    <input
                      id="cv-only-upload"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setCvOnlyForm({ cv_file: e.target.files?.[0] || null })}
                      className="w-full h-12 p-1 border border-input rounded-md bg-background text-foreground transition-all focus:scale-[1.02] focus:ring-2 focus:ring-ring file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                      required
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {t('candidates.supportedFormats')}
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={loading.createCandidate || loading.processingCV || !cvOnlyForm.cv_file}
                    className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading.createCandidate ? (
                      <div className="flex items-center gap-2">
                        <div className="loading-spinner"></div>
                        Uploading...
                      </div>
                    ) : loading.processingCV ? (
                      <div className="flex items-center gap-2">
                        <div className="loading-spinner"></div>
                        {t('candidates.processing')}
                      </div>
                    ) : (
                      <span className="flex items-center gap-1"><RiUploadLine className="w-4 h-4" /> {t('candidates.uploadCV')}</span>
                    )}
                  </Button>
                </form>
              )}
            </div>
            
            {/* Secondary Candidates List Section */}
            <div className="card p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                    <RiTeamLine className="text-white text-xs" />
                  </div>
                  <h3 className="text-lg font-semibold">{t('candidates.candidatesList')} ({candidates.length})</h3>
                </div>
                {loading.processingCV && (
                  <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                    <div className="loading-spinner w-4 h-4"></div>
                    <span>Processing CV in background...</span>
                  </div>
                )}
              </div>
              
              <div className="max-h-64 overflow-y-auto space-y-2">
                {loading.candidates ? (
                  <div className="text-center py-4">
                    <div className="loading-spinner mx-auto mb-2"></div>
                    <p className="text-muted-foreground text-sm">Loading candidates...</p>
                  </div>
                ) : candidates.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    <div className="text-2xl mb-2"><RiClipboardLine /></div>
                    <p className="text-sm">{t('candidates.noCandidates')}</p>
                  </div>
                ) : (
                  candidates.map((candidate, index) => (
                    <div key={candidate.id} className="group p-3 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 hover:shadow-md transition-all duration-200 hover:scale-[1.01]" style={{animationDelay: `${index * 0.05}s`}}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {candidate.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                              {candidate.name.startsWith('CV-') ? t('candidates.processing') : candidate.name}
                            </h4>
                            {candidate.name.startsWith('CV-') && (
                              <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 text-xs rounded-full flex items-center gap-1 flex-shrink-0">
                                <RiRobotLine className="w-3 h-3" />
                                AI
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1 truncate">
                            <RiMailLine className="w-3 h-3 flex-shrink-0" /> 
                            {candidate.email.includes('@ai-extraction.temp') ? t('candidates.emailPendingExtraction') : candidate.email}
                          </p>
                          {candidate.tech_stack && candidate.tech_stack.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {candidate.tech_stack.slice(0, 2).map((tech) => (
                                <span
                                  key={tech}
                                  className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded"
                                >
                                  {tech}
                                </span>
                              ))}
                              {candidate.tech_stack.length > 2 && (
                                <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs rounded">
                                  +{candidate.tech_stack.length - 2}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {candidate.cv_url && (
                            <a 
                              href={candidate.cv_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 p-1"
                              title={t('candidates.viewCV')}
                            >
                              <RiExternalLinkLine className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'meets' && (
          <div className="flex flex-col" style={{ height: 'calc(100vh - 160px)' }}>
            {/* Interview Scheduling Tabs */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 mb-6">
              {/* Tab Headers */}
              <div className="flex border-b border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setInterviewSchedulingTab('ai')}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                    interviewSchedulingTab === 'ai'
                      ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/20'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <RiMagicLine className="w-4 h-4" />
                  {t('interviews.scheduleWithAI')}
                </button>
                <button
                  onClick={() => setInterviewSchedulingTab('manual')}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                    interviewSchedulingTab === 'manual'
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <RiCalendarLine className="w-4 h-4" />
                  {t('interviews.scheduleManual')}
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {/* AI Interview Scheduling Tab */}
                {interviewSchedulingTab === 'ai' && (
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <RiMagicLine className="w-5 h-5 text-purple-600" />
                      {t('interviews.scheduleWithAI')}
                    </h2>
                    
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-700">
                      <div className="text-center">
                        <RiMagicLine className="w-12 h-12 mx-auto mb-4 text-purple-600 dark:text-purple-400" />
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                          {t('interviews.aiSchedulingTitle')}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">
                          {t('interviews.aiSchedulingDescription')}
                        </p>
                        
                        <Button 
                          onClick={processAIMatching}
                          disabled={loading.aiMatching}
                          className="bg-gradient-to-r cursor-pointer from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading.aiMatching ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Procesando...
                            </div>
                          ) : (
                            <>
                              <RiMagicLine className="w-4 h-4 mr-2" />
                              Procesar con IA
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Manual Interview Scheduling Tab */}
                {interviewSchedulingTab === 'manual' && (
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <RiCalendarLine className="w-5 h-5 text-blue-600" />
                      {t('interviews.scheduleManual')}
                    </h2>
                    
                    <form onSubmit={createMeet} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          {t('interviews.selectCandidate')}
                        </label>
                        <select
                          value={meetForm.candidate_id}
                          onChange={(e) => setMeetForm({...meetForm, candidate_id: e.target.value})}
                          required
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                        >
                          <option value="">{t('interviews.chooseCandidate')}</option>
                          {candidates.map(candidate => (
                            <option key={candidate.id} value={candidate.id}>
                              {candidate.name} ({candidate.email})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          {t('interviews.selectJdInterview')} *
                        </label>
                        <select
                          value={meetForm.jd_interviews_id}
                          onChange={(e) => setMeetForm({...meetForm, jd_interviews_id: e.target.value})}
                          required
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                        >
                          <option value="" disabled>{t('interviews.chooseJdInterview')}</option>
                          {jdInterviews.map(jd => (
                            <option key={jd.id} value={jd.id}>
                              {jd.interview_name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <Button 
                          type="submit" 
                          disabled={loading.createMeet}
                          className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-[1.02] transition-all"
                        >
                          {loading.createMeet ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              {t('common.loading')}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <RiCalendarEventLine className="w-4 h-4" />
                              {t('interviews.scheduleInterview')}
                            </div>
                          )}
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>

            {/* AI Matches Table */}
            {showAiMatches && aiMatches.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 mb-6">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <RiMagicLine className="w-5 h-5 text-purple-600" />
                      Matches de IA ({aiMatches.length})
                    </h2>
                    <Button
                      onClick={() => setShowAiMatches(false)}
                      variant="outline"
                      size="sm"
                      className="text-slate-500 hover:text-slate-700"
                    >
                      <RiArrowUpSLine className="w-4 h-4 mr-1" />
                      Ocultar
                    </Button>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Candidato
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Entrevista JD
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Score de Match
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Análisis de Match
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                      {aiMatches.map((match) => (
                        <tr key={match.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-slate-900 dark:text-white">
                                {match.candidate.name}
                              </div>
                              <div className="text-sm text-slate-500 dark:text-slate-400">
                                {match.candidate.email}
                              </div>
                              {match.candidate.tech_stack && match.candidate.tech_stack.length > 0 && (
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {match.candidate.tech_stack.slice(0, 3).map((tech) => (
                                    <span
                                      key={tech}
                                      className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded"
                                    >
                                      {tech}
                                    </span>
                                  ))}
                                  {match.candidate.tech_stack.length > 3 && (
                                    <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs rounded">
                                      +{match.candidate.tech_stack.length - 3}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-900 dark:text-white">
                              {match.jd_interview.interview_name}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                              Agent: {match.jd_interview.agent_id}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${
                                match.match_score >= 90 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                match.match_score >= 80 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                match.match_score >= 70 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                              }`}>
                                {match.match_score}%
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-slate-900 dark:text-white">
                              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                {match.match_analysis}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <Button
                                onClick={async () => {
                                  // Find the candidate and create the interview directly
                                  const candidate = candidates.find(c => c.name === match.candidate.name);
                                  if (!candidate) {
                                    setToast({
                                      message: 'Candidato no encontrado',
                                      type: 'error'
                                    });
                                    return;
                                  }

                                  try {
                                    // Check if candidate already has an interview
                                    const hasExistingInterview = await checkExistingInterview(candidate.id, match.jd_interview.id);
                                    
                                    if (hasExistingInterview) {
                                      setToast({ 
                                        message: `Ya existe una entrevista en proceso para ${candidate.name}`, 
                                        type: 'warning' 
                                      });
                                      return;
                                    }

                                    const meetData = {
                                      candidate_id: candidate.id,
                                      jd_interviews_id: match.jd_interview.id
                                    };
                                    
                                    const response = await fetch('/api/meets', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify(meetData),
                                    });
                                    
                                    if (response.ok) {
                                      // Remove this match from the AI matches list
                                      setAiMatches(prev => prev.filter(m => m.id !== match.id));
                                      
                                      // Refresh meets list
                                      fetchMeets();
                                      
                                      setToast({ 
                                        message: `Entrevista programada exitosamente para ${candidate.name} - ${match.jd_interview.interview_name}`, 
                                        type: 'success' 
                                      });
                                    } else {
                                      const errorData = await response.json();
                                      throw new Error(errorData.error || 'Failed to schedule interview');
                                    }
                                  } catch (error) {
                                    console.error('Error scheduling interview:', error);
                                    setToast({ 
                                      message: 'Error al programar la entrevista', 
                                      type: 'error' 
                                    });
                                  }
                                }}
                                className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700"
                              >
                                <RiCalendarEventLine className="w-3 h-3 mr-1" />
                                Programar
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Scheduled Interviews Table */}
            <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col transition-all duration-300 ease-in-out ${
              scheduledInterviewsCollapsed ? 'flex-none' : 'flex-1'
            }`}>
              <div 
                className="p-6 border-b border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                onClick={() => setScheduledInterviewsCollapsed(!scheduledInterviewsCollapsed)}
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <RiCalendarCheckLine className="w-5 h-5" />
                    {t('interviews.scheduledInterviews')} ({meets.length})
                  </h2>
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 transition-transform duration-200">
                    {scheduledInterviewsCollapsed ? (
                      <RiArrowDownSLine className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    ) : (
                      <RiArrowUpSLine className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    )}
                  </div>
                </div>
              </div>
              
              <div className={`transition-all duration-300 ease-in-out ${scheduledInterviewsCollapsed ? 'max-h-0 opacity-0' : 'flex-1 opacity-100'} overflow-hidden`}>
                {meets.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400 py-12">
                    <div className="text-center">
                      <RiCalendarLine className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>{t('interviews.noScheduledInterviews')}</p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto overflow-y-auto h-full">
                    <table className="w-full">
                      <thead className="bg-slate-50 dark:bg-slate-700 sticky top-0">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            {t('interviews.candidate')}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            {t('interviews.jdInterview')}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            {t('interviews.status.title')}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            {t('interviews.actions')}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                        {meets.map(meet => (
                          <tr key={meet.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-slate-900 dark:text-white">
                                  {meet.candidate?.name || 'Unknown Candidate'}
                                </div>
                                <div className="text-sm text-slate-500 dark:text-slate-400">
                                  {meet.candidate?.email}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-slate-900 dark:text-white">
                                {meet.jd_interviews?.interview_name || 'No JD Interview'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                meet.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                meet.status === 'active' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                meet.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                              }`}>
                                {t(`interviews.status.${meet.status}`)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center gap-2">
                                <Button
                                  onClick={() => handleCopyLink(meet.link)}
                                  className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700"
                                >
                                  <RiLinkM className="w-3 h-3 mr-1" />
                                  {copySuccess === meet.link ? t('interviews.copied') : t('interviews.copy')}
                                </Button>
                                
                                <Button
                                  onClick={() => handleSendLink(meet)}
                                  disabled={loading.sendEmail}
                                  className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700"
                                >
                                  <RiMailLine className="w-3 h-3 mr-1" />
                                  {t('interviews.sendLink')}
                                </Button>
                                
                                <a 
                                  href={meet.link} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center px-3 py-1 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
                                >
                                  {t('interviews.joinInterview')}
                                  <RiExternalLinkLine className="w-3 h-3 ml-1" />
                                </a>
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                ID: #{meet.id.slice(-8)}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'conversations' && (
          <div className="animate-in h-full w-full">
            {!selectedCandidate ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8" style={{ height: 'calc(100vh - 160px)' }}>
                <div className="card p-6 h-full flex flex-col">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                      <RiChat3Line className="text-white text-sm" />
                    </div>
                    <h2 className="text-xl font-semibold">{t('conversations.candidatesWithConversations')} ({getCandidatesWithConversations().length})</h2>
                  </div>
                  <div className="space-y-3 overflow-y-auto" style={{ height: 'calc(100vh - 260px)' }}>
                    {loading.conversations ? (
                      <div className="text-center py-8">
                        <div className="loading-spinner mx-auto mb-2"></div>
                        <p className="text-muted-foreground">Loading conversations...</p>
                      </div>
                    ) : getCandidatesWithConversations().length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <div className="text-4xl mb-2"><RiChat3Line /></div>
                        <p>{t('conversations.noConversations')}</p>
                      </div>
                    ) : (
                      getCandidatesWithConversations().map((candidate, index) => {
                        const candidateConversations = getCandidateConversations(candidate.id);
                        return (
                          <div 
                            key={candidate.id} 
                            className="group p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-slate-800 dark:to-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 hover:shadow-md transition-all duration-200 hover:scale-[1.01] cursor-pointer" 
                            style={{animationDelay: `${index * 0.1}s`}}
                            onClick={() => setSelectedCandidate(candidate)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                {candidate.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                  {candidate.name}
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1"><RiMailLine className="w-4 h-4" /> {candidate.email}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                                  <span className="flex items-center gap-1"><RiChat3Line className="w-4 h-4" /> {candidateConversations.length} {t('conversations.conversation')}{candidateConversations.length !== 1 ? 's' : ''}</span>
                                </p>
                              </div>
                              <div className="text-purple-400 group-hover:text-purple-600 transition-colors">
                                <RiArrowRightSLine className="w-5 h-5" />
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
                
                <div className="card p-6 h-full flex flex-col">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">ℹ️</span>
                    </div>
                    <h2 className="text-xl font-semibold">{t('conversations.instructions')}</h2>
                  </div>
                  <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400 overflow-y-auto" style={{ height: 'calc(100vh - 260px)' }}>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">{t('conversations.howToView')}</h4>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>{t('conversations.selectFromPanel')}</li>
                        <li>{t('conversations.browseHistory')}</li>
                        <li>{t('conversations.viewMessages')}</li>
                        <li>{t('conversations.useBackButton')}</li>
                      </ol>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-2">{t('conversations.messageTypes')}</h4>
                      <ul className="list-disc list-inside space-y-1">
                        <li><span className="font-mono text-xs bg-slate-200 dark:bg-slate-700 px-1 rounded">ai</span> - {t('conversations.aiMessages')}</li>
                        <li><span className="font-mono text-xs bg-slate-200 dark:bg-slate-700 px-1 rounded">user</span> - {t('conversations.userMessages')}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full" style={{ height: 'calc(100vh - 160px)' }}>
                <div className="card p-6 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedCandidate(null)}
                        className="hover:scale-105 transition-transform"
                      >
                        ← Back
                      </Button>
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                        {selectedCandidate.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold">{selectedCandidate.name}</h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{selectedCandidate.email}</p>
                      </div>
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1"><RiChat3Line className="w-4 h-4" /> {getCandidateConversations(selectedCandidate.id).length} {t('conversations.conversation')}{getCandidateConversations(selectedCandidate.id).length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-6 overflow-y-auto" style={{ height: 'calc(100vh - 260px)' }}>
                    {getCandidateConversations(selectedCandidate.id).map((conversation, index) => (
                      <div key={conversation.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 flex flex-col">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">{index + 1}</span>
                          </div>
                          <h3 className="font-medium text-slate-800 dark:text-slate-200">
                            {t('conversations.conversation')} #{conversation.id.slice(0, 8)}
                          </h3>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {new Date(conversation.created_at).toLocaleDateString()} {new Date(conversation.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                        
                        <div className="space-y-3 flex-1 overflow-y-auto">
                          {Array.isArray(conversation.conversation_data) && conversation.conversation_data.length > 0 ? (
                            conversation.conversation_data.map((message: { source: string; message: string }, msgIndex: number) => (
                              <div 
                                key={msgIndex} 
                                className={`flex ${message.source === 'user' ? 'justify-end' : 'justify-start'}`}
                              >
                                <div 
                                  className={`max-w-[70%] p-3 rounded-lg ${
                                    message.source === 'user'
                                      ? 'bg-blue-500 text-white rounded-br-none'
                                      : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-bl-none'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-xs font-medium ${
                                      message.source === 'user' ? 'text-blue-100' : 'text-slate-600 dark:text-slate-400'
                                    }`}>
                                      {message.source === 'user' ? <span className="flex items-center gap-1"><RiUserLine className="w-4 h-4" /> {t('conversations.candidate')}</span> : <span className="flex items-center gap-1"><RiRobotLine className="w-4 h-4" /> {t('conversations.aiInterviewer')}</span>}
                                    </span>
                                  </div>
                                  <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-4 text-slate-500 dark:text-slate-400">
                              <p className="text-sm">No messages in this conversation</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {getCandidateConversations(selectedCandidate.id).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <div className="text-4xl mb-2"><RiChat3Line /></div>
                      <p>No conversations found for this candidate.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'bulk-upload' && (
          <div className="animate-in max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              <div className="card p-6">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                    <RiFolderLine className="text-white text-sm font-bold" />
                  </div>
                  <h2 className="text-xl font-semibold">{t('bulkUpload.bulkUploadCandidates')}</h2>
                </div>
                <form onSubmit={handleBulkUpload} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                      {t('bulkUpload.uploadFile')}
                    </label>
                    <input
                      type="file"
                      accept=".csv,.txt"
                      onChange={(e) => setBulkUploadForm({ file: e.target.files?.[0] || null })}
                      className="w-full h-12 p-3 border border-input rounded-md bg-background text-foreground transition-all focus:scale-[1.02] focus:ring-2 focus:ring-ring file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      required
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {t('bulkUpload.supportedFormats')}
                    </p>
                  </div>
                  <Button 
                    type="submit" 
                    disabled={loading.bulkUpload || !bulkUploadForm.file}
                    className="w-full h-12 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading.bulkUpload ? (
                      <div className="flex items-center gap-2">
                        <div className="loading-spinner"></div>
                        {t('bulkUpload.uploading')}
                      </div>
                    ) : (
                      <span className="flex items-center gap-1"><RiRocketLine className="w-4 h-4" /> {t('bulkUpload.uploadCandidates')}</span>
                    )}
                  </Button>
                </form>
              </div>
              
              <div className="card p-6">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">ℹ️</span>
                  </div>
                  <h2 className="text-xl font-semibold">{t('bulkUpload.fileFormatInstructions')}</h2>
                </div>
                <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">{t('bulkUpload.csvFormat')}</h4>
                    <code className="block text-xs bg-slate-100 dark:bg-slate-800 p-2 rounded mb-2">
                      {t('bulkUpload.csvExample')}
                    </code>
                    <p className="text-xs">{t('bulkUpload.headerOptional')}</p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">{t('bulkUpload.txtFormatOptions')}</h4>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs font-medium mb-1">{t('bulkUpload.commaSeparated')}</p>
                        <code className="block text-xs bg-slate-100 dark:bg-slate-800 p-1 rounded">
                          John Doe,john@example.com,+1234567890
                        </code>
                      </div>
                      <div>
                        <p className="text-xs font-medium mb-1">{t('bulkUpload.angleBrackets')}</p>
                        <code className="block text-xs bg-slate-100 dark:bg-slate-800 p-1 rounded">
                          John Doe &lt;john@example.com&gt; +1234567890
                        </code>
                      </div>
                      <div>
                        <p className="text-xs font-medium mb-1">{t('bulkUpload.spaceSeparated')}</p>
                        <code className="block text-xs bg-slate-100 dark:bg-slate-800 p-1 rounded">
                          John Doe john@example.com +1234567890
                        </code>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <h4 className="font-medium text-yellow-800 dark:text-yellow-300 mb-2">{t('bulkUpload.importantNotes')}</h4>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>{t('bulkUpload.nameEmailRequired')}</li>
                      <li>{t('bulkUpload.phoneOptional')}</li>
                      <li>{t('bulkUpload.duplicatesSkipped')}</li>
                      <li>{t('bulkUpload.invalidEmailsRejected')}</li>
                      <li>{t('bulkUpload.emptyLinesIgnored')}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}


        {activeTab === 'agents' && (
          <div className="animate-in h-full w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8" style={{ height: 'calc(100vh - 160px)' }}>
              {/* Create Agent Form - Combined */}
              <div className="card p-6 h-full flex flex-col">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-cyan-500 rounded-full flex items-center justify-center">
                    <RiMagicLine className="text-white text-sm" />
                  </div>
                  <h2 className="text-xl font-semibold">{t('agents.createAgent')}</h2>
                </div>
                <form onSubmit={createCombinedAgent} className="space-y-6 flex-1">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {t('agents.recruiterName')} *
                    </label>
                    <Input
                      type="text"
                      value={elevenLabsForm.name}
                      onChange={(e) => setElevenLabsForm({ ...elevenLabsForm, name: e.target.value })}
                      placeholder={t('agents.recruiterNamePlaceholder')}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {t('agents.techStack')} *
                    </label>
                    <Input
                      type="text"
                      value={agentForm.tech_stack}
                      onChange={(e) => setAgentForm({ ...agentForm, tech_stack: e.target.value })}
                      placeholder={t('agents.techStack')}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {t('agents.firstMessage')} *
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      rows={3}
                      value={elevenLabsForm.firstMessage}
                      onChange={(e) => setElevenLabsForm({ ...elevenLabsForm, firstMessage: e.target.value })}
                      placeholder={t('agents.firstMessagePlaceholder')}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {t('agents.systemPrompt')} *
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      rows={4}
                      value={elevenLabsForm.prompt}
                      onChange={(e) => setElevenLabsForm({ ...elevenLabsForm, prompt: e.target.value })}
                      placeholder={t('agents.systemPromptPlaceholder')}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      {t('agents.status')}
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      value={agentForm.status}
                      onChange={(e) => setAgentForm({ ...agentForm, status: e.target.value as 'active' | 'inactive' })}
                    >
                      <option value="active">{t('agents.active')}</option>
                      <option value="inactive">{t('agents.inactive')}</option>
                    </select>
                  </div>
                  <Button 
                    type="submit" 
                    disabled={loading.createAgent}
                    className="w-full h-12 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading.createAgent ? (
                      <div className="flex items-center gap-2">
                        <div className="loading-spinner"></div>
                        {t('agents.creatingRecruiter')}
                      </div>
                    ) : (
                      <span className="flex items-center gap-1"><RiMagicLine className="w-4 h-4" /> {t('agents.createAgent')}</span>
                    )}
                  </Button>
                </form>
              </div>

              {/* Agents List */}
              <div className="card p-6 h-full flex flex-col">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full flex items-center justify-center">
                    <RiRobotLine className="text-white text-sm" />
                  </div>
                  <h2 className="text-xl font-semibold">{t('agents.agentsList')} ({agents.length})</h2>
                </div>
                <div className="space-y-3 overflow-y-auto" style={{ height: 'calc(100vh - 260px)' }}>
                  {loading.agents ? (
                    <div className="text-center py-8">
                      <div className="loading-spinner mx-auto mb-2"></div>
                      <p className="text-muted-foreground">Loading agents...</p>
                    </div>
                  ) : agents.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <div className="text-4xl mb-2"><RiRobotLine /></div>
                      <p>{t('agents.noAgents')}</p>
                    </div>
                  ) : (
                    agents.map((agent, index) => {
                      const isExpanded = expandedAgents.has(agent.id);
                      return (
                        <div key={agent.id} className="group bg-gradient-to-r from-purple-50 to-pink-50 dark:from-slate-800 dark:to-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 hover:shadow-md transition-all duration-200 overflow-hidden" style={{animationDelay: `${index * 0.1}s`}}>
                          {/* Header - Always visible */}
                          <div 
                            className="p-4 cursor-pointer hover:bg-purple-100 dark:hover:bg-slate-700/50 transition-colors"
                            onClick={() => toggleAgentExpansion(agent.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                  {agent.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                      {agent.name}
                                    </h3>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      agent.status === 'active' 
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                                    }`}>
                                      {agent.status === 'active' ? t('agents.active') : t('agents.inactive')}
                                    </span>
                                  </div>
                                  <p className="text-sm text-slate-600 dark:text-slate-400">
                                    <strong>ID:</strong> {agent.agent_id}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 transition-transform duration-200">
                                {isExpanded ? (
                                  <RiArrowUpSLine className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                                ) : (
                                  <RiArrowDownSLine className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Collapsible Content */}
                          <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                            <div className="px-4 pb-4 border-t border-slate-200 dark:border-slate-700 pt-3 space-y-3">
                              <div>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tech Stack:</p>
                                <p className="text-sm text-slate-600 dark:text-slate-400">{agent.tech_stack}</p>
                              </div>
                              {agent.description && (
                                <div>
                                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descripción:</p>
                                  <div className="text-sm text-slate-500 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 rounded p-2 max-h-24 overflow-y-auto">
                                    {agent.description}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="animate-in h-full w-full">
            {loading.meetsByJdInterviews ? (
              <div className="text-center py-8">
                <div className="loading-spinner mx-auto mb-2"></div>
                <p className="text-muted-foreground">{t('reports.loadingReports')}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Overall Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="card p-6 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{t('reports.totalInterviews')}</p>
                        <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{getTotalMeets()}</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                        <RiCalendarLine className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="card p-6 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-600 dark:text-green-400">{t('reports.completed')}</p>
                        <p className="text-3xl font-bold text-green-900 dark:text-green-100">{getOverallStatusCounts().completed || 0}</p>
                        <p className="text-xs text-green-600 dark:text-green-400">{getStatusPercentage('completed', getTotalMeets())}% {t('reports.ofTotal')}</p>
                      </div>
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                        <RiCheckLine className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="card p-6 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">{t('reports.pending')}</p>
                        <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">{getOverallStatusCounts().pending || 0}</p>
                        <p className="text-xs text-yellow-600 dark:text-yellow-400">{getStatusPercentage('pending', getTotalMeets())}% {t('reports.ofTotal')}</p>
                      </div>
                      <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                        <RiClipboardLine className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="card p-6 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-600 dark:text-purple-400">{t('reports.jdTemplates')}</p>
                        <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{meetsByJdInterviews.length}</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                        <RiRobotLine className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Reports by JD Interview */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <RiBarChartLine className="w-6 h-6" />
                      {t('reports.interviewAnalyticsByJD')}
                    </h2>
                    {meetsByJdInterviews.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleAllReports}
                        className="flex items-center gap-2 hover:scale-105 transition-transform"
                      >
                        {expandedReports.size === meetsByJdInterviews.length ? (
                          <>
                            <RiArrowUpSLine className="w-4 h-4" />
                            {t('reports.collapseAll')}
                          </>
                        ) : (
                          <>
                            <RiArrowDownSLine className="w-4 h-4" />
                            {t('reports.expandAll')}
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  
                  {meetsByJdInterviews.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <div className="text-6xl mb-4"><RiBarChartLine /></div>
                      <p className="text-xl mb-2">No interview data available</p>
                      <p>Create some interviews to see analytics here.</p>
                    </div>
                  ) : (
                    meetsByJdInterviews.map((group, index) => {
                      const statusCounts = getStatusCounts(group.meets);
                      const totalMeetsInGroup = group.meets.length;
                      const isExpanded = expandedReports.has(group.jd_interview.id);
                      
                      return (
                        <div key={group.jd_interview.id} className="card overflow-hidden transition-all duration-200" style={{animationDelay: `${index * 0.1}s`}}>
                          {/* Collapsible Header */}
                          <div 
                            className="p-6 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                            onClick={() => toggleReportExpansion(group.jd_interview.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                                  {index + 1}
                                </div>
                                <div className="flex-1">
                                  <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                                    {group.jd_interview.interview_name}
                                  </h3>
                                  <p className="text-sm text-slate-600 dark:text-slate-400">
                                    {t('reports.agent')}: <span className="font-mono bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">{group.jd_interview.agent_id}</span>
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">{totalMeetsInGroup}</p>
                                  <p className="text-sm text-slate-600 dark:text-slate-400">{t('reports.totalInterviewsInGroup')}</p>
                                </div>
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 transition-transform duration-200">
                                  {isExpanded ? (
                                    <RiArrowUpSLine className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                  ) : (
                                    <RiArrowDownSLine className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Collapsible Content */}
                          <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                            <div className="px-6 pb-6 space-y-4 border-t border-slate-200 dark:border-slate-700 pt-4">

                            {/* Status Distribution */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {Object.entries(statusCounts).map(([status, count]) => (
                                <div key={status} className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                                  <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium mb-2 ${getStatusColor(status)}`}>
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                  </div>
                                  <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">{count}</p>
                                  <p className="text-xs text-slate-600 dark:text-slate-400">
                                    {totalMeetsInGroup > 0 ? ((count / totalMeetsInGroup) * 100).toFixed(1) : '0.0'}%
                                  </p>
                                </div>
                              ))}
                            </div>

                            {/* Recent Interviews */}
                            {group.meets.length > 0 && (
                              <div>
                                <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                                  <RiUserLine className="w-4 h-4" />
                                  {t('reports.recentInterviews')} ({group.meets.length})
                                </h4>
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                  {group.meets.slice(0, 5).map((meet) => (
                                    <div key={meet.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                      <div className="flex items-center gap-3 flex-1">
                                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                          {meet.candidate?.name?.charAt(0).toUpperCase() || '?'}
                                        </div>
                                        <div className="flex-1">
                                          <p className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2 flex-wrap">
                                            {meet.candidate?.name || 'Unknown Candidate'}
                                            <span className="text-slate-400">-</span>
                                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(meet.status)}`}>
                                              {getStatusText(meet.status)}
                                            </span>
                                            <span className="text-slate-400">-</span>
                                            <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                                              {new Date(meet.created_at).toLocaleDateString()}
                                            </span>
                                          </p>
                                          <p className="text-sm text-slate-600 dark:text-slate-400">
                                            {meet.candidate?.email || 'No email'}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex items-center">
                                        <button
                                          onClick={() => {
                                            setSelectedMeetForReport(meet);
                                            fetchEvaluationReport(meet.candidate_id, group.jd_interview.id);
                                          }}
                                          className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white transition-all duration-200 hover:scale-110 shadow-md hover:shadow-lg"
                                          title="Ver reporte con IA"
                                        >
                                          <RiFileChartLine className="w-5 h-5" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                  {group.meets.length > 5 && (
                                    <p className="text-center text-sm text-slate-500 dark:text-slate-400 py-2">
                                      ... and {group.meets.length - 5} {t('reports.moreInterviews')}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Job Description Preview */}
                            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                              <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">{t('reports.jobDescriptionPreview')}</h4>
                              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 max-h-32 overflow-y-auto">
                                <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                                  {group.jd_interview.job_description.length > 200 
                                    ? `${group.jd_interview.job_description.substring(0, 200)}...` 
                                    : group.jd_interview.job_description}
                                </p>
                              </div>
                            </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        {/* Modal de Reporte con IA */}
        {selectedMeetForReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in">
              {/* Header del Modal */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-purple-500 to-blue-500">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                    <RiFileChartLine className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Reporte con IA</h2>
                    <p className="text-sm text-white/80">
                      {selectedMeetForReport.candidate?.name || 'Candidato desconocido'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedMeetForReport(null);
                    setEvaluationData(null);
                  }}
                  className="p-2 rounded-lg hover:bg-white/20 transition-colors text-white"
                  title="Cerrar"
                >
                  <RiCloseLine className="w-6 h-6" />
                </button>
              </div>

              {/* Contenido del Modal */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Información del Candidato */}
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                    <RiUserLine className="w-5 h-5" />
                    Información del Candidato
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Nombre</p>
                      <p className="font-medium text-slate-800 dark:text-slate-200">
                        {selectedMeetForReport.candidate?.name || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Email</p>
                      <p className="font-medium text-slate-800 dark:text-slate-200">
                        {selectedMeetForReport.candidate?.email || 'N/A'}
                      </p>
                    </div>
                    {(() => {
                      const candidate = candidates.find(c => c.id === selectedMeetForReport.candidate_id);
                      return candidate?.tech_stack && candidate.tech_stack.length > 0 && (
                        <div className="md:col-span-2">
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Stack Tecnológico</p>
                          <div className="flex flex-wrap gap-2">
                            {candidate.tech_stack.map((tech: string, idx: number) => (
                              <span key={idx} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm">
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Información de la Entrevista */}
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                    <RiCalendarLine className="w-5 h-5" />
                    Información de la Entrevista
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Estado</p>
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium mt-1 ${getStatusColor(selectedMeetForReport.status)}`}>
                        {getStatusText(selectedMeetForReport.status)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Fecha de Creación</p>
                      <p className="font-medium text-slate-800 dark:text-slate-200">
                        {new Date(selectedMeetForReport.created_at).toLocaleString()}
                      </p>
                    </div>
                    {selectedMeetForReport.scheduled_at && (
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Fecha Programada</p>
                        <p className="font-medium text-slate-800 dark:text-slate-200">
                          {new Date(selectedMeetForReport.scheduled_at).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Análisis con IA */}
                {loadingEvaluation ? (
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                      <p className="ml-3 text-slate-600 dark:text-slate-400">Cargando análisis...</p>
                    </div>
                  </div>
                ) : evaluationData ? (
                  <div className="space-y-6">
                    {/* Match Evaluation */}
                    {evaluationData.match_evaluation && (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-6 border border-green-200 dark:border-green-700">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                          <RiCheckLine className="w-5 h-5 text-green-600 dark:text-green-400" />
                          Evaluación de Compatibilidad
                        </h3>
                        {evaluationData.match_evaluation.compatibility_score !== undefined && (
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Puntuación de Compatibilidad</span>
                              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {evaluationData.match_evaluation.compatibility_score}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                              <div 
                                className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
                                style={{ width: `${evaluationData.match_evaluation.compatibility_score}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                        {evaluationData.match_evaluation.final_recommendation && (
                          <div className="mb-4">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Recomendación Final: </span>
                            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                              evaluationData.match_evaluation.final_recommendation === 'Aprobado' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                              evaluationData.match_evaluation.final_recommendation === 'Condicional' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                              'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                            }`}>
                              {evaluationData.match_evaluation.final_recommendation}
                            </span>
                          </div>
                        )}
                        {evaluationData.match_evaluation.justification && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                            {evaluationData.match_evaluation.justification}
                          </p>
                        )}
                        {evaluationData.match_evaluation.strengths && evaluationData.match_evaluation.strengths.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold text-green-800 dark:text-green-300 mb-2">Fortalezas</h4>
                            <ul className="space-y-1">
                              {evaluationData.match_evaluation.strengths.map((strength: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                                  <RiCheckLine className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                  <span>{strength}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {evaluationData.match_evaluation.concerns && evaluationData.match_evaluation.concerns.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-orange-800 dark:text-orange-300 mb-2">Oportunidades de Mejora</h4>
                            <ul className="space-y-1">
                              {evaluationData.match_evaluation.concerns.map((concern: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                                  <RiCalendarCheckLine className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                                  <span>{concern}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Technical Assessment */}
                    {evaluationData.conversation_analysis?.technical_assessment && (
                      <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-6 border border-slate-200 dark:border-slate-600">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                          <RiBarChartLine className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          Evaluación Técnica
                        </h3>
                        {evaluationData.conversation_analysis.technical_assessment.knowledge_level && (
                          <div className="mb-4">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Nivel de Conocimiento: </span>
                            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium">
                              {evaluationData.conversation_analysis.technical_assessment.knowledge_level}
                            </span>
                          </div>
                        )}
                        {evaluationData.conversation_analysis.technical_assessment.practical_experience && (
                          <div className="mb-4">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Experiencia Práctica: </span>
                            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-sm font-medium">
                              {evaluationData.conversation_analysis.technical_assessment.practical_experience}
                            </span>
                          </div>
                        )}
                        {evaluationData.conversation_analysis.technical_assessment.completeness_summary && (
                          <div className="mb-4 p-4 bg-white dark:bg-slate-800 rounded-lg">
                            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Resumen de Completitud</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="text-center">
                                <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                                  {evaluationData.conversation_analysis.technical_assessment.completeness_summary.total_questions || 0}
                                </p>
                                <p className="text-xs text-slate-600 dark:text-slate-400">Total</p>
                              </div>
                              <div className="text-center">
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                  {evaluationData.conversation_analysis.technical_assessment.completeness_summary.fully_answered || 0}
                                </p>
                                <p className="text-xs text-slate-600 dark:text-slate-400">Completas</p>
                              </div>
                              <div className="text-center">
                                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                  {evaluationData.conversation_analysis.technical_assessment.completeness_summary.partially_answered || 0}
                                </p>
                                <p className="text-xs text-slate-600 dark:text-slate-400">Parciales</p>
                              </div>
                              <div className="text-center">
                                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                                  {evaluationData.conversation_analysis.technical_assessment.completeness_summary.not_answered || 0}
                                </p>
                                <p className="text-xs text-slate-600 dark:text-slate-400">Sin responder</p>
                              </div>
                            </div>
                          </div>
                        )}
                        {evaluationData.conversation_analysis.technical_assessment.alerts && evaluationData.conversation_analysis.technical_assessment.alerts.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold text-orange-800 dark:text-orange-300 mb-2">Alertas</h4>
                            <ul className="space-y-1">
                              {evaluationData.conversation_analysis.technical_assessment.alerts.map((alert: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-900/20 p-2 rounded">
                                  <RiCalendarCheckLine className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                  <span>{alert}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {evaluationData.conversation_analysis.technical_assessment.technical_questions && evaluationData.conversation_analysis.technical_assessment.technical_questions.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Preguntas Técnicas</h4>
                            <div className="space-y-4">
                              {evaluationData.conversation_analysis.technical_assessment.technical_questions.map((q, idx: number) => (
                                <div key={idx} className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                                  <div className="flex items-start justify-between mb-2">
                                    <p className="font-medium text-slate-800 dark:text-slate-200 text-sm">{q.question}</p>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                      q.answered === 'SÍ' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                      q.answered === 'PARCIALMENTE' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                      'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                    }`}>
                                      {q.answered}
                                    </span>
                                  </div>
                                  {q.answer && (
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 italic">&ldquo;{q.answer}&rdquo;</p>
                                  )}
                                  {q.evaluation && (
                                    <p className="text-xs text-slate-500 dark:text-slate-500">{q.evaluation}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Soft Skills */}
                    {evaluationData.conversation_analysis?.soft_skills && (
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-700">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                          <RiUserLine className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          Habilidades Blandas
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(evaluationData.conversation_analysis.soft_skills).map(([skill, description]) => (
                            <div key={skill} className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                              <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-2 capitalize text-sm">
                                {skill.replace('_', ' ')}
                              </h4>
                              <p className="text-xs text-slate-600 dark:text-slate-400">
                                {description || 'No hay información disponible'}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Technical Match */}
                    {evaluationData.match_evaluation?.technical_match && (
                      <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-6 border border-slate-200 dark:border-slate-600">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                          <RiRobotLine className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          Coincidencias Técnicas
                        </h3>
                        {evaluationData.match_evaluation.technical_match.exact_matches && evaluationData.match_evaluation.technical_match.exact_matches.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold text-green-800 dark:text-green-300 mb-2">Coincidencias Exactas</h4>
                            <div className="flex flex-wrap gap-2">
                              {evaluationData.match_evaluation.technical_match.exact_matches.map((tech: string, idx: number) => (
                                <span key={idx} className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm">
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {evaluationData.match_evaluation.technical_match.partial_matches && evaluationData.match_evaluation.technical_match.partial_matches.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-300 mb-2">Coincidencias Parciales</h4>
                            <div className="flex flex-wrap gap-2">
                              {evaluationData.match_evaluation.technical_match.partial_matches.map((tech: string, idx: number) => (
                                <span key={idx} className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full text-sm">
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {evaluationData.match_evaluation.technical_match.critical_gaps && evaluationData.match_evaluation.technical_match.critical_gaps.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-2">Habilidades Faltantes Críticas</h4>
                            <div className="flex flex-wrap gap-2">
                              {evaluationData.match_evaluation.technical_match.critical_gaps.map((tech: string, idx: number) => (
                                <span key={idx} className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-full text-sm">
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                      <RiRobotLine className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      Análisis con IA
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      No hay evaluación disponible para este candidato en esta entrevista.
                    </p>
                  </div>
                )}
              </div>

              {/* Footer del Modal */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedMeetForReport(null);
                    setEvaluationData(null);
                  }}
                  className="flex items-center gap-2"
                >
                  <RiCloseLine className="w-4 h-4" />
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
