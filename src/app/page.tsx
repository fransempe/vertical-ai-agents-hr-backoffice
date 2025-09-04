'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toast } from '@/components/ui/toast';
import { Candidate, Meet } from '@/lib/database/types';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'candidates' | 'meets'>('candidates');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [meets, setMeets] = useState<Meet[]>([]);
  const [meetForm, setMeetForm] = useState({ candidate_id: '' });
  const [candidateForm, setCandidateForm] = useState({ name: '', email: '', phone: '' });
  
  const [loading, setLoading] = useState({ candidates: false, meets: false, createCandidate: false, createMeet: false, sendEmail: false });
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    fetchCandidates();
    fetchMeets();
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-4 sm:p-6 max-w-6xl">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            HR Interview Backoffice
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg px-4">
            Manage candidates and schedule interviews efficiently
          </p>
        </div>
      
        <div className="flex justify-center mb-8 sm:mb-12">
          <div className="inline-flex p-1 bg-white/50 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg dark:bg-slate-800/50 dark:border-slate-700/50">
            <button
              onClick={() => setActiveTab('candidates')}
              className={`px-4 sm:px-6 py-3 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
                activeTab === 'candidates'
                  ? 'bg-white text-blue-600 shadow-md dark:bg-slate-700 dark:text-blue-400'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700/50'
              }`}
            >
              <span className="hidden sm:inline">👥 Candidates</span>
              <span className="sm:hidden">👥</span>
            </button>
            <button
              onClick={() => setActiveTab('meets')}
              className={`px-4 sm:px-6 py-3 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
                activeTab === 'meets'
                  ? 'bg-white text-blue-600 shadow-md dark:bg-slate-700 dark:text-blue-400'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700/50'
              }`}
            >
              <span className="hidden sm:inline">📅 Interviews</span>
              <span className="sm:hidden">📅</span>
            </button>
          </div>
        </div>


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
        
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
}
