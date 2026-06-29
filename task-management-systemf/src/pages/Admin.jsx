import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreHorizontal, X, Shield, AlertTriangle, Briefcase, Mail } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Topbar from '../components/layout/Topbar';
import { getAllUsers, updateUserRole } from '../api/admin.api';
import { useAuthStore } from '../store/auth.store';

const Admin = () => {
  const queryClient = useQueryClient();
  const { role: currentUserRole, username: currentUsername } = useAuthStore();
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState('');

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: getAllUsers,
  });

  const updateRoleMutation = useMutation({
    mutationFn: updateUserRole,
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      setMessage('Role updated successfully.');
      setTimeout(() => setMessage(''), 3000);
      closeModal();
    },
    onError: (error) => {
      setMessage(error.response?.data?.message || 'Failed to update role.');
      setTimeout(() => setMessage(''), 3000);
    }
  });

  const openEditModal = (user) => {
    setSelectedUser({ ...user });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedUser(null), 200);
  };

  const handleRoleChange = (e) => {
    setSelectedUser({ ...selectedUser, role: e.target.value });
  };

  const handleSave = () => {
    if (selectedUser.username === currentUsername && selectedUser.role !== 'ADMIN') {
      setMessage('You cannot demote yourself from Admin.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    updateRoleMutation.mutate({ id: selectedUser.id, role: selectedUser.role });
  };

  return (
    <>
      <Topbar leftContent={<h1 className="font-sans font-semibold text-[15px] text-primary">Team Members</h1>} />
      <main className="flex-1 p-6 lg:p-8 bg-base overflow-y-auto relative">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="font-display font-semibold text-2xl text-primary mb-2">Members & Roles</h2>
              <p className="font-sans text-[14px] text-secondary">Manage your team members, view capacity, and configure access levels.</p>
            </div>
          </div>

          {message && (
            <div className={`mb-6 p-3 rounded-lg text-sm font-medium ${message.includes('success') ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
              {message}
            </div>
          )}

          <div className="bg-surface border border-subtle rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="p-8 text-center text-secondary">Loading team members...</div>
              ) : (
                <table className="w-full text-left font-sans whitespace-nowrap">
                <thead>
                  <tr className="border-b border-dim bg-elevated">
                    <th className="px-6 py-3 text-[12px] font-medium text-secondary uppercase tracking-wider">Member</th>
                    <th className="px-6 py-3 text-[12px] font-medium text-secondary uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-[12px] font-medium text-secondary uppercase tracking-wider">Workload</th>
                    <th className="px-6 py-3 text-[12px] font-medium text-secondary uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-[12px] font-medium text-secondary uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dim">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-hover transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-9 h-9 rounded-full bg-elevated border border-subtle flex items-center justify-center overflow-hidden">
                              {user.avatar ? (
                                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                              ) : (
                                <span className="font-display font-bold text-[13px] text-primary">{user.username.charAt(0).toUpperCase()}</span>
                              )}
                            </div>
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-surface bg-green-500"></span>
                          </div>
                          <div>
                            <div className="font-medium text-[14px] text-primary">{user.username}</div>
                            <div className="text-[12px] text-muted">{user.role}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-medium border ${
                          user.role === 'ADMIN' 
                          ? 'bg-accent-violet/10 text-accent-violet border-accent-violet/20' 
                          : 'bg-secondary/10 text-secondary border-secondary/20'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-dim rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-accent-blue" style={{ width: '40%' }} />
                          </div>
                          <span className="text-[12px] text-secondary font-medium">-- tasks</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[13px] text-secondary">Joined Recently</td>
                      <td className="px-6 py-4 text-right">
                        {currentUserRole === 'ADMIN' && (
                          <button 
                            onClick={() => openEditModal(user)}
                            className="px-3 py-1.5 rounded-md text-[13px] text-secondary hover:text-accent-blue hover:bg-accent-blue/10 font-medium transition-colors"
                          >
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Edit Modal Overlay */}
      <AnimatePresence>
        {isModalOpen && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-base/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md bg-surface border border-subtle rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-subtle bg-elevated/50">
                <h3 className="font-display font-semibold text-lg text-primary">Edit Team Member</h3>
                <button onClick={closeModal} className="text-secondary hover:text-primary transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Identity */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-elevated border border-subtle flex items-center justify-center shrink-0 overflow-hidden">
                    {selectedUser.avatar ? (
                      <img src={selectedUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-display font-bold text-xl text-primary">{selectedUser.username.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-base text-primary">{selectedUser.username}</div>
                    <div className="flex items-center gap-1.5 text-[13px] text-secondary mt-0.5">
                      <Shield size={14} className={selectedUser.role === 'ADMIN' ? 'text-accent-violet' : 'text-secondary'} />
                      {selectedUser.role}
                    </div>
                  </div>
                </div>

                <hr className="border-dim" />

                {/* Role Management */}
                <div>
                  <h4 className="flex items-center gap-2 font-sans font-medium text-[14px] text-primary mb-3">
                    <Shield size={16} className="text-accent-blue" />
                    Role & Permissions
                  </h4>
                  <div className="bg-base border border-dim rounded-lg p-1">
                    <select 
                      value={selectedUser.role} 
                      onChange={handleRoleChange}
                      className="w-full bg-transparent text-[14px] text-primary p-2 focus:outline-none cursor-pointer"
                    >
                      <option value="MEMBER">Member (Can edit tasks and view boards)</option>
                      <option value="ADMIN">Admin (Full access, can manage users)</option>
                    </select>
                  </div>
                  {selectedUser.role === 'ADMIN' && (
                    <p className="mt-2 text-[12px] text-accent-violet flex items-center gap-1.5">
                      <AlertTriangle size={12} />
                      Admins have unrestricted access to this workspace.
                    </p>
                  )}
                </div>

                <hr className="border-dim" />

                {/* Capacity Insight */}
                <div>
                  <h4 className="flex items-center gap-2 font-sans font-medium text-[14px] text-primary mb-3">
                    <Briefcase size={16} className="text-secondary" />
                    Current Workload
                  </h4>
                  <div className="bg-elevated rounded-lg p-4 flex items-center justify-between border border-subtle">
                    <div className="text-[13px] text-secondary">Active Tasks Assigned</div>
                    <div className="font-display font-semibold text-lg text-primary">--</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end px-6 py-4 border-t border-subtle bg-elevated/50">
                <div className="flex gap-3">
                  <button onClick={closeModal} className="px-4 py-2 rounded-md text-[13px] font-medium text-secondary hover:text-primary transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleSave} disabled={updateRoleMutation.isPending} className="px-4 py-2 rounded-md bg-accent-blue text-white text-[13px] font-medium hover:bg-[#3d7ae6] transition-colors shadow-sm disabled:opacity-50">
                    {updateRoleMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Admin;
