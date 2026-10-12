import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Share2, Sparkles, Zap, GraduationCap, Layers } from 'lucide-react';
import { List, Tool } from '../types';
import { useApp } from '../context/AppContext';

interface ListCardProps {
  list: List;
  categoryName?: string;
  categoryIcon?: string;
}

export const ListCard: React.FC<ListCardProps> = ({ list, categoryName, categoryIcon }) => {
  const { tools, categories, isBookmarked, toggleBookmark, addToast } = useApp();
  const [copied, setCopied] = useState(false);

  // Derive category if not passed
  const category = categoryName ? null : categories.find((c) => c.id === list.category_id);
  const displayCategoryName = categoryName || category?.name || 'Curated';
  const displayCategoryIcon = categoryIcon || category?.icon;

  const bookmarked = isBookmarked(list.id);

  // Retrieve tools in this list
  const listTools: Tool[] = (list.items || [])
    .sort((a, b) => a.rank - b.rank)
    .map((item) => tools.find((t) => t.id === item.tool_id))
    .filter((t): t is Tool => Boolean(t));

  const firstThreeTools = listTools.slice(0, 3);
  const remainingCount = Math.max(0, 10 - firstThreeTools.length);

  const getCategoryIconComponent = (icon?: string) => {
    switch (icon) {
      case 'Sparkles':
        return <Sparkles className="w-3.5 h-3.5 text-[#10b981]" />;
      case 'Zap':
        return <Zap className="w-3.5 h-3.5 text-[#10b981]" />;
      case 'GraduationCap':
        return <GraduationCap className="w-3.5 h-3.5 text-[#10b981]" />;
      default:
        return <Layers className="w-3.5 h-3.5 text-[#10b981]" />;
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    try {
      const diffDays = Math.max(1, Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24)));
      if (diffDays === 1) return 'Updated yesterday';
      if (diffDays < 7) return `Updated ${diffDays}d ago`;
      if (diffDays < 30) return `Updated ${Math.floor(diffDays / 7)}w ago`;
      return 'Updated recently';
    } catch {
      return 'Updated 2d ago';
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const shareUrl = `${window.location.origin}/list/${list.slug}`;
    const shareData = {
      title: `${list.title} — Top10`,
      text: list.description,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        // User cancelled or unsupported, fallback to clipboard
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

  const handleBookmarkToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleBookmark(list.id);
  };

  return (
    <div className="group relative bg-[#111111] hover:bg-[#151515] border border-[#1f1f1f] rounded-2xl p-5 flex flex-col justify-between tool-card-hover">
      <div>
        {/* Header: Category Badge & Action Buttons */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#181818] border border-[#242424] text-xs font-medium text-[#9ca3af] group-hover:border-[#10b981]/30 transition-colors">
            {getCategoryIconComponent(displayCategoryIcon)}
            <span>{displayCategoryName}</span>
          </div>

          <div className="flex items-center gap-1">
            {/* Share button (always visible on touch, hover visible on desktop) */}
            <button
              onClick={handleShare}
              className="p-1.5 rounded-lg text-[#9ca3af] hover:text-[#f5f5f5] hover:bg-[#202020] opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all focus:opacity-100 focus:outline-none focus:ring-1 focus:ring-[#10b981]"
              aria-label="Share this list"
              title="Share list"
            >
              <Share2 className={`w-4 h-4 ${copied ? 'text-[#10b981]' : ''}`} />
            </button>

            {/* Bookmark button */}
            <button
              onClick={handleBookmarkToggle}
              className={`p-1.5 rounded-lg transition-colors focus:outline-none focus:ring-1 focus:ring-[#10b981] ${
                bookmarked
                  ? 'text-[#10b981] bg-[#10b981]/10'
                  : 'text-[#9ca3af] hover:text-[#f5f5f5] hover:bg-[#202020]'
              }`}
              aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark list'}
              title={bookmarked ? 'Saved' : 'Save for later'}
            >
              <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Title (2-line clamp) */}
        <Link to={`/list/${list.slug}`} className="block focus:outline-none">
          <h3 className="text-base font-bold text-[#f5f5f5] leading-snug line-clamp-2 group-hover:text-[#10b981] transition-colors">
            {list.title}
          </h3>
          <p className="text-xs text-[#9ca3af] mt-1.5 line-clamp-2 leading-relaxed">
            {list.description}
          </p>
        </Link>
      </div>

      <div className="mt-5 pt-4 border-t border-[#1b1b1b]">
        {/* Strip of 3 overlapping tool logos + "+7 more" */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex -space-x-2 overflow-hidden items-center mr-2">
              {firstThreeTools.map((tool, idx) => (
                <div
                  key={tool.id}
                  className="inline-block w-7 h-7 rounded-full ring-2 ring-[#111111] bg-[#202020] overflow-hidden shrink-0 flex items-center justify-center shadow-sm"
                  title={tool.name}
                >
                  {tool.logo_url ? (
                    <img
                      src={tool.logo_url}
                      alt={tool.name}
                      className="w-full h-full object-contain p-1"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <span className="text-[11px] font-bold text-[#10b981]">{tool.name[0]}</span>
                  )}
                </div>
              ))}
            </div>

            <span className="text-xs font-semibold text-[#9ca3af] group-hover:text-[#f5f5f5] transition-colors">
              +{remainingCount || 7} more
            </span>
          </div>

          {/* Footer info: 10 tools · Updated Xd ago */}
          <span className="text-[11px] text-[#9ca3af]/80">
            {formatTimeAgo(list.updated_at)}
          </span>
        </div>
      </div>
    </div>
  );
};
