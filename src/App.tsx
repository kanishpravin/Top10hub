import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { SearchModal } from './components/SearchModal';
import { ToastContainer } from './components/Toast';
import { HomePage } from './pages/HomePage';
import { ListPage } from './pages/ListPage';
import { CategoryPage } from './pages/CategoryPage';
import { SubmitPage } from './pages/SubmitPage';
import { BookmarksPage } from './pages/BookmarksPage';
import { UpvotesPage } from './pages/UpvotesPage';
import { AdminPage } from './pages/AdminPage';

function AppContent() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5] flex flex-col font-sans selection:bg-[#10b981]/20 selection:text-[#10b981]">
      <Navbar onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/list/:slug" element={<ListPage />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/submit" element={<SubmitPage />} />
            <Route path="/bookmarks" element={<BookmarksPage />} />
            <Route path="/upvotes" element={<UpvotesPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </main>
      </div>

      <footer className="border-t border-[#1f1f1f] bg-[#0c0c0c] py-8 text-xs text-[#9ca3af]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-[#10b981] flex items-center justify-center font-black text-black text-[10px]">
              10
            </div>
            <span className="font-bold text-[#f5f5f5]">Top10</span>
            <span>— The curated directory of Top 10 ranked tools &amp; software.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/" className="hover:text-[#f5f5f5] transition-colors">
              Explore
            </Link>
            <Link to="/submit" className="hover:text-[#f5f5f5] transition-colors">
              Submit Tool
            </Link>
            <Link to="/bookmarks" className="hover:text-[#f5f5f5] transition-colors">
              Saved Lists
            </Link>
            <Link to="/admin" className="hover:text-[#10b981] transition-colors">
              Curator Admin
            </Link>
          </div>
        </div>
      </footer>

      {/* Global Modals & Notifications */}
      <SearchModal />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </BrowserRouter>
  );
}
