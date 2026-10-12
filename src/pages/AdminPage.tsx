import React, { useState } from 'react';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Edit3, 
  Play, 
  AlertTriangle, 
  Layers, 
  Wrench, 
  Terminal, 
  Trash2, 
  RefreshCw, 
  Plus, 
  Flame, 
  ArrowUp, 
  ArrowDown, 
  ExternalLink,
  Save,
  Check,
  CheckCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ToolStaging, Tool, List } from '../types';
import { SEOHead } from '../components/SEOHead';

export const AdminPage: React.FC = () => {
  const { 
    role, 
    setMockRole, 
    tools, 
    lists, 
    stagingTools, 
    categories,
    approveStagingTool, 
    rejectStagingTool, 
    updateStagingTool,
    bulkApproveAboveThreshold, 
    reorderListItems, 
    updateList, 
    createList,
    removeDeadTool, 
    replaceDeadTool,
    isFetching, 
    fetchLogs, 
    lastFetchTime, 
    runAutoFetch,
    addToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'queue' | 'lists' | 'fetcher' | 'dead_links'>('queue');

  // Review Queue state
  const [minScoreThreshold, setMinScoreThreshold] = useState<number>(88);
  const [editingStagingItem, setEditingStagingItem] = useState<ToolStaging | null>(null);

  // Manage lists state
  const [selectedListId, setSelectedListId] = useState<string>(lists[0]?.id || '');
  const [showNewListModal, setShowNewListModal] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [newListDesc, setNewListDesc] = useState('');
  const [newListCategory, setNewListCategory] = useState(categories[0]?.id || '');

  // Dead links modal state
  const [replacingToolId, setReplacingToolId] = useState<string | null>(null);
  const [replaceUrl, setReplaceUrl] = useState('');
  const [replaceName, setReplaceName] = useState('');

  // Counts
  const pendingCount = stagingTools.filter((s) => s.status === 'pending').length;
  const approvedToolsCount = tools.filter((t) => t.status === 'approved').length;
  const deadTools = tools.filter((t) => t.status === 'dead');

  const selectedList = lists.find((l) => l.id === selectedListId) || lists[0];

  // If user is not admin, show friendly admin activator
  if (role !== 'admin') {
    return (
      <div className="py-16 text-center max-w-md mx-auto space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
          <Shield className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold text-[#f5f5f5]">Admin Privileges Required</h2>
        <p className="text-xs text-[#9ca3af] leading-relaxed">
          The curation and approval dashboard is restricted to administrators. In demo mode, you can elevate your session to Admin with one click.
        </p>
        <button
          onClick={() => setMockRole('admin')}
          className="px-5 py-2.5 rounded-xl bg-[#10b981] hover:bg-[#059669] text-black font-bold text-xs transition-colors shadow-lg"
        >
          Switch to Admin Mode
        </button>
      </div>
    );
  }

  // Handle reorder rank
  const moveToolRank = (currentIndex: number, direction: 'up' | 'down') => {
    if (!selectedList || !selectedList.items) return;
    const currentToolIds = [...selectedList.items].sort((a, b) => a.rank - b.rank).map((i) => i.tool_id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= currentToolIds.length) return;

    const temp = currentToolIds[currentIndex];
    currentToolIds[currentIndex] = currentToolIds[targetIndex];
    currentToolIds[targetIndex] = temp;

    reorderListItems(selectedList.id, currentToolIds);
  };

  const handleCreateNewList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;

    createList({
      title: newListTitle.trim(),
      slug: newListTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      category_id: newListCategory,
      description: newListDesc.trim(),
      is_trending: false,
      is_new: true,
      items: [],
    });

    setNewListTitle('');
    setNewListDesc('');
    setShowNewListModal(false);
  };

  return (
    <>
      <SEOHead
        title="Admin Control Center — Top10"
        description="Review staging queue, manage rankings, trigger automated tool fetching, and resolve dead links."
      />

      <div className="space-y-8 pb-16 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1b1b1b]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#10b981]/15 text-[#10b981] text-xs font-semibold mb-1">
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#f5f5f5] tracking-tight">
              Curator &amp; Pipeline Dashboard
            </h1>
            <p className="text-xs text-[#9ca3af] mt-0.5">
              Review staged candidates, reorder list items, and oversee autonomous discovery runs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={runAutoFetch}
              disabled={isFetching}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#10b981] hover:bg-[#059669] text-black font-semibold text-xs transition-colors disabled:opacity-60 shadow-sm"
            >
              <Play className={`w-3.5 h-3.5 fill-black ${isFetching ? 'animate-spin' : ''}`} />
              <span>{isFetching ? 'Running Discovery...' : 'Run fetch now'}</span>
            </button>
          </div>
        </div>

        {/* Dashboard Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9ca3af]">
              Staging Pending
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-[#10b981]">{pendingCount}</span>
              <span className="text-xs text-[#9ca3af]">awaiting review</span>
            </div>
          </div>

          <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9ca3af]">
              Approved Tools
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-[#f5f5f5]">{approvedToolsCount}</span>
              <span className="text-xs text-emerald-400">100% active</span>
            </div>
          </div>

          <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9ca3af]">
              Dead Links
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-2xl font-black ${deadTools.length > 0 ? 'text-rose-400' : 'text-[#f5f5f5]'}`}>
                {deadTools.length}
              </span>
              <span className="text-xs text-[#9ca3af]">flagged</span>
            </div>
          </div>

          <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-4">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9ca3af]">
              Total Lists
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-[#f5f5f5]">{lists.length}</span>
              <span className="text-xs text-[#9ca3af]">curated</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-[#1b1b1b] pb-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 shrink-0 ${
              activeTab === 'queue'
                ? 'bg-[#181818] text-[#10b981] border border-[#10b981]/40'
                : 'text-[#9ca3af] hover:text-[#f5f5f5]'
            }`}
          >
            <span>Review Queue</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-[#10b981] text-black text-[10px] font-bold">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('lists')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 shrink-0 ${
              activeTab === 'lists'
                ? 'bg-[#181818] text-[#10b981] border border-[#10b981]/40'
                : 'text-[#9ca3af] hover:text-[#f5f5f5]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Manage Lists &amp; Ranks</span>
          </button>

          <button
            onClick={() => setActiveTab('fetcher')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 shrink-0 ${
              activeTab === 'fetcher'
                ? 'bg-[#181818] text-[#10b981] border border-[#10b981]/40'
                : 'text-[#9ca3af] hover:text-[#f5f5f5]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Auto-Fetch Pipeline</span>
          </button>

          <button
            onClick={() => setActiveTab('dead_links')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 shrink-0 ${
              activeTab === 'dead_links'
                ? 'bg-[#181818] text-[#10b981] border border-[#10b981]/40'
                : 'text-[#9ca3af] hover:text-[#f5f5f5]'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>Dead-Link Report ({deadTools.length})</span>
          </button>
        </div>

        {/* TAB 1: REVIEW QUEUE */}
        {activeTab === 'queue' && (
          <div className="space-y-5">
            {/* Bulk approve banner */}
            <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#9ca3af]">Bulk approve items with score &ge;</span>
                <input
                  type="number"
                  min={50}
                  max={100}
                  value={minScoreThreshold}
                  onChange={(e) => setMinScoreThreshold(Number(e.target.value))}
                  className="w-16 px-2 py-1 rounded-lg bg-[#161616] border border-[#2a2a2a] text-xs font-mono text-[#10b981] text-center focus:outline-none"
                />
              </div>

              <button
                onClick={() => bulkApproveAboveThreshold(minScoreThreshold)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#161616] hover:bg-[#202020] border border-[#10b981]/30 hover:border-[#10b981] text-xs font-semibold text-[#10b981] transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Bulk Approve &ge; {minScoreThreshold}</span>
              </button>
            </div>

            {/* Pending Table */}
            <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#161616] border-b border-[#1f1f1f] text-[#9ca3af] uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3 px-4">Tool</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Source</th>
                      <th className="py-3 px-4">AI Score</th>
                      <th className="py-3 px-4">Pricing</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1b1b1b]">
                    {stagingTools.filter((s) => s.status === 'pending').length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-[#9ca3af]">
                          No pending staging tools to review! All items approved or run fetch for new ones.
                        </td>
                      </tr>
                    ) : (
                      stagingTools
                        .filter((s) => s.status === 'pending')
                        .map((candidate) => {
                          const catName = categories.find((c) => c.id === candidate.category_id)?.name || 'General';

                          return (
                            <tr key={candidate.id} className="hover:bg-[#151515] transition-colors">
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-[#202020] border border-[#2a2a2a] p-1 flex items-center justify-center shrink-0">
                                    {candidate.logo_url ? (
                                      <img
                                        src={candidate.logo_url}
                                        alt={candidate.name}
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                          (e.target as HTMLElement).style.display = 'none';
                                        }}
                                      />
                                    ) : (
                                      <span className="font-bold text-[#10b981]">{candidate.name[0]}</span>
                                    )}
                                  </div>
                                  <div className="min-w-0 max-w-xs">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold text-[#f5f5f5] truncate">{candidate.name}</span>
                                      <a
                                        href={candidate.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[#9ca3af] hover:text-[#10b981]"
                                      >
                                        <ExternalLink className="w-3 h-3" />
                                      </a>
                                    </div>
                                    <p className="text-[11px] text-[#9ca3af] truncate mt-0.5">{candidate.description}</p>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3.5 px-4 text-[#9ca3af] whitespace-nowrap">
                                {catName}
                              </td>

                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <span className="uppercase font-mono text-[10px] px-2 py-0.5 rounded bg-[#1a1a1a] text-[#9ca3af]">
                                  {candidate.source}
                                </span>
                              </td>

                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                  {candidate.score}
                                </span>
                              </td>

                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <span className="capitalize text-[#9ca3af]">
                                  {candidate.pricing}
                                </span>
                              </td>

                              <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => setEditingStagingItem(candidate)}
                                    className="p-1.5 rounded-lg bg-[#1a1a1a] hover:bg-[#242424] text-[#9ca3af] hover:text-[#f5f5f5]"
                                    title="Edit inline"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    onClick={() => approveStagingTool(candidate.id)}
                                    className="px-2.5 py-1.5 rounded-lg bg-[#10b981] hover:bg-[#059669] text-black font-semibold text-[11px] flex items-center gap-1"
                                    title="Approve and publish"
                                  >
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    <span>Approve</span>
                                  </button>

                                  <button
                                    onClick={() => rejectStagingTool(candidate.id)}
                                    className="p-1.5 rounded-lg bg-[#1a1a1a] hover:bg-rose-950/40 text-rose-400"
                                    title="Reject"
                                  >
                                    <XCircle className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Inline Edit Modal */}
            {editingStagingItem && (
              <div
                role="dialog"
                aria-modal="true"
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                onClick={() => setEditingStagingItem(null)}
              >
                <div
                  className="w-full max-w-md bg-[#111111] border border-[#1f1f1f] rounded-2xl p-6 shadow-2xl space-y-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-base font-bold text-[#f5f5f5]">Edit Staging Candidate</h3>

                  <div>
                    <label className="block text-xs font-medium text-[#9ca3af] mb-1">Name</label>
                    <input
                      type="text"
                      value={editingStagingItem.name}
                      onChange={(e) => setEditingStagingItem({ ...editingStagingItem, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#161616] border border-[#2a2a2a] text-xs text-[#f5f5f5] focus:outline-none focus:border-[#10b981]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#9ca3af] mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={editingStagingItem.description}
                      onChange={(e) => setEditingStagingItem({ ...editingStagingItem, description: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#161616] border border-[#2a2a2a] text-xs text-[#f5f5f5] focus:outline-none focus:border-[#10b981]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#9ca3af] mb-1">AI Score (0-100)</label>
                      <input
                        type="number"
                        value={editingStagingItem.score}
                        onChange={(e) => setEditingStagingItem({ ...editingStagingItem, score: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl bg-[#161616] border border-[#2a2a2a] text-xs text-[#f5f5f5] focus:outline-none focus:border-[#10b981]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#9ca3af] mb-1">Pricing</label>
                      <select
                        value={editingStagingItem.pricing}
                        onChange={(e) => setEditingStagingItem({ ...editingStagingItem, pricing: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-xl bg-[#161616] border border-[#2a2a2a] text-xs text-[#f5f5f5] focus:outline-none focus:border-[#10b981]"
                      >
                        <option value="free">Free</option>
                        <option value="freemium">Freemium</option>
                        <option value="paid">Paid</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setEditingStagingItem(null)}
                      className="px-3 py-1.5 rounded-xl bg-[#161616] text-[#9ca3af] text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        updateStagingTool(editingStagingItem);
                        setEditingStagingItem(null);
                      }}
                      className="px-4 py-1.5 rounded-xl bg-[#10b981] text-black font-semibold text-xs"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MANAGE LISTS */}
        {activeTab === 'lists' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#9ca3af] font-medium">Select List to Edit:</span>
                <select
                  value={selectedListId}
                  onChange={(e) => setSelectedListId(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-[#161616] border border-[#262626] text-xs text-[#f5f5f5] focus:outline-none focus:border-[#10b981]"
                >
                  {lists.map((l) => (
                    <option key={l.id} value={l.id} className="bg-[#111111]">
                      {l.title}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setShowNewListModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#10b981] hover:bg-[#059669] text-black font-semibold text-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New List</span>
              </button>
            </div>

            {selectedList && (
              <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-5 space-y-5">
                <div className="flex items-center justify-between border-b border-[#1b1b1b] pb-3">
                  <div>
                    <h3 className="text-base font-bold text-[#f5f5f5]">{selectedList.title}</h3>
                    <p className="text-xs text-[#9ca3af] mt-0.5">{selectedList.description}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateList(selectedList.id, { is_trending: !selectedList.is_trending })
                      }
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                        selectedList.is_trending
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-[#181818] text-[#9ca3af] border border-[#282828]'
                      }`}
                    >
                      <Flame className="w-3.5 h-3.5" />
                      <span>{selectedList.is_trending ? 'Pinned Trending' : 'Pin Trending'}</span>
                    </button>
                  </div>
                </div>

                {/* Ranked Items in this List with Drag / Reorder Buttons */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#9ca3af] mb-3">
                    Ranked Tools 1 - 10 (Reorder Ranks):
                  </h4>

                  <div className="space-y-2">
                    {(selectedList.items || [])
                      .sort((a, b) => a.rank - b.rank)
                      .map((item, idx) => {
                        const tool = tools.find((t) => t.id === item.tool_id);
                        if (!tool) return null;

                        return (
                          <div
                            key={tool.id}
                            className="flex items-center justify-between p-3 rounded-xl bg-[#161616] border border-[#222222] hover:border-[#2f2f2f] text-xs"
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-md bg-[#222222] text-[#10b981] font-bold flex items-center justify-center font-mono">
                                #{item.rank}
                              </span>
                              <span className="font-semibold text-[#f5f5f5]">{tool.name}</span>
                              <span className="text-[#9ca3af] truncate max-w-xs hidden sm:inline">
                                {tool.description}
                              </span>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => moveToolRank(idx, 'up')}
                                disabled={idx === 0}
                                className="p-1 rounded bg-[#202020] hover:bg-[#282828] text-[#9ca3af] hover:text-[#f5f5f5] disabled:opacity-30"
                                title="Move Rank Up"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => moveToolRank(idx, 'down')}
                                disabled={idx === (selectedList.items?.length || 1) - 1}
                                className="p-1 rounded bg-[#202020] hover:bg-[#282828] text-[#9ca3af] hover:text-[#f5f5f5] disabled:opacity-30"
                                title="Move Rank Down"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}

            {/* Modal to Create New List */}
            {showNewListModal && (
              <div
                role="dialog"
                aria-modal="true"
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                onClick={() => setShowNewListModal(false)}
              >
                <div
                  className="w-full max-w-md bg-[#111111] border border-[#1f1f1f] rounded-2xl p-6 shadow-2xl space-y-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-base font-bold text-[#f5f5f5]">Create New Curated List</h3>

                  <form onSubmit={handleCreateNewList} className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-[#9ca3af] mb-1">List Title</label>
                      <input
                        type="text"
                        required
                        value={newListTitle}
                        onChange={(e) => setNewListTitle(e.target.value)}
                        placeholder="e.g. Top 10 High-Performance Rust Frameworks"
                        className="w-full px-3 py-2 rounded-xl bg-[#161616] border border-[#2a2a2a] text-xs text-[#f5f5f5] focus:outline-none focus:border-[#10b981]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#9ca3af] mb-1">Category</label>
                      <select
                        value={newListCategory}
                        onChange={(e) => setNewListCategory(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#161616] border border-[#2a2a2a] text-xs text-[#f5f5f5] focus:outline-none focus:border-[#10b981]"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id} className="bg-[#111111]">
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#9ca3af] mb-1">Description</label>
                      <textarea
                        rows={2}
                        value={newListDesc}
                        onChange={(e) => setNewListDesc(e.target.value)}
                        placeholder="Summary of what is ranked..."
                        className="w-full px-3 py-2 rounded-xl bg-[#161616] border border-[#2a2a2a] text-xs text-[#f5f5f5] focus:outline-none focus:border-[#10b981]"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowNewListModal(false)}
                        className="px-3 py-1.5 rounded-xl bg-[#161616] text-[#9ca3af] text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-xl bg-[#10b981] text-black font-semibold text-xs"
                      >
                        Create List
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: AUTO-FETCH PIPELINE CONSOLE */}
        {activeTab === 'fetcher' && (
          <div className="space-y-4">
            <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-[#f5f5f5]">Autonomous Discovery &amp; Crawler</h3>
                <p className="text-xs text-[#9ca3af] mt-0.5">
                  Calls Google Gemini with Google Search grounding + GitHub, HackerNews Algolia, and ProductHunt connectors.
                </p>
                <div className="mt-2 text-xs text-[#9ca3af]">
                  Last execution: <span className="font-mono text-[#10b981]">{lastFetchTime ? new Date(lastFetchTime).toLocaleString() : 'Never'}</span>
                </div>
              </div>

              <button
                onClick={runAutoFetch}
                disabled={isFetching}
                className="px-4 py-2.5 rounded-xl bg-[#10b981] hover:bg-[#059669] text-black font-bold text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shrink-0"
              >
                <Play className={`w-4 h-4 fill-black ${isFetching ? 'animate-spin' : ''}`} />
                <span>{isFetching ? 'Pipeline Running...' : 'Execute Run Now'}</span>
              </button>
            </div>

            {/* Terminal Live Log Console */}
            <div className="bg-black border border-[#1f1f1f] rounded-2xl overflow-hidden shadow-2xl font-mono text-xs">
              <div className="bg-[#141414] px-4 py-2.5 border-b border-[#222222] flex items-center justify-between text-[#9ca3af]">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                  </div>
                  <span className="text-[11px] font-semibold text-[#f5f5f5] ml-2">fetch-tools.edge.log</span>
                </div>
                <span className="text-[10px] text-[#9ca3af]">
                  {isFetching ? 'LIVE STREAMING' : 'IDLE'}
                </span>
              </div>

              <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
                {fetchLogs.length === 0 ? (
                  <div className="text-[#9ca3af]/60 py-6 text-center">
                    Ready to run. Click &ldquo;Execute Run Now&rdquo; above to query Gemini Google Search grounding and sync public APIs.
                  </div>
                ) : (
                  fetchLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-2 leading-relaxed">
                      <span className="text-[#9ca3af]/50 shrink-0">[{log.timestamp}]</span>
                      {log.source && (
                        <span className="text-cyan-400 font-semibold shrink-0">[{log.source}]</span>
                      )}
                      <span
                        className={
                          log.level === 'success'
                            ? 'text-emerald-400'
                            : log.level === 'warn'
                            ? 'text-amber-400'
                            : log.level === 'error'
                            ? 'text-rose-400'
                            : 'text-[#f5f5f5]'
                        }
                      >
                        {log.message}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DEAD LINKS REPORT */}
        {activeTab === 'dead_links' && (
          <div className="space-y-4">
            <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-5">
              <h3 className="text-base font-bold text-[#f5f5f5]">Weekly URL Health Check</h3>
              <p className="text-xs text-[#9ca3af] mt-0.5">
                Automatically flags broken HTTP responses, DNS lookup errors, and decommissioned tools.
              </p>
            </div>

            <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#161616] border-b border-[#1f1f1f] text-[#9ca3af] uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Flagged Tool</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Last Checked</th>
                    <th className="py-3 px-4 text-right">Resolution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1b1b1b]">
                  {deadTools.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-[#9ca3af]">
                        All tools in the directory are healthy and responding with HTTP 200 OK.
                      </td>
                    </tr>
                  ) : (
                    deadTools.map((dead) => (
                      <tr key={dead.id} className="hover:bg-[#151515] transition-colors">
                        <td className="py-3.5 px-4">
                          <div>
                            <span className="font-bold text-[#f5f5f5]">{dead.name}</span>
                            <p className="text-[11px] text-rose-400/80 font-mono mt-0.5">{dead.url}</p>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold uppercase text-[10px]">
                            DEAD (404/DNS)
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-[#9ca3af]">
                          {new Date(dead.last_checked).toLocaleDateString()}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setReplacingToolId(dead.id);
                                setReplaceName(dead.name);
                                setReplaceUrl(dead.url);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-[#161616] hover:bg-[#202020] text-[#10b981] border border-[#10b981]/30 text-xs font-semibold"
                            >
                              Replace Link
                            </button>

                            <button
                              onClick={() => removeDeadTool(dead.id)}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30"
                              title="Remove from lists"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Replace Tool Modal */}
            {replacingToolId && (
              <div
                role="dialog"
                aria-modal="true"
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                onClick={() => setReplacingToolId(null)}
              >
                <div
                  className="w-full max-w-md bg-[#111111] border border-[#1f1f1f] rounded-2xl p-6 shadow-2xl space-y-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-base font-bold text-[#f5f5f5]">Replace Dead Tool Link</h3>

                  <div>
                    <label className="block text-xs font-medium text-[#9ca3af] mb-1">New Tool Name</label>
                    <input
                      type="text"
                      value={replaceName}
                      onChange={(e) => setReplaceName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#161616] border border-[#2a2a2a] text-xs text-[#f5f5f5] focus:outline-none focus:border-[#10b981]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#9ca3af] mb-1">New Working URL</label>
                    <input
                      type="url"
                      value={replaceUrl}
                      onChange={(e) => setReplaceUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#161616] border border-[#2a2a2a] text-xs text-[#f5f5f5] focus:outline-none focus:border-[#10b981]"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setReplacingToolId(null)}
                      className="px-3 py-1.5 rounded-xl bg-[#161616] text-[#9ca3af] text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        replaceDeadTool(replacingToolId, {
                          name: replaceName,
                          url: replaceUrl,
                        });
                        setReplacingToolId(null);
                      }}
                      className="px-4 py-1.5 rounded-xl bg-[#10b981] text-black font-semibold text-xs"
                    >
                      Confirm Replacement
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};
