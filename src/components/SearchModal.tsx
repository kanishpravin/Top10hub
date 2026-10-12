import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ListOrdered, Wrench, ExternalLink, ArrowRight, CornerDownLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { List, Tool } from '../types';

export const SearchModal: React.FC = () => {
  const { isSearchOpen, closeSearch, lists, tools } = useApp();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 150ms debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 150);
    return () => clearTimeout(timer);
  }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (isSearchOpen) {
      setQuery('');
      setDebouncedQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isSearchOpen]);

  // Filter lists & tools
  const matchingLists: List[] = debouncedQuery
    ? lists.filter(
        (l) =>
          l.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          l.description.toLowerCase().includes(debouncedQuery.toLowerCase())
      ).slice(0, 5)
    : lists.slice(0, 4);

  const matchingTools: Tool[] = debouncedQuery
    ? tools.filter(
        (t) =>
          t.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          t.description.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          t.url.toLowerCase().includes(debouncedQuery.toLowerCase())
      ).slice(0, 6)
    : [];

  const combinedItems: Array<{ type: 'list'; item: List } | { type: 'tool'; item: Tool }> = [
    ...matchingLists.map((item) => ({ type: 'list' as const, item })),
    ...matchingTools.map((item) => ({ type: 'tool' as const, item })),
  ];

  // Reset selected index if outside bounds
  useEffect(() => {
    setSelectedIndex(0);
  }, [debouncedQuery]);

  // Keyboard navigation: ArrowUp, ArrowDown, Enter, Escape
  useEffect(() => {
    if (!isSearchOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeSearch();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1 < combinedItems.length ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : combinedItems.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (combinedItems[selectedIndex]) {
          const selected = combinedItems[selectedIndex];
          if (selected.type === 'list') {
            closeSearch();
            navigate(`/list/${selected.item.slug}`);
          } else {
            window.open(selected.item.url, '_blank', 'noopener,noreferrer');
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, selectedIndex, combinedItems, navigate, closeSearch]);

  if (!isSearchOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search lists and tools"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={closeSearch}
    >
      <div
        ref={containerRef}
        className="w-full max-w-2xl bg-[#111111] border border-[#1f1f1f] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#1f1f1f] bg-[#141414]">
          <Search className="w-5 h-5 text-[#9ca3af] mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search lists, tools, AI models, frameworks..."
            className="w-full bg-transparent text-[#f5f5f5] placeholder-[#9ca3af]/70 text-base focus:outline-none"
            aria-label="Search"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-[#9ca3af] hover:text-[#f5f5f5] p-1 mr-1"
              aria-label="Clear query"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[11px] font-mono px-2 py-0.5 rounded bg-[#1a1a1a] text-[#9ca3af] border border-[#2a2a2a]">
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="overflow-y-auto p-3 flex-1 space-y-4">
          {combinedItems.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-12 h-12 rounded-full bg-[#1a1a1a] flex items-center justify-center mx-auto mb-3 text-[#9ca3af]">
                <Search className="w-6 h-6" />
              </div>
              <p className="text-base font-semibold text-[#f5f5f5]">No results found</p>
              <p className="text-sm text-[#9ca3af] mt-1 max-w-sm mx-auto">
                No tools or lists matched &ldquo;{query}&rdquo;. Try searching for &ldquo;ChatGPT&rdquo;, &ldquo;Linear&rdquo;, or &ldquo;Obsidian&rdquo;.
              </p>
            </div>
          ) : (
            <>
              {/* Lists Section */}
              {matchingLists.length > 0 && (
                <div>
                  <div className="flex items-center justify-between px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#9ca3af]">
                    <span className="flex items-center gap-1.5">
                      <ListOrdered className="w-3.5 h-3.5 text-[#10b981]" />
                      Top 10 Ranked Lists
                    </span>
                    <span>{matchingLists.length} results</span>
                  </div>
                  <div className="space-y-1 mt-1">
                    {matchingLists.map((list) => {
                      const itemIndex = combinedItems.findIndex(
                        (x) => x.type === 'list' && x.item.id === list.id
                      );
                      const isSelected = itemIndex === selectedIndex;

                      return (
                        <button
                          key={list.id}
                          onClick={() => {
                            closeSearch();
                            navigate(`/list/${list.slug}`);
                          }}
                          onMouseEnter={() => setSelectedIndex(itemIndex)}
                          className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between transition-colors ${
                            isSelected
                              ? 'bg-[#1a1a1a] text-[#f5f5f5] ring-1 ring-[#10b981]/40'
                              : 'text-[#9ca3af] hover:bg-[#161616]'
                          }`}
                        >
                          <div className="min-w-0 pr-3">
                            <p
                              className={`text-sm font-semibold truncate ${
                                isSelected ? 'text-[#10b981]' : 'text-[#f5f5f5]'
                              }`}
                            >
                              {list.title}
                            </p>
                            <p className="text-xs text-[#9ca3af] truncate mt-0.5">
                              {list.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#222222] text-[#9ca3af]">
                              10 tools
                            </span>
                            <ArrowRight className="w-4 h-4 text-[#9ca3af]" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tools Section */}
              {matchingTools.length > 0 && (
                <div>
                  <div className="flex items-center justify-between px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#9ca3af]">
                    <span className="flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-[#10b981]" />
                      Tools &amp; Software
                    </span>
                    <span>{matchingTools.length} results</span>
                  </div>
                  <div className="space-y-1 mt-1">
                    {matchingTools.map((tool) => {
                      const itemIndex = combinedItems.findIndex(
                        (x) => x.type === 'tool' && x.item.id === tool.id
                      );
                      const isSelected = itemIndex === selectedIndex;

                      return (
                        <div
                          key={tool.id}
                          onClick={() => {
                            window.open(tool.url, '_blank', 'noopener,noreferrer');
                          }}
                          onMouseEnter={() => setSelectedIndex(itemIndex)}
                          className={`cursor-pointer px-3 py-2.5 rounded-xl flex items-center justify-between transition-colors ${
                            isSelected
                              ? 'bg-[#1a1a1a] text-[#f5f5f5] ring-1 ring-[#10b981]/40'
                              : 'text-[#9ca3af] hover:bg-[#161616]'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 pr-3">
                            <div className="w-7 h-7 rounded-lg bg-[#222222] border border-[#2a2a2a] flex items-center justify-center shrink-0 overflow-hidden">
                              {tool.logo_url ? (
                                <img
                                  src={tool.logo_url}
                                  alt={tool.name}
                                  className="w-5 h-5 object-contain"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <span className="text-xs font-bold text-[#10b981]">
                                  {tool.name[0]}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p
                                className={`text-sm font-semibold truncate ${
                                  isSelected ? 'text-[#10b981]' : 'text-[#f5f5f5]'
                                }`}
                              >
                                {tool.name}
                              </p>
                              <p className="text-xs text-[#9ca3af] truncate mt-0.5">
                                {tool.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[11px] uppercase font-mono px-2 py-0.5 rounded bg-[#1f1f1f] text-[#9ca3af]">
                              {tool.pricing}
                            </span>
                            <ExternalLink className="w-4 h-4 text-[#9ca3af]" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer hints */}
        <div className="px-4 py-2.5 border-t border-[#1f1f1f] bg-[#141414] flex items-center justify-between text-xs text-[#9ca3af]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="font-mono px-1 py-0.5 rounded bg-[#1f1f1f] text-[#f5f5f5] border border-[#2a2a2a]">↑</kbd>
              <kbd className="font-mono px-1 py-0.5 rounded bg-[#1f1f1f] text-[#f5f5f5] border border-[#2a2a2a]">↓</kbd>
              <span>to navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <CornerDownLeft className="w-3.5 h-3.5 text-[#10b981]" />
              <span>to open</span>
            </span>
          </div>
          <span className="hidden sm:inline">Press Esc to close</span>
        </div>
      </div>
    </div>
  );
};
