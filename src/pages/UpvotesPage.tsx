import React from 'react';
import { Link } from 'react-router-dom';
import { ThumbsUp, Compass, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ToolRow } from '../components/ToolRow';
import { SEOHead } from '../components/SEOHead';

export const UpvotesPage: React.FC = () => {
  const { tools, upvotedToolIds } = useApp();

  const upvotedTools = tools.filter((t) => upvotedToolIds.includes(t.id));

  return (
    <>
      <SEOHead
        title="Upvoted Tools — Top10"
        description="Tools and software products you have upvoted on Top10."
      />

      <div className="space-y-8 pb-16 max-w-5xl mx-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#1b1b1b]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#10b981]/15 border border-[#10b981]/30 flex items-center justify-center text-[#10b981]">
              <ThumbsUp className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#f5f5f5] tracking-tight">Upvoted Tools</h1>
              <p className="text-xs text-[#9ca3af]">
                Software and products you have upvoted ({upvotedTools.length})
              </p>
            </div>
          </div>
        </div>

        {upvotedTools.length === 0 ? (
          <div className="py-20 text-center bg-[#111111] border border-[#1f1f1f] rounded-3xl p-8 space-y-4 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-[#1a1a1a] flex items-center justify-center mx-auto text-[#9ca3af]">
              <ThumbsUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#f5f5f5]">No upvoted tools yet</h3>
            <p className="text-xs text-[#9ca3af] leading-relaxed">
              When you upvote tools in our Top 10 rankings, they will appear here and boost their directory score.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#10b981] hover:bg-[#059669] text-black text-xs font-semibold transition-colors"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Tools</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {upvotedTools.map((tool, idx) => (
              <ToolRow key={tool.id} tool={tool} rank={idx + 1} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};
