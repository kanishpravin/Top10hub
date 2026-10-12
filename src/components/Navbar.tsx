import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Search, 
  PlusCircle, 
  Bookmark, 
  ThumbsUp, 
  Shield, 
  Menu, 
  X, 
  User, 
  LogOut, 
  Check, 
  ChevronDown
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface NavbarProps {
  onToggleMobileSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileSidebar }) => {
  const { 
    openSearch, 
    user, 
    role, 
    setMockRole, 
    signOut, 
    signIn, 
    bookmarkedListIds,
    upvotedToolIds,
    isSupabaseActive
  } = useApp();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const location = useLocation();

  const handleDemoSignIn = async (roleToUse: 'user' | 'admin') => {
    await signIn(roleToUse === 'admin' ? 'admin@top10.app' : 'curator@top10.app', roleToUse);
    setShowAuthModal(false);
    setIsUserMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#0a0a0a]/90 backdrop-blur-md border-b border-[#1f1f1f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Left: Mobile Menu Toggle & Brand Wordmark */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleMobileSidebar}
              className="md:hidden p-2 text-[#9ca3af] hover:text-[#f5f5f5] hover:bg-[#161616] rounded-xl transition-colors focus:outline-none focus:ring-1 focus:ring-[#10b981]"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link to="/" className="flex items-center gap-2 group focus:outline-none">
              <div className="w-8 h-8 rounded-lg bg-[#10b981] flex items-center justify-center font-extrabold text-black text-sm tracking-tighter group-hover:scale-105 transition-transform">
                10
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-extrabold tracking-tight text-[#f5f5f5]">
                  Top<span className="text-[#10b981]">10</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest text-[#9ca3af]/60">
                  Curated
                </span>
              </div>
            </Link>
          </div>

          {/* Middle: Search Trigger */}
          <div className="flex-1 max-w-md mx-2 sm:mx-6">
            <button
              onClick={openSearch}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#141414] border border-[#1f1f1f] text-[#9ca3af] hover:border-[#10b981]/40 hover:text-[#f5f5f5] transition-all text-sm group focus:outline-none focus:ring-2 focus:ring-[#10b981]"
            >
              <div className="flex items-center gap-2.5">
                <Search className="w-4 h-4 text-[#9ca3af] group-hover:text-[#10b981] transition-colors" />
                <span className="truncate text-xs sm:text-sm">Search 100+ ranked tools &amp; lists...</span>
              </div>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono px-2 py-0.5 rounded bg-[#1f1f1f] text-[#9ca3af] border border-[#2a2a2a]">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right: Actions & User */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/submit"
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                location.pathname === '/submit'
                  ? 'bg-[#10b981]/15 text-[#10b981] border-[#10b981]/50'
                  : 'bg-[#141414] text-[#f5f5f5] border-[#1f1f1f] hover:border-[#10b981]/40'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#10b981]" />
              <span>Submit a tool</span>
            </Link>

            {/* Admin Badge link if admin */}
            {role === 'admin' && (
              <Link
                to="/admin"
                className={`hidden lg:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                  location.pathname === '/admin'
                    ? 'bg-[#10b981] text-black border-[#10b981]'
                    : 'bg-[#1a1a1a] text-[#10b981] border-[#10b981]/30 hover:bg-[#10b981]/10'
                }`}
                title="Admin Control Panel"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin</span>
              </Link>
            )}

            {/* User Dropdown / Auth Button */}
            <div className="relative">
              {user ? (
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-[#141414] border border-[#1f1f1f] hover:border-[#10b981]/40 text-[#f5f5f5] transition-colors focus:outline-none"
                  aria-label="User menu"
                >
                  <div className="w-6 h-6 rounded-lg bg-[#222222] border border-[#2a2a2a] flex items-center justify-center text-xs font-semibold text-[#10b981]">
                    {user.full_name ? user.full_name[0].toUpperCase() : 'U'}
                  </div>
                  <span className="hidden sm:inline-block text-xs font-medium max-w-[100px] truncate">
                    {user.full_name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#9ca3af]" />
                </button>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#10b981] hover:bg-[#059669] text-black font-semibold text-xs transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]"
                >
                  Sign In
                </button>
              )}

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#111111] border border-[#1f1f1f] shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-3 py-2 border-b border-[#1f1f1f]">
                    <p className="text-xs font-semibold text-[#f5f5f5] truncate">{user?.full_name}</p>
                    <p className="text-[11px] text-[#9ca3af] truncate">{user?.email}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#1f1f1f] text-[#10b981] border border-[#10b981]/30">
                        {role === 'admin' ? 'Admin Access' : 'Member'}
                      </span>
                      {isSupabaseActive ? (
                        <span className="text-[10px] text-emerald-400">Supabase Connected</span>
                      ) : (
                        <span className="text-[10px] text-[#9ca3af]">Demo Storage</span>
                      )}
                    </div>
                  </div>

                  {/* Navigation Links in Menu */}
                  <div className="py-1">
                    <Link
                      to="/bookmarks"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-[#9ca3af] hover:text-[#f5f5f5] hover:bg-[#161616] transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Bookmark className="w-3.5 h-3.5 text-[#10b981]" />
                        Saved Lists
                      </span>
                      <span className="text-[11px] font-mono text-[#9ca3af]">
                        {bookmarkedListIds.length}
                      </span>
                    </Link>

                    <Link
                      to="/upvotes"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-[#9ca3af] hover:text-[#f5f5f5] hover:bg-[#161616] transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <ThumbsUp className="w-3.5 h-3.5 text-[#10b981]" />
                        Upvoted Tools
                      </span>
                      <span className="text-[11px] font-mono text-[#9ca3af]">
                        {upvotedToolIds.length}
                      </span>
                    </Link>

                    <Link
                      to="/admin"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-[#9ca3af] hover:text-[#f5f5f5] hover:bg-[#161616] transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-[#10b981]" />
                        Admin Panel
                      </span>
                    </Link>

                    <Link
                      to="/submit"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="sm:hidden flex items-center justify-between px-3 py-2 rounded-xl text-xs text-[#9ca3af] hover:text-[#f5f5f5] hover:bg-[#161616] transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <PlusCircle className="w-3.5 h-3.5 text-[#10b981]" />
                        Submit a Tool
                      </span>
                    </Link>
                  </div>

                  {/* Role Toggle Switcher for Demo Testing */}
                  <div className="pt-2 border-t border-[#1f1f1f]">
                    <div className="px-3 py-1 text-[11px] text-[#9ca3af] font-medium">
                      Role Switcher (Demo Mode):
                    </div>
                    <div className="grid grid-cols-2 gap-1 p-1 bg-[#161616] rounded-xl text-xs">
                      <button
                        onClick={() => setMockRole('user')}
                        className={`py-1 rounded-lg font-medium transition-colors ${
                          role === 'user'
                            ? 'bg-[#222222] text-[#10b981] shadow-sm'
                            : 'text-[#9ca3af] hover:text-[#f5f5f5]'
                        }`}
                      >
                        User
                      </button>
                      <button
                        onClick={() => setMockRole('admin')}
                        className={`py-1 rounded-lg font-medium transition-colors ${
                          role === 'admin'
                            ? 'bg-[#222222] text-[#10b981] shadow-sm'
                            : 'text-[#9ca3af] hover:text-[#f5f5f5]'
                        }`}
                      >
                        Admin
                      </button>
                    </div>
                  </div>

                  {/* Sign Out */}
                  <div className="pt-2 mt-1 border-t border-[#1f1f1f]">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        signOut();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-950/20 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* Backdrop for user menu */}
      {isUserMenuOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Sign in to Top10"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setShowAuthModal(false)}
        >
          <div
            className="w-full max-w-md bg-[#111111] border border-[#1f1f1f] rounded-2xl p-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-[#9ca3af] hover:text-[#f5f5f5] p-1"
              aria-label="Close auth dialog"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#10b981] flex items-center justify-center font-black text-black text-base mx-auto mb-3">
                10
              </div>
              <h2 className="text-xl font-bold text-[#f5f5f5]">Sign in to Top10</h2>
              <p className="text-xs text-[#9ca3af] mt-1">
                Save bookmarked lists, upvote ranking positions, and submit tools.
              </p>
            </div>

            {/* Email Magic link input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (authEmail) {
                  signIn(authEmail, 'user');
                  setShowAuthModal(false);
                }
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-medium text-[#9ca3af] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#161616] border border-[#242424] text-sm text-[#f5f5f5] placeholder-[#9ca3af]/50 focus:outline-none focus:border-[#10b981]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#10b981] hover:bg-[#059669] text-black font-semibold text-sm transition-colors"
              >
                Continue with Email
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#1f1f1f]"></div>
              </div>
              <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
                <span className="bg-[#111111] px-2 text-[#9ca3af]">Quick Demo Switcher</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleDemoSignIn('user')}
                className="py-2.5 px-3 rounded-xl bg-[#161616] border border-[#222222] hover:border-[#10b981]/50 text-xs font-semibold text-[#f5f5f5] flex items-center justify-center gap-1.5 transition-colors"
              >
                <User className="w-3.5 h-3.5 text-[#10b981]" />
                Demo User
              </button>

              <button
                onClick={() => handleDemoSignIn('admin')}
                className="py-2.5 px-3 rounded-xl bg-[#161616] border border-[#222222] hover:border-[#10b981]/50 text-xs font-semibold text-[#10b981] flex items-center justify-center gap-1.5 transition-colors"
              >
                <Shield className="w-3.5 h-3.5" />
                Demo Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
