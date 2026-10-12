import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Sparkles, 
  Zap, 
  GraduationCap, 
  Layers, 
  ArrowLeft, 
  Filter, 
  Layers3, 
  Wrench, 
  CheckCircle 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ListCard } from '../components/ListCard';
import { SEOHead } from '../components/SEOHead';

export const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { categories, lists, tools } = useApp();
  const [sortBy, setSortBy] = useState<'popular' | 'updated' | 'title'>('popular');

  const category = categories.find((c) => c.slug === slug);

  if (!category) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-[#f5f5f5]">Category Not Found</h2>
        <p className="text-sm text-[#9ca3af]">Please pick from our active curated categories.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#10b981] text-black font-semibold text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>
    );
  }

  // Get lists for this category
  let categoryLists = lists.filter((l) => l.category_id === category.id);
  const totalToolsCount = categoryLists.reduce((acc, curr) => acc + (curr.items?.length || 10), 0);

  if (sortBy === 'popular') {
    categoryLists.sort((a, b) => b.view_count - a.view_count);
  } else if (sortBy === 'updated') {
    categoryLists.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  } else if (sortBy === 'title') {
    categoryLists.sort((a, b) => a.title.localeCompare(b.title));
  }

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles className="w-8 h-8 text-[#10b981]" />;
      case 'Zap':
        return <Zap className="w-8 h-8 text-[#10b981]" />;
      case 'GraduationCap':
        return <GraduationCap className="w-8 h-8 text-[#10b981]" />;
      default:
        return <Layers className="w-8 h-8 text-[#10b981]" />;
    }
  };

  return (
    <>
      <SEOHead
        title={`Top 10 ${category.name} Lists — Top10`}
        description={category.description || `Browse the best ranked tools in ${category.name}.`}
        canonicalUrl={window.location.href}
      />

      <div className="space-y-8 pb-16">
        {/* Category Hero Header */}
        <div className="bg-[#111111] border border-[#1f1f1f] rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-[#181818] border border-[#242424] flex items-center justify-center shrink-0 shadow-inner">
              {getCategoryIcon(category.icon)}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs uppercase font-mono font-bold tracking-wider text-[#10b981]">
                  Directory Category
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-[#f5f5f5] tracking-tight">
                {category.name}
              </h1>
              <p className="text-sm text-[#9ca3af] mt-1.5 max-w-2xl leading-relaxed">
                {category.description}
              </p>

              {/* Stats pills */}
              <div className="flex items-center gap-4 mt-4 text-xs text-[#9ca3af]">
                <span className="flex items-center gap-1.5">
                  <Layers3 className="w-3.5 h-3.5 text-[#10b981]" />
                  <span>{categoryLists.length} Ranked Lists</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-[#10b981]" />
                  <span>{totalToolsCount} Tools Indexed</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Sort Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1b1b1b]">
          <span className="text-xs font-bold uppercase tracking-wider text-[#9ca3af]">
            All Lists in {category.name} ({categoryLists.length})
          </span>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#9ca3af]">Sort:</span>
            <div className="flex items-center gap-1 bg-[#141414] p-1 rounded-xl border border-[#222222] text-xs">
              <button
                onClick={() => setSortBy('popular')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  sortBy === 'popular'
                    ? 'bg-[#222222] text-[#10b981] font-semibold'
                    : 'text-[#9ca3af] hover:text-[#f5f5f5]'
                }`}
              >
                Most Popular
              </button>
              <button
                onClick={() => setSortBy('updated')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  sortBy === 'updated'
                    ? 'bg-[#222222] text-[#10b981] font-semibold'
                    : 'text-[#9ca3af] hover:text-[#f5f5f5]'
                }`}
              >
                Recently Updated
              </button>
              <button
                onClick={() => setSortBy('title')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  sortBy === 'title'
                    ? 'bg-[#222222] text-[#10b981] font-semibold'
                    : 'text-[#9ca3af] hover:text-[#f5f5f5]'
                }`}
              >
                Name A-Z
              </button>
            </div>
          </div>
        </div>

        {/* Grid of Lists */}
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
      </div>
    </>
  );
};
