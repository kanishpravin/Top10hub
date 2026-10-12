import React from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Compass, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ListCard } from '../components/ListCard';
import { SEOHead } from '../components/SEOHead';

export const BookmarksPage: React.FC = () => {
  const { lists, bookmarkedListIds } = useApp();

  const savedLists = lists.filter((l) => bookmarkedListIds.includes(l.id));

  return (
    <>
      <SEOHead
        title="Saved Lists — Top10"
        description="Your bookmarked Top 10 lists and software directories."
      />

      <div className="space-y-8 pb-16">
        <div className="flex items-center justify-between pb-3 border-b border-[#1b1b1b]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#10b981]/15 border border-[#10b981]/30 flex items-center justify-center text-[#10b981]">
              <Bookmark className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#f5f5f5] tracking-tight">Saved Lists</h1>
              <p className="text-xs text-[#9ca3af]">
                Your personal library of bookmarked rankings ({savedLists.length})
              </p>
            </div>
          </div>
        </div>

        {savedLists.length === 0 ? (
          <div className="py-20 text-center bg-[#111111] border border-[#1f1f1f] rounded-3xl p-8 space-y-4 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-[#1a1a1a] flex items-center justify-center mx-auto text-[#9ca3af]">
              <Bookmark className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#f5f5f5]">No saved lists yet</h3>
            <p className="text-xs text-[#9ca3af] leading-relaxed">
              Click the bookmark icon on any list card to save it here for quick reference anytime.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#10b981] hover:bg-[#059669] text-black text-xs font-semibold transition-colors"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Directories</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {savedLists.map((list) => (
              <ListCard key={list.id} list={list} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};
