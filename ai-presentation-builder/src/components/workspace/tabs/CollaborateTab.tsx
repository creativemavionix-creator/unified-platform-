import React, { useState } from 'react';
import { Users, MessageSquare, Link2, Shield, Clock, Send, Circle } from 'lucide-react';
import { COLLABORATORS, COMMENTS, VERSION_HISTORY } from '../../../data/presentationMockData';

const card = 'rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0c14] p-5 sm:p-6';
const label = 'text-[11px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500';

const ROLES = ['Viewer', 'Commenter', 'Editor'];

export default function CollaborateTab() {
  const [reply, setReply] = useState('');
  const [permission, setPermission] = useState('Editor');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
      <div className="space-y-6">
        {/* Share link */}
        <div className={card}>
          <div className="flex items-center gap-2 mb-4">
            <Link2 size={16} className="text-purple-500" />
            <span className={label}>Share Link</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              readOnly
              value="https://mavionix.app/share/series-a-investor-deck-x92kd"
              className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-4 py-2.5 text-[12.5px] text-slate-500"
            />
            <button className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-[11px] font-black uppercase tracking-wider text-white shrink-0" style={{ backgroundImage: 'linear-gradient(135deg, #C800FF 0%, #7C3AED 100%)' }}>
              Copy Link
            </button>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Shield size={13} className="text-slate-400" />
            <span className="text-[12px] text-slate-500">Anyone with the link can</span>
            <select value={permission} onChange={(e) => setPermission(e.target.value)} className="rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent px-2 py-1 text-[12px] font-semibold">
              {ROLES.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
        </div>

        {/* Collaborators */}
        <div className={card}>
          <div className="flex items-center gap-2 mb-4">
            <Users size={16} className="text-purple-500" />
            <span className={label}>Team Collaboration — Live Now</span>
          </div>
          <div className="space-y-2.5">
            {COLLABORATORS.map((u) => (
              <div key={u.id} className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[13px] font-black" style={{ backgroundColor: u.color }}>
                      {u.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    {u.online && <Circle size={9} className="absolute -bottom-0.5 -right-0.5 fill-emerald-400 text-emerald-400 rounded-full ring-2 ring-white dark:ring-[#0c0c14]" />}
                  </div>
                  <div>
                    <p className="text-[13px] font-bold">{u.name}</p>
                    <p className="text-[11px] text-slate-400">{u.online ? 'Editing now' : 'Offline'}</p>
                  </div>
                </div>
                <select defaultValue={u.role} className="rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent px-2 py-1 text-[11px] font-semibold text-slate-500">
                  {ROLES.map((r) => <option key={r}>{r}</option>)}
                </select>
              </div>
            ))}
          </div>
          <button className="mt-3 w-full rounded-xl border border-dashed border-slate-300 dark:border-slate-700 py-2.5 text-[12px] font-bold text-slate-400 hover:border-purple-300 dark:hover:border-purple-700">
            + Invite collaborator by email
          </button>
        </div>

        {/* Comments */}
        <div className={card}>
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare size={16} className="text-purple-500" />
            <span className={label}>Comments & Mentions</span>
          </div>
          <div className="space-y-4">
            {COMMENTS.map((c) => (
              <div key={c.id} className="flex gap-3">
                <div className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-white text-[11px] font-black" style={{ backgroundColor: c.avatarColor }}>
                  {c.author.split(' ').map((n) => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-[12.5px] font-bold">{c.author}</p>
                    <span className="text-[10.5px] text-slate-400">on {c.slide}</span>
                    <span className="text-[10.5px] text-slate-400 ml-auto">{c.time}</span>
                  </div>
                  <p className="mt-0.5 text-[12.5px] text-slate-600 dark:text-slate-300">{c.text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <input
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Reply or @mention a teammate..."
              className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-4 py-2.5 text-[12.5px] focus:outline-none focus:ring-2 focus:ring-purple-400/50"
            />
            <button className="w-10 h-10 shrink-0 rounded-xl text-white flex items-center justify-center" style={{ backgroundImage: 'linear-gradient(135deg, #C800FF 0%, #7C3AED 100%)' }}>
              <Send size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Version history / activity timeline */}
      <div className={`${card} h-fit`}>
        <div className="flex items-center gap-2 mb-4">
          <Clock size={16} className="text-purple-500" />
          <span className={label}>Version History</span>
        </div>
        <div className="space-y-0">
          {VERSION_HISTORY.map((v, i) => (
            <div key={v.id} className="relative pl-5 pb-5 last:pb-0">
              {i !== VERSION_HISTORY.length - 1 && <div className="absolute left-[5px] top-2.5 bottom-0 w-px bg-slate-200 dark:bg-slate-800" />}
              <div className="absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full bg-purple-500" />
              <p className="text-[12.5px] font-bold">{v.label}</p>
              <p className="text-[11px] text-slate-400">{v.author} · {v.time}</p>
            </div>
          ))}
        </div>
        <button className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-800 py-2 text-[11px] font-bold text-slate-500">
          Restore a previous version
        </button>
      </div>
    </div>
  );
}
