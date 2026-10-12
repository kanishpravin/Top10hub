import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Flame, 
  Sparkles, 
  Zap, 
  GraduationCap, 
  ArrowRight, 
  Layers, 
  Sparkle,
  TrendingUp,
  Filter
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ListCard } from '../components/ListCard';
import { SEOHead } from '../components/SEOHead';

export const HomePage: React.FC = () => {
  const { lists, categories, openSearch } = useApp();
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // Filtered lists
  const filteredLists = selectedCategoryFilter === 'all'
    ? lists
    : lists.filter((l) => l.category_id === selectedCategoryFilter);

  // Trending lists (top 4 by view count + upvotes)
  const trendingLists = [...lists]
    .sort((a, b) => b.view_count - a.view_count)
    .slice(0, 4);

  // New lists
  const newLists = lists.filter((l) => l.is_new).slice(0, 4);

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles className="w-4 h-4" />;
      case 'Zap':
        return <Zap className="w-4 h-4" />;
      case 'GraduationCap':
        return <GraduationCap className="w-4 h-4" />;
      default:
        return <Layers className="w-4 h-4" />;
    }
  };

  return (
    <>
      <SEOHead
        title="Top10 — Curated Directory of Ranked Tools & Websites"
        description="Discover the best tools, websites, and software ranked in hand-curated Top 10 lists across AI, productivity, developer tech, and education."
        canonicalUrl={window.location.origin}
      />

      <div className="space-y-12 pb-16">
        {/* Compact Hero Section */}
        <section className="relative pt-6 sm:pt-10 pb-4 text-center max-w-3xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#161616] border border-[#242424] text-xs font-semibold text-[#10b981] mb-4 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-ping" />
            <span>Updated Daily via Gemini + Community Signals</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#f5f5f5] tracking-tight leading-tight">
            Discover the <span className="text-[#10b981]">Best of Everything</span>
          </h1>

          <p className="mt-3 text-sm sm:text-base text-[#9ca3af] max-w-xl mx-auto leading-relaxed">
            Hand-curated, algorithmic Top 10 rankings of the most powerful tools, software, and websites on the web.
          </p>

          {/* Large Centered Search Bar */}
          <div className="mt-6 max-w-xl mx-auto">
            <button
              onClick={openSearch}
              className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl bg-[#111111] hover:bg-[#151515] border border-[#222222] hover:border-[#10b981]/50 text-[#9ca3af] hover:text-[#f5f5f5] transition-all shadow-xl group text-left focus:outline-none focus:ring-2 focus:ring-[#10b981]"
            >
              <div className="flex items-center gap-3">
                <Search className="w-5 h-5 text-[#9ca3af] group-hover:text-[#10b981] transition-colors" />
                <span className="text-sm">Search lists, tools, AI models, developer tools...</span>
              </div>
              <div className="flex items-center gap-1.5">
                <kbd className="hidden sm:inline-flex items-center gap-0.5 text-xs font-mono px-2 py-1 rounded-lg bg-[#1c1c1c] text-[#9ca3af] border border-[#2a2a2a]">
                  ⌘K
                </kbd>
              </div>
            </button>
          </div>

          {/* Horizontally scrollable row of Category chips */}
          <div className="mt-6 flex items-center justify-start sm:justify-center gap-2 overflow-x-auto no-scrollbar py-2 px-2">
            <button
              onClick={() => setSelectedCategoryFilter('all')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                selectedCategoryFilter === 'all'
                  ? 'bg-[#10b981] text-black shadow-md'
                  : 'bg-[#141414] text-[#9ca3af] hover:text-[#f5f5f5] hover:bg-[#1a1a1a] border border-[#1f1f1f]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All ({lists.length})</span>
            </button>

            {categories.map((cat) => {
              const count = lists.filter((l) => l.category_id === cat.id).length;
              const isSelected = selectedCategoryFilter === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryFilter(cat.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                    isSelected
                      ? 'bg-[#10b981] text-black shadow-md'
                      : 'bg-[#141414] text-[#9ca3af] hover:text-[#f5f5f5] hover:bg-[#1a1a1a] border border-[#1f1f1f]'
                  }`}
                >
                  {getCategoryIcon(cat.icon)}
                  <span>{cat.name} ({count})</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Section: Trending this week (4 cards) */}
        {selectedCategoryFilter === 'all' && (
          <section id="trending" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Flame className="w-4 h-4 fill-amber-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#f5f5f5] tracking-tight">Trending this week</h2>
                  <p className="text-xs text-[#9ca3af]">Ranked by recent verified community views &amp; upvote velocity</p>
                </div>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1 text-xs text-[#9ca3af] font-medium">
                <TrendingUp className="w-3.5 h-3.5 text-[#10b981]" />
                Live rankings
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {trendingLists.map((list) => (
                <ListCard key={list.id} list={list} />
              ))}
            </div>
          </section>
        )}

        {/* Section: New lists (with "New" badge) */}
        {selectedCategoryFilter === 'all' && newLists.length > 0 && (
          <section id="new" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[#10b981]">
                  <Sparkle className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-[#f5f5f5] tracking-tight">New lists</h2>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#10b981] text-black">
                      Freshly Added
                    </span>
                  </div>
                  <p className="text-xs text-[#9ca3af]">Recently researched and verified tool rankings</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {newLists.map((list) => (
                <ListCard key={list.id} list={list} />
              ))}
            </div>
          </section>
        )}

        {/* Category Sections: One section per category (when showing all) OR Filtered Grid */}
        {selectedCategoryFilter === 'all' ? (
          categories.map((category) => {
            const categoryLists = lists.filter((l) => l.category_id === category.id).slice(0, 6);

            return (
              <section key={category.id} className="space-y-4 pt-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#1a1a1a]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#181818] border border-[#242424] flex items-center justify-center text-[#10b981]">
                      {getCategoryIcon(category.icon)}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-[#f5f5f5] tracking-tight">{category.name}</h2>
                      <p className="text-xs text-[#9ca3af]">{category.description}</p>
                    </div>
                  </div>

                  <Link
                    to={`/category/${category.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#10b981] hover:text-[#059669] transition-colors group"
                  >
                    <span>View all</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {categoryLists.map((list) => (
                    <ListCard
                      key={list.id}
                      list={list}
                      categoryName={category.name}
                      categoryIcon={category.icon}
                    />
                  ))}
                </div>
              </section>
            );
          })
        ) : (
          <section className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#1a1a1a]">
              <div>
                <h2 className="text-xl font-bold text-[#f5f5f5]">
                  Filtered Results ({filteredLists.length})
                </h2>
                <p className="text-xs text-[#9ca3af]">
                  Showing curated Top 10 lists for {categories.find((c) => c.id === selectedCategoryFilter)?.name}
                </p>
              </div>

              <button
                onClick={() => setSelectedCategoryFilter('all')}
                className="text-xs text-[#10b981] hover:underline"
              >
                Clear filter
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredLists.map((list) => (
                <ListCard key={list.id} list={list} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
};
