import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Topbar from '../components/layout/Topbar';
import { getCurrentUser, updateCurrentUser } from '../api/users.api';
import { getActiveSessions, revokeSession } from '../api/sessions.api';
import { useAuthStore } from '../store/auth.store';
import { User, Sliders, Bell, Shield, MonitorSmartphone, Smartphone, Key } from 'lucide-react';

const Settings = () => {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore(state => state.setAuth);
  
  const [activeTab, setActiveTab] = useState('profile');
  
  const [formData, setFormData] = useState({
    username: '',
    avatar: '',
    currentPassword: '',
    newPassword: '',
    theme: 'dark',
    startOfWeek: 'monday',
    defaultView: 'kanban',
    emailMentions: true,
    emailAssignments: true,
    pushDueReminders: true,
    pushBoardUpdates: false,
    twoFactorEnabled: false
  });
  
  const [message, setMessage] = useState('');

  const { data: user, isLoading } = useQuery({
    queryKey: ['current-user'],
    queryFn: getCurrentUser,
  });

  const { data: activeSessions, refetch: refetchSessions } = useQuery({
    queryKey: ['active-sessions'],
    queryFn: getActiveSessions,
    enabled: activeTab === 'security',
  });

  const revokeMutation = useMutation({
    mutationFn: revokeSession,
    onSuccess: () => {
      refetchSessions();
    }
  });

  const handleRevoke = (sessionId) => {
    if (confirm('Are you sure you want to revoke this session?')) {
      revokeMutation.mutate(sessionId);
    }
  };

  useEffect(() => {
    if (user) {
      setFormData(prev => ({ 
        ...prev, 
        username: user.username, 
        avatar: user.avatar || '',
        theme: user.theme || 'dark',
        startOfWeek: user.startOfWeek || 'monday',
        defaultView: user.defaultView || 'kanban',
        emailMentions: user.emailMentions,
        emailAssignments: user.emailAssignments,
        pushDueReminders: user.pushDueReminders,
        pushBoardUpdates: user.pushBoardUpdates,
        twoFactorEnabled: user.twoFactorEnabled
      }));
    }
  }, [user]);

  useEffect(() => {
    if (formData.theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, [formData.theme]);

  const updateMutation = useMutation({
    mutationFn: updateCurrentUser,
    onSuccess: (data) => {
      setMessage('Settings updated successfully!');
      queryClient.setQueryData(['current-user'], data);
      setAuth(useAuthStore.getState().token, data.username, data.role);
      setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '' }));
      setTimeout(() => setMessage(''), 3000);
    },
    onError: (error) => {
      setMessage(error.response?.data?.message || 'Failed to update settings');
    }
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('');
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center text-secondary">Loading settings...</div>;
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Sliders },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="flex flex-col h-full">
      <Topbar leftContent={<h1 className="font-sans font-semibold text-[15px] text-primary">Settings</h1>} />
      <main className="flex-1 p-6 lg:p-8 bg-base overflow-y-auto relative">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="font-display font-semibold text-2xl text-primary mb-2">Account Settings</h2>
            <p className="font-sans text-[14px] text-secondary">Manage your personal profile, preferences, and security.</p>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar Navigation */}
            <div className="md:w-64 shrink-0 flex flex-col gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-md flex items-center gap-3 font-sans font-medium text-[14px] transition-colors ${
                    activeTab === tab.id
                      ? 'bg-accent-blue/10 text-accent-blue'
                      : 'text-secondary hover:bg-hover hover:text-primary'
                  }`}
                >
                  <tab.icon size={16} className={activeTab === tab.id ? 'text-accent-blue' : 'text-muted'} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
              <div className="bg-surface border border-subtle rounded-xl p-6 shadow-sm">
                
                {message && (
                  <div className={`mb-6 p-3 rounded-lg text-sm font-medium ${message.includes('success') ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {message}
                  </div>
                )}

                {/* --- PROFILE TAB --- */}
                {activeTab === 'profile' && (
                  <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
                    <h3 className="font-sans font-medium text-lg text-primary mb-4 border-b border-dim pb-2">Profile Information</h3>
                    
                    <div className="flex items-center gap-6 mb-6">
                      <div className="w-16 h-16 rounded-full bg-elevated border border-subtle flex items-center justify-center shrink-0 overflow-hidden">
                        {formData.avatar ? (
                          <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-display font-bold text-2xl text-primary">{formData.username?.charAt(0) || 'U'}</span>
                        )}
                      </div>
                      <div>
                        <label className="cursor-pointer text-[13px] font-medium text-accent-blue hover:text-[#3d7ae6] transition-colors">
                          Upload new avatar
                          <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                        </label>
                        <p className="text-[12px] text-muted mt-1">Recommended size: 256x256px.</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block font-sans font-medium text-sm text-primary mb-1.5">Username</label>
                        <input
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleChange}
                          required
                          className="w-full max-w-md h-9 bg-elevated border border-subtle rounded-md px-3 font-sans text-[13px] text-primary focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-colors shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block font-sans font-medium text-sm text-primary mb-1.5">Avatar URL</label>
                        <input
                          type="text"
                          name="avatar"
                          value={formData.avatar}
                          onChange={handleChange}
                          placeholder="https://example.com/avatar.png"
                          className="w-full max-w-md h-9 bg-elevated border border-subtle rounded-md px-3 font-sans text-[13px] text-primary focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-colors shadow-sm"
                        />
                      </div>
                    </div>

                    <div className="pt-4 mt-6 border-t border-dim">
                      <button 
                        type="submit"
                        disabled={updateMutation.isPending}
                        className="h-9 px-4 rounded-md bg-accent-blue text-white font-sans font-medium text-[13px] shadow-sm transition-all hover:bg-[#3d7ae6] disabled:opacity-50"
                      >
                        {updateMutation.isPending ? 'Saving...' : 'Save Profile'}
                      </button>
                    </div>
                  </form>
                )}

                {/* --- PREFERENCES TAB --- */}
                {activeTab === 'preferences' && (
                  <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
                    <h3 className="font-sans font-medium text-lg text-primary mb-4 border-b border-dim pb-2">Display & Workspace</h3>
                    
                    <div className="space-y-5">
                      <div>
                        <label className="block font-sans font-medium text-sm text-primary mb-1.5">Theme</label>
                        <div className="flex items-center gap-3">
                          <button 
                            type="button" 
                            onClick={() => setFormData({...formData, theme: 'dark'})}
                            className={`px-4 py-2 rounded-md border font-medium text-[13px] transition-colors ${formData.theme === 'dark' ? 'border-accent-blue bg-accent-blue/5 text-accent-blue' : 'border-subtle bg-elevated text-secondary hover:text-primary'}`}
                          >
                            Dark (Default)
                          </button>
                          <button 
                            type="button" 
                            onClick={() => setFormData({...formData, theme: 'light'})}
                            className={`px-4 py-2 rounded-md border font-medium text-[13px] transition-colors ${formData.theme === 'light' ? 'border-accent-blue bg-accent-blue/5 text-accent-blue' : 'border-subtle bg-elevated text-secondary hover:text-primary'}`}
                          >
                            Light
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block font-sans font-medium text-sm text-primary mb-1.5">Start of the week</label>
                        <select name="startOfWeek" value={formData.startOfWeek} onChange={handleChange} className="w-full max-w-[200px] h-9 bg-elevated border border-subtle rounded-md px-3 font-sans text-[13px] text-primary focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue shadow-sm">
                          <option value="monday">Monday</option>
                          <option value="sunday">Sunday</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-sans font-medium text-sm text-primary mb-1.5">Default Board View</label>
                        <select name="defaultView" value={formData.defaultView} onChange={handleChange} className="w-full max-w-[200px] h-9 bg-elevated border border-subtle rounded-md px-3 font-sans text-[13px] text-primary focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue shadow-sm">
                          <option value="kanban">Kanban Board</option>
                          <option value="list">List View</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="pt-4 mt-6 border-t border-dim">
                      <button type="submit" disabled={updateMutation.isPending} className="h-9 px-4 rounded-md bg-accent-blue text-white font-sans font-medium text-[13px] shadow-sm transition-all hover:bg-[#3d7ae6]">
                        {updateMutation.isPending ? 'Saving...' : 'Save Preferences'}
                      </button>
                    </div>
                  </form>
                )}

                {/* --- NOTIFICATIONS TAB --- */}
                {activeTab === 'notifications' && (
                  <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
                    <h3 className="font-sans font-medium text-lg text-primary mb-4 border-b border-dim pb-2">Notification Triggers</h3>
                    
                    <div className="space-y-4">
                      {[
                        { title: 'Task Mentions', desc: 'When someone @mentions you in a task or comment', emailName: 'emailMentions' },
                        { title: 'Task Assignments', desc: 'When you are assigned to a new task', emailName: 'emailAssignments' },
                        { title: 'Due Date Reminders', desc: '24 hours before a task is due', pushName: 'pushDueReminders' },
                        { title: 'Board Updates', desc: 'When a new board is created in the workspace', pushName: 'pushBoardUpdates' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-start justify-between py-3 border-b border-dim last:border-0">
                          <div>
                            <div className="font-medium text-sm text-primary">{item.title}</div>
                            <div className="text-[12px] text-secondary mt-0.5">{item.desc}</div>
                          </div>
                          <div className="flex items-center gap-4">
                            {item.emailName && (
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" name={item.emailName} checked={formData[item.emailName] || false} onChange={handleChange} className="w-4 h-4 rounded border-subtle text-accent-blue focus:ring-accent-blue focus:ring-offset-base bg-elevated" />
                                <span className="text-[13px] text-secondary font-medium">Email</span>
                              </label>
                            )}
                            {item.pushName && (
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" name={item.pushName} checked={formData[item.pushName] || false} onChange={handleChange} className="w-4 h-4 rounded border-subtle text-accent-blue focus:ring-accent-blue focus:ring-offset-base bg-elevated" />
                                <span className="text-[13px] text-secondary font-medium">Push</span>
                              </label>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="pt-4 mt-6 border-t border-dim">
                      <button type="submit" disabled={updateMutation.isPending} className="h-9 px-4 rounded-md bg-accent-blue text-white font-sans font-medium text-[13px] shadow-sm transition-all hover:bg-[#3d7ae6]">
                        {updateMutation.isPending ? 'Updating...' : 'Update Notifications'}
                      </button>
                    </div>
                  </form>
                )}

                {/* --- SECURITY TAB --- */}
                {activeTab === 'security' && (
                  <div className="space-y-8 animate-fade-in">
                    <form onSubmit={handleSubmit}>
                      <h3 className="font-sans font-medium text-lg text-primary mb-4 border-b border-dim pb-2 flex items-center gap-2">
                        <Key size={16} /> Change Password
                      </h3>
                      <div className="space-y-4 mb-6">
                        <div>
                          <label className="block font-sans font-medium text-sm text-primary mb-1.5">Current Password</label>
                          <input
                            type="password"
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleChange}
                            className="w-full max-w-md h-9 bg-elevated border border-subtle rounded-md px-3 font-sans text-[13px] text-primary focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue shadow-sm"
                          />
                        </div>
                        <div>
                          <label className="block font-sans font-medium text-sm text-primary mb-1.5">New Password</label>
                          <input
                            type="password"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            className="w-full max-w-md h-9 bg-elevated border border-subtle rounded-md px-3 font-sans text-[13px] text-primary focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue shadow-sm"
                          />
                        </div>
                        <button 
                          type="submit"
                          disabled={updateMutation.isPending || !formData.newPassword}
                          className="h-9 px-4 rounded-md bg-accent-blue text-white font-sans font-medium text-[13px] shadow-sm transition-all hover:bg-[#3d7ae6] disabled:opacity-50"
                        >
                          {updateMutation.isPending ? 'Updating...' : 'Update Password'}
                        </button>
                      </div>
                    </form>

                    <div>
                      <h3 className="font-sans font-medium text-lg text-primary mb-4 border-b border-dim pb-2 flex items-center gap-2">
                        <Shield size={16} /> Two-Factor Authentication
                      </h3>
                      <div className="flex items-center justify-between p-4 bg-elevated border border-subtle rounded-lg">
                        <div>
                          <div className="font-medium text-sm text-primary">Authenticator App</div>
                          <div className="text-[12px] text-secondary mt-0.5">Use an app like Google Authenticator to get 2FA codes.</div>
                        </div>
                        <button className="h-8 px-3 rounded-md border border-subtle bg-base text-secondary hover:text-primary transition-colors font-medium text-[13px]">
                          Enable 2FA
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-sans font-medium text-lg text-primary mb-4 border-b border-dim pb-2 flex items-center gap-2">
                        <MonitorSmartphone size={16} /> Active Sessions
                      </h3>
                      <div className="space-y-3">
                        {(!activeSessions || activeSessions.length === 0) ? (
                          <div className="text-secondary text-[13px] p-6 text-center border border-dashed border-subtle rounded-lg bg-elevated/50">
                            No active sessions found. You may be using an older login session. <br/> Please log out and log back in to begin tracking active sessions.
                          </div>
                        ) : activeSessions.map(session => {
                          const isCurrent = session.isCurrentSession;
                          
                          // Very simple user agent parser for UI
                          const osMatch = session.userAgent?.match(/\(([^)]+)\)/);
                          const os = osMatch ? osMatch[1].split(';')[0] : 'Unknown OS';
                          let browser = 'Unknown Browser';
                          if (session.userAgent?.includes('Chrome')) browser = 'Chrome';
                          else if (session.userAgent?.includes('Safari')) browser = 'Safari';
                          else if (session.userAgent?.includes('Firefox')) browser = 'Firefox';
                          else if (session.userAgent?.includes('Edge')) browser = 'Edge';
                          
                          return (
                            <div key={session.sessionId} className={`flex items-center justify-between p-3 rounded-lg ${isCurrent ? 'border border-accent-blue/30 bg-accent-blue/5' : 'border border-subtle bg-elevated'}`}>
                              <div className="flex items-center gap-3">
                                {session.userAgent?.includes('Mobi') ? <Smartphone size={18} className={isCurrent ? "text-accent-blue" : "text-secondary"} /> : <MonitorSmartphone size={18} className={isCurrent ? "text-accent-blue" : "text-secondary"} />}
                                <div>
                                  <div className="font-medium text-sm text-primary flex items-center gap-2">
                                    {os} • {browser}
                                    {isCurrent && <span className="px-1.5 py-0.5 bg-accent-blue/20 text-accent-blue text-[10px] rounded uppercase font-bold tracking-wider">Current</span>}
                                  </div>
                                  <div className="text-[12px] text-secondary mt-0.5">IP: {session.ipAddress} • Last active: {new Date(session.lastActiveAt).toLocaleString()}</div>
                                </div>
                              </div>
                              {!isCurrent && (
                                <button 
                                  onClick={() => handleRevoke(session.sessionId)}
                                  disabled={revokeMutation.isPending}
                                  className="text-[13px] font-medium text-red-500 hover:text-red-400 disabled:opacity-50"
                                >
                                  Revoke
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
