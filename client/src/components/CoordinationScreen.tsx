import React, { useState } from 'react';
import { Issue } from '@neighborly/shared';

interface CoordinationScreenProps {
  issue: Issue;
  onBack: () => void;
  onToggleTask: (taskIndex: number) => void;
  onAddTask: (text: string) => void;
  onSendMessage: (text: string) => void;
  onPostPublicUpdate: (text: string) => void;
  onInviteOrg: (name: string) => void;
  onToggleStatus: () => void;
}

export const CoordinationScreen: React.FC<CoordinationScreenProps> = ({
  issue,
  onBack,
  onToggleTask,
  onAddTask,
  onSendMessage,
  onPostPublicUpdate,
  onInviteOrg,
  onToggleStatus
}) => {
  const [taskInput, setTaskInput] = useState('');
  const [msgInput, setMsgInput] = useState('');
  const [publicInput, setPublicInput] = useState('');

  const orgName = 'Green Elm';
  const completedTasks = issue.tasks.filter(t => t.done).length;
  const totalTasks = issue.tasks.length;

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskInput.trim()) return;
    onAddTask(taskInput.trim());
    setTaskInput('');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgInput.trim()) return;
    onSendMessage(msgInput.trim());
    setMsgInput('');
  };

  const handlePostPublic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicInput.trim()) return;
    onPostPublicUpdate(publicInput.trim());
    setPublicInput('');
  };

  // Find candidate to invite
  const candidate = [
    { name: 'Elm Park Neighbors', why: 'Can recruit more volunteers from the block.' },
    { name: 'District 4 Office', why: 'Can speed up city departmental help.' }
  ].find(c => !issue.orgs.some(o => o.name === c.name));

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-surface text-charcoal p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b-2 border-charcoal/10">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-charcoal bg-cream font-nunito font-extrabold text-xs shadow-hard-sm"
        >
          ← Back to Issue
        </button>

        <button
          onClick={onToggleStatus}
          className={`px-3 py-1.5 rounded-xl border-2 border-charcoal font-nunito font-black text-xs shadow-hard-sm transition-colors ${
            issue.status === 'fixed'
              ? 'bg-softGreen text-forest-dark'
              : 'bg-cream hover:bg-yellow-100 text-charcoal'
          }`}
        >
          {issue.status === 'fixed' ? 'Fixed ✓ · Reopen' : 'Mark as Fixed'}
        </button>
      </div>

      {/* Title */}
      <div className="mt-3">
        <div className="text-xs font-nunito font-extrabold text-forest uppercase tracking-wider">
          Inter-Org Workspace
        </div>
        <h2 className="font-fredoka font-bold text-xl sm:text-2xl mt-0.5">
          {issue.title}
        </h2>
        <div className="text-xs font-nunito text-charcoal/70 mt-1">
          Coordinating with {issue.orgs.map(o => o.name).join(', ')}
        </div>
      </div>

      {/* SECTION 1: Shared Task Checklist */}
      <div className="mt-5 p-4 rounded-2xl bg-cream border-2 border-charcoal shadow-hard-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="font-nunito font-black text-sm">Collaborative Tasks</span>
          <span className="text-xs font-nunito font-bold px-2 py-0.5 rounded-full bg-surface border border-charcoal">
            {completedTasks} of {totalTasks} done
          </span>
        </div>

        {/* Task List */}
        <div className="space-y-2 mb-3">
          {issue.tasks.map((task, idx) => (
            <div
              key={idx}
              onClick={() => onToggleTask(idx)}
              className="flex items-center justify-between p-2.5 rounded-xl bg-surface border-2 border-charcoal/30 hover:border-charcoal cursor-pointer select-none transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-5 h-5 rounded-md border-2 border-charcoal flex items-center justify-center font-bold text-xs ${
                    task.done ? 'bg-forest text-white' : 'bg-cream text-transparent'
                  }`}
                >
                  ✓
                </div>
                <span className={`text-xs font-nunito font-bold ${task.done ? 'line-through opacity-50' : ''}`}>
                  {task.t}
                </span>
              </div>
              <span className="text-[10px] font-nunito font-extrabold px-1.5 py-0.5 rounded bg-cream text-charcoal/70">
                {task.who}
              </span>
            </div>
          ))}
        </div>

        {/* Add Task Input */}
        <form onSubmit={handleAddTask} className="flex gap-2">
          <input
            type="text"
            value={taskInput}
            onChange={e => setTaskInput(e.target.value)}
            placeholder="+ Add a step for the team..."
            className="flex-1 px-3 py-1.5 rounded-xl bg-surface border-2 border-charcoal font-nunito text-xs outline-none"
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-xl bg-forest text-white font-nunito font-black text-xs border-2 border-charcoal shadow-hard-sm"
          >
            Add
          </button>
        </form>
      </div>

      {/* SECTION 2: Private Coordination Discussion */}
      <div className="mt-5 p-4 rounded-2xl bg-surface border-2 border-charcoal shadow-hard-sm">
        <div className="font-nunito font-black text-sm mb-3 flex items-center justify-between">
          <span>Private Discussion Thread</span>
          <span className="text-[10px] font-nunito font-bold text-charcoal/60 uppercase">Visible to orgs only</span>
        </div>

        {/* Message Thread */}
        <div className="space-y-2.5 max-h-48 overflow-y-auto mb-3 p-2 bg-cream/50 rounded-xl border border-charcoal/20">
          {issue.thread.length > 0 ? (
            issue.thread.map((msg, idx) => {
              const isMine = msg.who === orgName;
              return (
                <div key={idx} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                  <div className="text-[10px] font-nunito font-bold text-charcoal/60 mb-0.5">
                    {msg.who}
                  </div>
                  <div
                    className={`max-w-[85%] px-3 py-2 rounded-xl text-xs font-nunito border-2 border-charcoal shadow-hard-sm ${
                      isMine ? 'bg-forest text-white' : 'bg-surface text-charcoal'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center text-xs font-nunito text-charcoal/50 py-4">
              No messages yet. Send a note to partner orgs below.
            </div>
          )}
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={msgInput}
            onChange={e => setMsgInput(e.target.value)}
            placeholder="Coordinate timing, equipment, permits..."
            className="flex-1 px-3 py-2 rounded-xl bg-cream border-2 border-charcoal font-nunito text-xs outline-none"
          />
          <button
            type="submit"
            className="px-3.5 py-2 rounded-xl bg-charcoal text-white font-nunito font-black text-xs border-2 border-charcoal shadow-hard-sm"
          >
            Send
          </button>
        </form>
      </div>

      {/* SECTION 3: Invite Partner Organization */}
      {candidate && (
        <div className="mt-5 p-3.5 rounded-2xl bg-softPurple border-2 border-charcoal shadow-hard-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-nunito font-black text-civicPurple uppercase">Invite Collaborator</div>
            <div className="font-nunito font-black text-sm">{candidate.name}</div>
            <div className="text-[11px] text-charcoal/70">{candidate.why}</div>
          </div>
          <button
            onClick={() => onInviteOrg(candidate.name)}
            className="px-3 py-1.5 rounded-xl bg-surface hover:bg-cream border-2 border-charcoal font-nunito font-black text-xs shadow-hard-sm"
          >
            + Invite
          </button>
        </div>
      )}

      {/* SECTION 4: Post Public Progress Update */}
      <div className="mt-5 p-4 rounded-2xl bg-cream border-2 border-charcoal shadow-hard-sm">
        <div className="font-nunito font-black text-sm mb-1">Post Update for Neighbors</div>
        <p className="text-xs font-nunito text-charcoal/70 mb-3">
          This post appears on the resident timeline to keep the community informed.
        </p>

        <form onSubmit={handlePostPublic} className="space-y-2">
          <textarea
            value={publicInput}
            onChange={e => setPublicInput(e.target.value)}
            rows={2}
            placeholder="e.g., Dumpster confirmed for Friday. Cleanup tools arriving tomorrow morning."
            className="w-full px-3 py-2 rounded-xl bg-surface border-2 border-charcoal font-nunito text-xs outline-none resize-none"
          />
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-forest hover:bg-forest-light text-white font-nunito font-black text-xs border-2 border-charcoal shadow-hard transition-transform active:scale-[0.98]"
          >
            Post Public Update
          </button>
        </form>
      </div>
    </div>
  );
};
