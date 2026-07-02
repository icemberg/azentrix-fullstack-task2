import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Plus, Check } from 'lucide-react';
import useTeamStore from '../../store/team.store';
import { useNavigate } from 'react-router-dom';

const TeamSwitcher = ({ isCollapsed }) => {
  const { teams, activeTeamId, setActiveTeam, fetchTeams } = useTeamStore();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const activeTeam = teams.find(t => t.teamId === activeTeamId);

  const handleSelect = (teamId) => {
    setActiveTeam(teamId);
    setIsOpen(false);
  };

  const handleManageTeams = () => {
    setIsOpen(false);
    navigate('/teams');
  };

  if (!activeTeam && teams.length === 0) return null;

  return (
    <div className="relative px-3 py-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between h-10 px-2 rounded-md hover:bg-hover transition-colors"
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div 
            className="w-6 h-6 rounded flex items-center justify-center shrink-0 text-white font-display text-[12px] font-bold"
            style={{ backgroundColor: activeTeam?.avatarColor || '#3b82f6' }}
          >
            {activeTeam?.name?.charAt(0).toUpperCase() || 'W'}
          </div>
          {!isCollapsed && (
            <div className="flex flex-col items-start overflow-hidden">
              <span className="font-sans font-medium text-[13px] text-primary truncate w-full">
                {activeTeam?.name || 'Workspace'}
              </span>
              <span className="font-sans text-[11px] text-muted truncate w-full">
                {activeTeam?.isPersonal ? 'Personal' : 'Team Workspace'}
              </span>
            </div>
          )}
        </div>
        {!isCollapsed && <ChevronDown size={14} className="text-muted shrink-0" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute top-12 left-3 w-64 bg-elevated border border-subtle rounded-lg shadow-xl z-50 p-1 flex flex-col"
            >
              <div className="px-2 py-1.5 font-sans text-[11px] font-semibold text-muted uppercase tracking-wider">
                Your Workspaces
              </div>
              
              <div className="max-h-[50vh] overflow-y-auto custom-scrollbar">
                {teams.map((team) => (
                  <button
                    key={team.teamId}
                    onClick={() => handleSelect(team.teamId)}
                    className="w-full flex items-center justify-between px-2 py-1.5 rounded hover:bg-hover transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div 
                        className="w-5 h-5 rounded flex items-center justify-center shrink-0 text-white font-display text-[10px] font-bold"
                        style={{ backgroundColor: team.avatarColor || '#3b82f6' }}
                      >
                        {team.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-sans text-[13px] text-primary truncate max-w-[150px]">
                        {team.name}
                      </span>
                    </div>
                    {activeTeamId === team.teamId && (
                      <Check size={14} className="text-accent-blue" />
                    )}
                  </button>
                ))}
              </div>

              <div className="h-px bg-dim my-1" />
              
              <button
                onClick={handleManageTeams}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-hover transition-colors"
              >
                <Plus size={14} className="text-muted" />
                <span className="font-sans text-[13px] text-secondary">Manage Teams</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeamSwitcher;
