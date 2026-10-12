import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Share2, 
  Bookmark, 
  Eye, 
  Clock, 
  Sparkles, 
  Zap, 
  GraduationCap, 
  Layers, 
  Filter,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ToolRow } from '../components/ToolRow';
import { ListCard } from '../components/ListCard';
import { SEOHead } from '../components/SEOHead';
import { Tool } from '../types';

export const ListPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { lists, tools, categories, isBookmarked, toggleBookmark, addToast } = useApp();

  const [sortMode, setSortMode] = useState<'ranked' | 'newest' | 'free_only'>('ranked');
  const [copied, setCopied] = useState(false);

  // Find the target list
  const list = lists.find((l) => l.slug === slug);

  if (!list) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-[#f5f5f5]">Ranked List Not Found</h2>
        <p className="text-sm text-[#9ca3af]">
          The directory or list you are looking for may have been moved or renamed.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#10b981] text-black font-semibold text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Lists</span>
        </Link>
      </div>
    );
  }

  const category = categories.find((c) => c.id === list.category_id);
  const bookmarked = isBookmarked(list.id);

  // Tools in list
  const rawListTools: Array<{ tool: Tool; rank: number }> = (list.items || [])
    .map((item) => {
      const toolObj = tools.find((t) => t.id === item.tool_id);
      return toolObj ? { tool: toolObj, rank: item.rank } : null;
    })
    .filter((x): x is { tool: Tool; rank: number } => Boolean(x));

  // Apply sorting/filtering
  let displayTools = [...rawListTools];
  if (sortMode === 'ranked') {
    displayTools.sort((a, b) => a.rank - b.rank);
  } else if (sortMode === 'newest') {
    displayTools.sort((a, b) => b.tool.id.localeCompare(a.tool.id));
  } else if (sortMode === 'free_only') {
    displayTools = displayTools.filter((item) => item.tool.pricing === 'free');
  }

  // Related lists in same category
  const relatedLists = lists
    .filter((l) => l.category_id === list.category_id && l.id !== list.id)
    .slice(0, 3);

  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${list.title} — Top10`,
          text: list.description,
          url: shareUrl,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      addToast('Link Copied!', 'List URL copied to clipboard.', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      addToast('Share URL', shareUrl, 'info');
    }
  };

  // Build JSON-LD structured data for ItemList
  const jsonLdItemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: list.title,
    description: list.description,
    numberOfItems: rawListTools.length,
    itemListElement: rawListTools.map((item, index) => ({
      '@type': 'ListItem',
      position: item.rank || index + 1,
      name: item.tool.name,
      url: item.tool.url,
      description: item.tool.description,
    })),
  };

  return (
    <>
      <SEOHead
        title={list.title}
        description={list.description}
        canonicalUrl={window.location.href}
        jsonLd={jsonLdItemList}
      />

      <div className="space-y-8 pb-16 max-w-5xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#9ca3af]">
          <Link to="/" className="hover:text-[#f5f5f5] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#9ca3af]/50" />
          {category && (
            <>
              <Link to={`/category/${category.slug}`} className="hover:text-[#f5f5f5] transition-colors">
                {category.name}
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-[#9ca3af]/50" />
            </>
          )}
          <span className="text-[#f5f5f5] font-medium truncate max-w-xs">{list.title}</span>
        </nav>

        {/* List Header Box */}
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-3 flex-1">
              {/* Category pill */}
              {category && (
                <Link
                  to={`/category/${category.slug}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#181818] border border-[#262626] text-xs font-semibold text-[#10b981] hover:border-[#10b981]/40 transition-colors"
                >
                  <span>{category.name}</span>
                </Link>
              )}

              <h1 className="text-2xl sm:text-4xl font-extrabold text-[#f5f5f5] tracking-tight leading-tight">
                {list.title}
              </h1>

              <p className="text-sm sm:text-base text-[#9ca3af] leading-relaxed max-w-2xl">
                {list.description}
              </p>

              {/* Meta stats: Last updated, view count, verification */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-[#9ca3af] pt-2">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#10b981]" />
                  <span>Updated {new Date(list.updated_at).toLocaleDateString()}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-[#9ca3af]" />
                  <span>{list.view_count.toLocaleString()} views</span>
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>10 Verified Tools</span>
                </span>
              </div>
            </div>

            {/* Actions: Share & Bookmark */}
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#181818] hover:bg-[#202020] border border-[#262626] hover:border-[#10b981]/40 text-xs font-semibold text-[#f5f5f5] transition-colors focus:outline-none focus:ring-1 focus:ring-[#10b981]"
                aria-label="Share this list"
              >
                <Share2 className={`w-4 h-4 ${copied ? 'text-[#10b981]' : ''}`} />
                <span>{copied ? 'Copied' : 'Share'}</span>
              </button>

              <button
                onClick={() => toggleBookmark(list.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all focus:outline-none focus:ring-1 focus:ring-[#10b981] ${
                  bookmarked
                    ? 'bg-[#10b981]/15 text-[#10b981] border-[#10b981]/50'
                    : 'bg-[#181818] hover:bg-[#202020] text-[#f5f5f5] border-[#262626] hover:border-[#10b981]/40'
                }`}
                aria-label={bookmarked ? 'Saved to bookmarks' : 'Bookmark this list'}
              >
                <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
                <span>{bookmarked ? 'Saved' : 'Save'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sort / Filter Bar */}
        <div className="flex items-center justify-between pb-2 border-b border-[#1b1b1b]">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#10b981]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#9ca3af]">
              Rankings ({displayTools.length})
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-[#141414] p-1 rounded-xl border border-[#222222] text-xs">
            <button
              onClick={() => setSortMode('ranked')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                sortMode === 'ranked'
                  ? 'bg-[#222222] text-[#10b981] shadow-sm font-semibold'
                  : 'text-[#9ca3af] hover:text-[#f5f5f5]'
              }`}
            >
              Ranked (1-10)
            </button>
            <button
              onClick={() => setSortMode('newest')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                sortMode === 'newest'
                  ? 'bg-[#222222] text-[#10b981] shadow-sm font-semibold'
                  : 'text-[#9ca3af] hover:text-[#f5f5f5]'
              }`}
            >
              Newest First
            </button>
            <button
              onClick={() => setSortMode('free_only')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                sortMode === 'free_only'
                  ? 'bg-[#222222] text-[#10b981] shadow-sm font-semibold'
                  : 'text-[#9ca3af] hover:text-[#f5f5f5]'
              }`}
            >
              Free Only
            </button>
          </div>
        </div>

        {/* Numbered Rows 1-10 */}
        <div className="space-y-3">
          {displayTools.map((item) => (
            <ToolRow key={item.tool.id} tool={item.tool} rank={item.rank} />
          ))}
        </div>

        {/* Related Lists Section */}
        {relatedLists.length > 0 && (
          <section className="pt-10 border-t border-[#1a1a1a] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#f5f5f5]">
                More {category?.name || 'Related'} Top 10 Lists
              </h3>
              {category && (
                <Link
                  to={`/category/${category.slug}`}
                  className="text-xs font-semibold text-[#10b981] hover:underline"
                >
                  Explore Category →
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {relatedLists.map((rel) => (
                <ListCard key={rel.id} list={rel} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
};
