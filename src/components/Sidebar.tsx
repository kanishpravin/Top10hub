import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Sparkles, 
  Zap, 
  GraduationCap, 
  Flame, 
  Sparkle, 
  Bookmark, 
  PlusCircle, 
  Shield, 
  Layers, 
  X,
  Compass
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const { categories, lists, bookmarkedListIds, role } = useApp();
  const location = useLocation();

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

  const navContent = (
    <div className="flex flex-col h-full justify-between py-5 px-3">
      <div className="space-y-6">
        {/* Discover section */}
        <div>
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-[#9ca3af]/70">
            Discover
          </div>
          <div className="space-y-1">
            <NavLink
              to="/"
              end
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#141414] text-[#10b981] border border-[#10b981]/30 font-semibold shadow-sm'
                    : 'text-[#9ca3af] hover:text-[#f5f5f5] hover:bg-[#141414]'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                <Compass className="w-4 h-4" />
                <span>All Directories</span>
              </div>
              <span className="text-[11px] font-mono text-[#9ca3af] bg-[#1a1a1a] px-1.5 py-0.5 rounded">
                {lists.length}
              </span>
            </NavLink>

            <a
              href="/#trending"
              onClick={onCloseMobile}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-[#9ca3af] hover:text-[#f5f5f5] hover:bg-[#141414] transition-all"
            >
              <div className="flex items-center gap-2.5">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Trending This Week</span>
              </div>
              <span className="text-[10px] font-semibold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
                HOT
              </span>
            </a>

            <a
              href="/#new"
              onClick={onCloseMobile}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-[#9ca3af] hover:text-[#f5f5f5] hover:bg-[#141414] transition-all"
            >
              <div className="flex items-center gap-2.5">
                <Sparkle className="w-4 h-4 text-emerald-400" />
                <span>New Lists</span>
              </div>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">
                NEW
              </span>
            </a>
          </div>
        </div>

        {/* Categories Section */}
        <div>
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-[#9ca3af]/70">
            Categories
          </div>
          <div className="space-y-1">
            {categories.map((cat) => {
              const count = lists.filter((l) => l.category_id === cat.id).length;
              const isActive = location.pathname === `/category/${cat.slug}`;

              return (
                <NavLink
                  key={cat.id}
                  to={`/category/${cat.slug}`}
                  onClick={onCloseMobile}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#141414] text-[#10b981] border border-[#10b981]/30 font-semibold shadow-sm'
                      : 'text-[#9ca3af] hover:text-[#f5f5f5] hover:bg-[#141414]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className={isActive ? 'text-[#10b981]' : 'text-[#9ca3af]'}>
                      {getCategoryIcon(cat.icon)}
                    </span>
                    <span className="truncate">{cat.name}</span>
                  </div>
                  <span className="text-[11px] font-mono text-[#9ca3af] bg-[#1a1a1a] px-1.5 py-0.5 rounded shrink-0">
                    {count}
                  </span>
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Personal Section */}
        <div>
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-[#9ca3af]/70">
            Personal
          </div>
          <div className="space-y-1">
            <NavLink
              to="/bookmarks"
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#141414] text-[#10b981] border border-[#10b981]/30 font-semibold shadow-sm'
                    : 'text-[#9ca3af] hover:text-[#f5f5f5] hover:bg-[#141414]'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                <Bookmark className="w-4 h-4 text-[#10b981]" />
                <span>Saved Lists</span>
              </div>
              <span className="text-[11px] font-mono text-[#9ca3af] bg-[#1a1a1a] px-1.5 py-0.5 rounded">
                {bookmarkedListIds.length}
              </span>
            </NavLink>

            <NavLink
              to="/submit"
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#141414] text-[#10b981] border border-[#10b981]/30 font-semibold shadow-sm'
                    : 'text-[#9ca3af] hover:text-[#f5f5f5] hover:bg-[#141414]'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                <PlusCircle className="w-4 h-4 text-[#10b981]" />
                <span>Submit Tool</span>
              </div>
            </NavLink>

            {role === 'admin' && (
              <NavLink
                to="/admin"
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/40 font-semibold shadow-sm'
                      : 'text-emerald-400/90 hover:text-emerald-300 hover:bg-[#141414]'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Shield className="w-4 h-4 text-[#10b981]" />
                  <span>Admin Panel</span>
                </div>
              </NavLink>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="pt-4 border-t border-[#1f1f1f] px-2 text-[11px] text-[#9ca3af]/60">
        <p className="font-medium text-[#9ca3af]">Top10 Curated Engine</p>
        <p className="mt-0.5">Ranked by algorithmic quality score &amp; community upvotes.</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden md:block w-60 shrink-0 sticky top-16 h-[calc(100vh-4rem)] border-r border-[#1f1f1f] bg-[#0c0c0c] overflow-y-auto">
        {navContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Navigation drawer"
          className="fixed inset-0 z-50 md:hidden bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={onCloseMobile}
        >
          <div
            className="w-72 max-w-[80vw] h-full bg-[#0c0c0c] border-r border-[#1f1f1f] flex flex-col animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-16 px-4 border-b border-[#1f1f1f] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#10b981] flex items-center justify-center font-extrabold text-black text-xs">
                  10
                </div>
                <span className="font-extrabold text-[#f5f5f5]">Top10</span>
              </div>
              <button
                onClick={onCloseMobile}
                className="p-1.5 text-[#9ca3af] hover:text-[#f5f5f5] rounded-lg"
                aria-label="Close navigation drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {navContent}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
