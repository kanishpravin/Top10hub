import React from 'react';
import { ExternalLink, ThumbsUp, ShieldCheck, Sparkles, Star } from 'lucide-react';
import { Tool } from '../types';
import { useApp } from '../context/AppContext';

interface ToolRowProps {
  tool: Tool;
  rank: number;
}

export const ToolRow: React.FC<ToolRowProps> = ({ tool, rank }) => {
  const { isUpvoted, toggleUpvote } = useApp();
  const upvoted = isUpvoted(tool.id);

  const getPricingBadge = (pricing: Tool['pricing']) => {
    switch (pricing) {
      case 'free':
        return (
          <span className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Free
          </span>
        );
      case 'freemium':
        return (
          <span className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            Freemium
          </span>
        );
      case 'paid':
        return (
          <span className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Paid
          </span>
        );
      default:
        return null;
    }
  };

  const getRankBadgeStyle = (r: number) => {
    if (r === 1) {
      return 'bg-[#10b981] text-black font-extrabold ring-2 ring-[#10b981]/50';
    }
    if (r === 2) {
      return 'bg-[#222222] text-[#f5f5f5] font-bold border border-[#333333]';
    }
    if (r === 3) {
      return 'bg-[#1a1a1a] text-[#f5f5f5] font-bold border border-[#282828]';
    }
    return 'bg-[#161616] text-[#9ca3af] font-medium border border-[#222222]';
  };

  return (
    <div className="group relative bg-[#111111] hover:bg-[#141414] border border-[#1f1f1f] hover:border-[#10b981]/40 rounded-2xl p-4 sm:p-5 transition-all duration-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Left side: Rank + Logo + Name + Description + Pricing */}
      <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 flex-1 min-w-0">
        {/* Rank Badge */}
        <div
          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-sm shrink-0 shadow-sm transition-transform group-hover:scale-105 ${getRankBadgeStyle(
            rank
          )}`}
          title={`Rank #${rank}`}
        >
          {rank === 1 ? (
            <div className="flex items-center gap-0.5">
              <span>#1</span>
            </div>
          ) : (
            `#${rank}`
          )}
        </div>

        {/* Tool Logo */}
        <div className="w-12 h-12 rounded-xl bg-[#1c1c1c] border border-[#262626] p-2 flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
          {tool.logo_url ? (
            <img
              src={tool.logo_url}
              alt={tool.name}
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <span className="text-base font-bold text-[#10b981]">{tool.name[0]}</span>
          )}
        </div>

        {/* Title, Details, Score & Pricing */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <a
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-base font-bold text-[#f5f5f5] hover:text-[#10b981] transition-colors flex items-center gap-1.5 focus:outline-none"
            >
              <span>{tool.name}</span>
            </a>

            {/* Verified icon */}
            <span title="Verified and tested tool" className="inline-flex items-center">
              <ShieldCheck className="w-4 h-4 text-[#10b981]" />
            </span>

            {/* Pricing badge */}
            {getPricingBadge(tool.pricing)}

            {/* AI Score Badge */}
            <span
              className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-md bg-[#181818] text-[#9ca3af] border border-[#252525]"
              title={`Algorithmic Quality Score: ${tool.score}/100`}
            >
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span>{tool.score}</span>
            </span>

            {/* Source Pill */}
            <span className="hidden lg:inline-flex text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#1f1f1f] text-[#9ca3af]/80">
              {tool.source}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-[#9ca3af] leading-relaxed line-clamp-2">
            {tool.description}
          </p>
        </div>
      </div>

      {/* Right side: Upvote Button & Visit Button */}
      <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-3 md:pt-0 border-t md:border-t-0 border-[#1c1c1c] shrink-0">
        {/* Upvote Button with Count */}
        <button
          onClick={() => toggleUpvote(tool.id)}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all focus:outline-none focus:ring-1 focus:ring-[#10b981] ${
            upvoted
              ? 'bg-[#10b981]/15 text-[#10b981] border-[#10b981]/40'
              : 'bg-[#161616] text-[#9ca3af] border-[#222222] hover:text-[#f5f5f5] hover:border-[#10b981]/30 hover:bg-[#1a1a1a]'
          }`}
          aria-label={upvoted ? 'Remove upvote' : 'Upvote tool'}
        >
          <ThumbsUp className={`w-3.5 h-3.5 ${upvoted ? 'fill-current' : ''}`} />
          <span className="font-mono">{tool.upvotes.toLocaleString()}</span>
        </button>

        {/* Outbound Visit Button */}
        <a
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#10b981] hover:bg-[#059669] text-black transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]"
        >
          <span>Visit</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
