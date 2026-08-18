import React from 'react';
import { FolderKanban, Layers, Download, Users, Activity, LayoutTemplate } from 'lucide-react';
import { ANALYTICS, RECENT_PRESENTATIONS, RECENT_ACTIVITY, EXPORT_HISTORY } from '../../../data/presentationMockData';

const card = 'rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c0c14] p-5 sm:p-6';
const label = 'text-[11px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500';

export default function HistoryTab() {
  const stats = [
    { label: 'Presentations', value: ANALYTICS.totals.totalPresentations, icon: FolderKanban },
    { label: 'Slides Generated', value: ANALYTICS.totals.totalSlidesGenerated.toLocaleString(), icon: Layers },
    { label: 'Exports', value: ANALYTICS.totals.totalExports, icon: Download },
    { label: 'Collaborators', value: ANALYTICS.totals.activeCollaborators, icon: Users },
  ];
  const maxWeek = Math.max(...ANALYTICS.usageByWeek);
  const maxTemplate = Math.max(...ANALYTICS.templatesUsed.map((t) => t.count));
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={card}>
              <div className="flex items-center justify-between">
                <span className={label}>{s.label}</span>
                <Icon size={15} className="text-purple-400" />
              </div>
              <p className="mt-2 text-2xl font-black">{s.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={card}>
          <span className={label}>Weekly Activity</span>
          <div className="mt-5 flex items-end gap-2.5 h-36">
            {ANALYTICS.usageByWeek.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <div
                  className="w-full rounded-t-md"
                  style={{ height: `${(v / maxWeek) * 100}%`, backgroundImage: 'linear-gradient(180deg, #C800FF 0%, #7C3AED 100%)' }}
                />
                <span className="text-[10px] font-semibold text-slate-400">{days[i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={card}>
          <div className="flex items-center gap-2 mb-4">
            <LayoutTemplate size={15} className="text-purple-500" />
            <span className={label}>Most Used Templates</span>
          </div>
          <div className="space-y-3">
            {ANALYTICS.templatesUsed.map((t) => (
              <div key={t.name}>
                <div className="flex items-center justify-between text-[12px] mb-1">
                  <span className="font-semibold text-slate-600 dark:text-slate-300">{t.name}</span>
                  <span className="font-bold text-purple-600 dark:text-purple-300">{t.count}</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-900">
                  <div className="h-1.5 rounded-full bg-purple-500" style={{ width: `${(t.count / maxTemplate) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={card}>
          <span className={label}>Presentation History</span>
          <div className="mt-3 space-y-2.5">
            {RECENT_PRESENTATIONS.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 px-3.5 py-2.5">
                <div className="w-14 h-9 rounded-lg overflow-hidden shrink-0">
                  <img src={p.cover} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] font-bold truncate">{p.title}</p>
                  <p className="text-[11px] text-slate-400">{p.slideCount} slides · {p.updatedAt}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                  p.status === 'published' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300'
                  : p.status === 'in-review' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300'
                  : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                }`}>
                  {p.status.replace('-', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className={card}>
            <div className="flex items-center gap-2 mb-4">
              <Activity size={15} className="text-purple-500" />
              <span className={label}>User Activity</span>
            </div>
            <div className="space-y-3">
              {RECENT_ACTIVITY.map((a) => (
                <div key={a.id} className="flex gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-[12.5px] text-slate-600 dark:text-slate-300">{a.text}</p>
                    <p className="text-[10.5px] text-slate-400">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={card}>
            <div className="flex items-center gap-2 mb-4">
              <Download size={15} className="text-purple-500" />
              <span className={label}>Export History</span>
            </div>
            <div className="space-y-2.5">
              {EXPORT_HISTORY.map((e) => (
                <div key={e.id} className="flex items-center justify-between text-[12px]">
                  <span className="font-semibold text-slate-600 dark:text-slate-300 truncate">{e.name}</span>
                  <span className="text-slate-400 shrink-0 ml-2">{e.format} · {e.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
