/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toast } from '@/components/ui/toast';
import { Candidate, Meet, Conversation } from '@/lib/database/types';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'candidates' | 'meets' | 'conversations' | 'bulk-upload' | 'processes'>('candidates');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [meets, setMeets] = useState<Meet[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [meetForm, setMeetForm] = useState({ candidate_id: '' });
  const [candidateForm, setCandidateForm] = useState({ name: '', email: '', phone: '' });
  const [bulkUploadForm, setBulkUploadForm] = useState({ file: null as File | null });
  
  const [loading, setLoading] = useState({ candidates: false, meets: false, conversations: false, createCandidate: false, createMeet: false, sendEmail: false, bulkUpload: false, analyzeProcess: false });
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  useEffect(() => {
    fetchCandidates();
    fetchMeets();
    fetchConversations();
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


  const createCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, createCandidate: true }));
    try {
      const response = await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(candidateForm),
      });
      
      if (response.ok) {
        setCandidateForm({ name: '', email: '', phone: '' });
        fetchCandidates();
      }
    } catch (error) {
      console.error('Error creating candidate:', error);
    } finally {
      setLoading(prev => ({ ...prev, createCandidate: false }));
    }
  };

  const createMeet = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, createMeet: true }));
    try {
      const response = await fetch('/api/meets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meetForm),
      });
      
      if (response.ok) {
        setMeetForm({ candidate_id: '' });
        fetchMeets();
      }
    } catch (error) {
      console.error('Error creating meet:', error);
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
        subject: `Your Interview Link - ${candidate.name}`,
        body: `Hi ${candidate.name},\n\nYour interview has been scheduled. Please use the following link to join:\n\n${meet.link}\n\nPassword: ${meet.password}\n\nBest regards,\nHR Team`
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

  const executeAnalysis = async () => {
    setLoading(prev => ({ ...prev, analyzeProcess: true }));
    try {
      const response = await fetch('/api/processes/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setAnalysisResult(result);
        setToast({ 
          message: `Analysis completed successfully in ${result.execution_time || 'N/A'}`,
          type: 'success' 
        });
      } else {
        setToast({ 
          message: result.error || 'Analysis failed',
          type: 'error' 
        });
      }
    } catch (error) {
      console.error('Error executing analysis:', error);
      setToast({ message: 'Failed to execute analysis', type: 'error' });
    } finally {
      setLoading(prev => ({ ...prev, analyzeProcess: false }));
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      <div>


        {activeTab === 'candidates' && (
          <div className="animate-in grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">+</span>
                </div>
                <h2 className="text-xl font-semibold">Create Candidate</h2>
              </div>
              <form onSubmit={createCandidate} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Full Name</label>
                  <Input
                    value={candidateForm.name}
                    onChange={(e) => setCandidateForm({ ...candidateForm, name: e.target.value })}
                    placeholder="Enter candidate's full name"
                    className="h-12 transition-all focus:scale-[1.02]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Email Address</label>
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
                  <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Phone Number</label>
                  <Input
                    value={candidateForm.phone}
                    onChange={(e) => setCandidateForm({ ...candidateForm, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="h-12 transition-all focus:scale-[1.02]"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={loading.createCandidate}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading.createCandidate ? (
                    <div className="flex items-center gap-2">
                      <div className="loading-spinner"></div>
                      Creating...
                    </div>
                  ) : (
                    <>✨ Create Candidate</>
                  )}
                </Button>
              </form>
            </div>
            
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">👥</span>
                </div>
                <h2 className="text-xl font-semibold">Candidates ({candidates.length})</h2>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {loading.candidates ? (
                  <div className="text-center py-8">
                    <div className="loading-spinner mx-auto mb-2"></div>
                    <p className="text-muted-foreground">Loading candidates...</p>
                  </div>
                ) : candidates.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="text-4xl mb-2">📋</div>
                    <p>No candidates yet. Create your first candidate!</p>
                  </div>
                ) : (
                  candidates.map((candidate, index) => (
                    <div key={candidate.id} className="group p-4 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 hover:shadow-md transition-all duration-200 hover:scale-[1.01]" style={{animationDelay: `${index * 0.1}s`}}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                          {candidate.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {candidate.name}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">📧 {candidate.email}</p>
                          {candidate.phone && (
                            <p className="text-sm text-slate-600 dark:text-slate-400">📱 {candidate.phone}</p>
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
          <div className="animate-in grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">📅</span>
                </div>
                <h2 className="text-xl font-semibold">Schedule Interview</h2>
              </div>
              <form onSubmit={createMeet} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Select Candidate</label>
                  <select
                    value={meetForm.candidate_id}
                    onChange={(e) => setMeetForm({ ...meetForm, candidate_id: e.target.value })}
                    className="w-full h-12 p-3 border border-input rounded-md bg-background text-foreground transition-all focus:scale-[1.02] focus:ring-2 focus:ring-ring"
                    required
                  >
                    <option value="" disabled>Choose a candidate...</option>
                    {candidates.map((candidate) => (
                      <option key={candidate.id} value={candidate.id}>
                        👤 {candidate.name} - {candidate.email}
                      </option>
                    ))}
                  </select>
                </div>
                <Button 
                  type="submit" 
                  disabled={loading.createMeet}
                  className="w-full h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading.createMeet ? (
                    <div className="flex items-center gap-2">
                      <div className="loading-spinner"></div>
                      Scheduling...
                    </div>
                  ) : (
                    <>🚀 Schedule Interview</>
                  )}
                </Button>
              </form>
            </div>
            
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">📋</span>
                </div>
                <h2 className="text-xl font-semibold">Scheduled Interviews ({meets.length})</h2>
              </div>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {loading.meets ? (
                  <div className="text-center py-8">
                    <div className="loading-spinner mx-auto mb-2"></div>
                    <p className="text-muted-foreground">Loading interviews...</p>
                  </div>
                ) : meets.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="text-4xl mb-2">📅</div>
                    <p>No interviews scheduled yet. Create your first interview!</p>
                  </div>
                ) : (
                  meets.map((meet, index) => (
                    <div key={meet.id} className="group p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 hover:shadow-md transition-all duration-200" style={{animationDelay: `${index * 0.1}s`}}>
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                               Interview #{meet.id.slice(0, 8)}
                            </h3>
                            {meet.candidate && (
                              <div className="space-y-1 text-sm mb-2">
                                <p className="text-slate-700 dark:text-slate-300 font-medium">👤 {meet.candidate.name}</p>
                                <p className="text-slate-600 dark:text-slate-400">📧 {meet.candidate.email}</p>
                              </div>
                            )}
                            <div className="space-y-1 text-sm">
                              <p className="text-slate-600 dark:text-slate-400">🔑 Token: <code className="bg-slate-200 dark:bg-slate-600 px-2 py-1 rounded">{meet.token}</code></p>
                              <p className="text-slate-600 dark:text-slate-400">
                                📊 Status: <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  meet.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                  meet.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                  'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                                }`}>{meet.status}</span>
                              </p>
                              <p className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                                🔑 Password: <code className="bg-slate-200 dark:bg-slate-600 px-2 py-1 rounded font-mono text-slate-900 dark:text-slate-100 font-bold">
                                  {meet.password || 'No password available'}
                                </code>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCopyLink(meet.password || '')}
                                  className="hover:scale-105 transition-transform p-1 h-6 w-6"
                                  disabled={!meet.password}
                                >
                                  {copySuccess === meet.password ? '✅' : '📋'}
                                </Button>
                              </p>
                            </div>
                            <div className="mt-2">
                              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Interview Link:</p>
                              <a 
                                href={meet.link} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded transition-colors"
                              >
                                🔗 Join Interview
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                            </div>
                          </div>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => deleteMeet(meet.id)}
                            className="hover:scale-105 transition-transform"
                          >
                            🗑️
                          </Button>
                        </div>
                        <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-600">
                          <Button 
                            variant="secondary" 
                            size="sm"
                            onClick={() => handleSendLink(meet)}
                            disabled={loading.sendEmail}
                            className="flex-1 hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {loading.sendEmail ? (
                              <div className="flex items-center gap-1">
                                <div className="loading-spinner w-3 h-3"></div>
                                Sending...
                              </div>
                            ) : (
                              <>📧 Send Link</>
                            )}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleCopyLink(meet.link)}
                            className="hover:scale-[1.02] transition-transform"
                          >
                            {copySuccess === meet.link ? '✅ Copied!' : '📋 Copy'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'conversations' && (
          <div className="animate-in">
            {!selectedCandidate ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                <div className="card p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">💬</span>
                    </div>
                    <h2 className="text-xl font-semibold">Candidates with Conversations ({getCandidatesWithConversations().length})</h2>
                  </div>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {loading.conversations ? (
                      <div className="text-center py-8">
                        <div className="loading-spinner mx-auto mb-2"></div>
                        <p className="text-muted-foreground">Loading conversations...</p>
                      </div>
                    ) : getCandidatesWithConversations().length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <div className="text-4xl mb-2">💬</div>
                        <p>No conversations yet. Candidates will appear here after their interviews.</p>
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
                                <p className="text-sm text-slate-600 dark:text-slate-400">📧 {candidate.email}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                                  💬 {candidateConversations.length} conversation{candidateConversations.length !== 1 ? 's' : ''}
                                </p>
                              </div>
                              <div className="text-purple-400 group-hover:text-purple-600 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
                
                <div className="card p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">ℹ️</span>
                    </div>
                    <h2 className="text-xl font-semibold">Instructions</h2>
                  </div>
                  <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">How to view conversations:</h4>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Select a candidate from the left panel</li>
                        <li>Browse their conversation history</li>
                        <li>View AI and candidate messages in chat format</li>
                        <li>Use the back button to return to candidate list</li>
                      </ol>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-2">Message types:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        <li><span className="font-mono text-xs bg-slate-200 dark:bg-slate-700 px-1 rounded">ai</span> - Messages from the AI interviewer</li>
                        <li><span className="font-mono text-xs bg-slate-200 dark:bg-slate-700 px-1 rounded">user</span> - Messages from the candidate</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto">
                <div className="card p-6">
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
                      💬 {getCandidateConversations(selectedCandidate.id).length} conversation{getCandidateConversations(selectedCandidate.id).length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    {getCandidateConversations(selectedCandidate.id).map((conversation, index) => (
                      <div key={conversation.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">{index + 1}</span>
                          </div>
                          <h3 className="font-medium text-slate-800 dark:text-slate-200">
                            Conversation #{conversation.id.slice(0, 8)}
                          </h3>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {new Date(conversation.created_at).toLocaleDateString()} {new Date(conversation.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                        
                        <div className="space-y-3 max-h-80 overflow-y-auto">
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
                                      {message.source === 'user' ? '👤 Candidate' : '🤖 AI Interviewer'}
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
                      <div className="text-4xl mb-2">💬</div>
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
                    <span className="text-white text-sm font-bold">📂</span>
                  </div>
                  <h2 className="text-xl font-semibold">Bulk Upload Candidates</h2>
                </div>
                <form onSubmit={handleBulkUpload} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                      Upload File (CSV or TXT)
                    </label>
                    <input
                      type="file"
                      accept=".csv,.txt"
                      onChange={(e) => setBulkUploadForm({ file: e.target.files?.[0] || null })}
                      className="w-full h-12 p-3 border border-input rounded-md bg-background text-foreground transition-all focus:scale-[1.02] focus:ring-2 focus:ring-ring file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      required
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Supported formats: CSV (.csv) and plain text (.txt)
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
                        Uploading...
                      </div>
                    ) : (
                      <>🚀 Upload Candidates</>
                    )}
                  </Button>
                </form>
              </div>
              
              <div className="card p-6">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">ℹ️</span>
                  </div>
                  <h2 className="text-xl font-semibold">File Format Instructions</h2>
                </div>
                <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">CSV Format:</h4>
                    <code className="block text-xs bg-slate-100 dark:bg-slate-800 p-2 rounded mb-2">
                      Name,Email,Phone<br/>
                      John Doe,john@example.com,+1234567890<br/>
                      Jane Smith,jane@example.com,+0987654321
                    </code>
                    <p className="text-xs">Header row is optional. Phone number is optional.</p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">TXT Format Options:</h4>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs font-medium mb-1">Format 1 - Comma separated:</p>
                        <code className="block text-xs bg-slate-100 dark:bg-slate-800 p-1 rounded">
                          John Doe,john@example.com,+1234567890
                        </code>
                      </div>
                      <div>
                        <p className="text-xs font-medium mb-1">Format 2 - Angle brackets:</p>
                        <code className="block text-xs bg-slate-100 dark:bg-slate-800 p-1 rounded">
                          John Doe &lt;john@example.com&gt; +1234567890
                        </code>
                      </div>
                      <div>
                        <p className="text-xs font-medium mb-1">Format 3 - Space separated:</p>
                        <code className="block text-xs bg-slate-100 dark:bg-slate-800 p-1 rounded">
                          John Doe john@example.com +1234567890
                        </code>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <h4 className="font-medium text-yellow-800 dark:text-yellow-300 mb-2">Important Notes:</h4>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Name and email are required fields</li>
                      <li>Phone number is optional</li>
                      <li>Duplicate emails will be skipped</li>
                      <li>Invalid email formats will be rejected</li>
                      <li>Empty lines will be ignored</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'processes' && (
          <div className="animate-in max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              <div className="card p-6">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">⚙️</span>
                  </div>
                  <h2 className="text-xl font-semibold">AI Analysis Process</h2>
                </div>
                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Process Description</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Execute AI analysis on interview data using the multiagent system. 
                      This process will analyze candidate conversations and provide insights.
                    </p>
                  </div>
                  <Button 
                    onClick={executeAnalysis}
                    disabled={loading.analyzeProcess}
                    className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading.analyzeProcess ? (
                      <div className="flex items-center gap-2">
                        <div className="loading-spinner"></div>
                        Analyzing...
                      </div>
                    ) : (
                      <>🚀 Execute Analysis</>
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="card p-6">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">📊</span>
                  </div>
                  <h2 className="text-xl font-semibold">Analysis Results</h2>
                </div>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {analysisResult ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">Status</h4>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          {analysisResult.status || 'success'}
                        </p>
                      </div>
                      
                      {analysisResult.message && (
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Message</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {analysisResult.message}
                          </p>
                        </div>
                      )}
                      
                      {analysisResult.timestamp && (
                        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-2">Timestamp</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {new Date(analysisResult.timestamp).toLocaleString()}
                          </p>
                        </div>
                      )}
                      
                      {analysisResult.execution_time && (
                        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                          <h4 className="font-medium text-orange-800 dark:text-orange-300 mb-2">Execution Time</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {analysisResult.execution_time}
                          </p>
                        </div>
                      )}
                      
                      {analysisResult.results_file && (
                        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                          <h4 className="font-medium text-indigo-800 dark:text-indigo-300 mb-2">Results File</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400 font-mono">
                            {analysisResult.results_file}
                          </p>
                        </div>
                      )}
                      
                      {analysisResult.result?.raw_result && (
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-2">Raw Results</h4>
                          <div className="text-sm text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 p-3 rounded overflow-x-auto">
                            <pre className="whitespace-pre-wrap">
                              {typeof analysisResult.result.raw_result === 'string' 
                                ? analysisResult.result.raw_result 
                                : JSON.stringify(analysisResult.result.raw_result, null, 2)
                              }
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <div className="text-4xl mb-2">📊</div>
                      <p>No analysis results yet. Execute the analysis to see results here.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      </div>
    </DashboardLayout>
  );
}
