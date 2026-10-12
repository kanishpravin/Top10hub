import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Category, List, Tool, ToolStaging, UserRole, FetchLogEntry, Profile } from '../types';
import { INITIAL_CATEGORIES, INITIAL_LISTS, INITIAL_TOOLS, INITIAL_STAGING_TOOLS } from '../data/mockData';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

interface Toast {
  id: string;
  title: string;
  message?: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  // Auth & Profile
  user: Profile | null;
  role: UserRole;
  isLoggedIn: boolean;
  setMockRole: (role: UserRole) => void;
  signIn: (email: string, role?: UserRole) => Promise<void>;
  signOut: () => Promise<void>;

  // Data
  categories: Category[];
  tools: Tool[];
  lists: List[];
  stagingTools: ToolStaging[];
  bookmarkedListIds: string[];
  upvotedToolIds: string[];

  // User Actions
  toggleBookmark: (listId: string) => void;
  toggleUpvote: (toolId: string) => void;
  isBookmarked: (listId: string) => boolean;
  isUpvoted: (toolId: string) => boolean;
  submitTool: (candidate: {
    name: string;
    url: string;
    category_id: string;
    description: string;
    pricing: 'free' | 'freemium' | 'paid';
    notes?: string;
  }) => Promise<{ success: boolean; message: string }>;

  // Admin Actions
  approveStagingTool: (stagingId: string, targetListId?: string) => Promise<void>;
  rejectStagingTool: (stagingId: string) => Promise<void>;
  updateStagingTool: (updated: ToolStaging) => Promise<void>;
  bulkApproveAboveThreshold: (minScore: number) => Promise<number>;
  reorderListItems: (listId: string, reorderedToolIds: string[]) => void;
  updateList: (listId: string, partial: Partial<List>) => void;
  createList: (newList: Omit<List, 'id' | 'view_count' | 'updated_at'>) => void;
  removeDeadTool: (toolId: string) => void;
  replaceDeadTool: (deadToolId: string, replacement: Partial<Tool>) => void;

  // Auto-Fetching pipeline
  isFetching: boolean;
  fetchLogs: FetchLogEntry[];
  lastFetchTime: string | null;
  runAutoFetch: () => Promise<void>;

  // Search Modal
  isSearchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;

  // Toasts
  toasts: Toast[];
  addToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // Status
  isSupabaseActive: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEYS = {
  USER: 'top10_user',
  TOOLS: 'top10_tools',
  LISTS: 'top10_lists',
  STAGING: 'top10_staging',
  BOOKMARKS: 'top10_bookmarks',
  UPVOTES: 'top10_upvotes',
  LAST_FETCH: 'top10_last_fetch',
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // --- Auth State ---
  const [user, setUser] = useState<Profile | null>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    // Default logged-in demo user with admin capability switcher
    return {
      id: 'usr-admin-demo',
      email: 'curator@top10.app',
      full_name: 'Alex Rivera',
      role: 'admin',
      created_at: new Date().toISOString(),
    };
  });

  // --- Core Data State ---
  const [categories] = useState<Category[]>(INITIAL_CATEGORIES);

  const [tools, setTools] = useState<Tool[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.TOOLS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_TOOLS;
      }
    }
    return INITIAL_TOOLS;
  });

  const [lists, setLists] = useState<List[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.LISTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_LISTS;
      }
    }
    return INITIAL_LISTS;
  });

  const [stagingTools, setStagingTools] = useState<ToolStaging[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.STAGING);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_STAGING_TOOLS;
      }
    }
    return INITIAL_STAGING_TOOLS;
  });

  const [bookmarkedListIds, setBookmarkedListIds] = useState<string[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.BOOKMARKS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return ['list-ai-chatbots', 'list-prod-notes'];
      }
    }
    return ['list-ai-chatbots', 'list-prod-notes'];
  });

  const [upvotedToolIds, setUpvotedToolIds] = useState<string[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.UPVOTES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return ['tool-ai-1', 'tool-code-1', 'tool-note-1'];
      }
    }
    return ['tool-ai-1', 'tool-code-1', 'tool-note-1'];
  });

  // --- Auto-fetch state ---
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [fetchLogs, setFetchLogs] = useState<FetchLogEntry[]>([]);
  const [lastFetchTime, setLastFetchTime] = useState<string | null>(() => {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.LAST_FETCH) || '2026-10-12T02:00:00Z';
  });

  // --- Search modal state ---
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // --- Toast notifications ---
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((title: string, message?: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Save to localStorage when states update
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.TOOLS, JSON.stringify(tools));
  }, [tools]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.LISTS, JSON.stringify(lists));
  }, [lists]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.STAGING, JSON.stringify(stagingTools));
  }, [stagingTools]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarkedListIds));
  }, [bookmarkedListIds]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.UPVOTES, JSON.stringify(upvotedToolIds));
  }, [upvotedToolIds]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
    }
  }, [user]);

  // Connect to Supabase Auth if configured
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || 'user@example.com',
          full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          role: session.user.app_metadata?.role === 'admin' ? 'admin' : 'user',
          created_at: session.user.created_at,
        });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || 'user@example.com',
          full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          role: session.user.app_metadata?.role === 'admin' ? 'admin' : 'user',
          created_at: session.user.created_at,
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Keyboard shortcut for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // --- Auth Handlers ---
  const setMockRole = (role: UserRole) => {
    setUser((prev) => {
      if (!prev) {
        return {
          id: 'usr-demo',
          email: 'demo@top10.app',
          full_name: 'Demo Member',
          role,
          created_at: new Date().toISOString(),
        };
      }
      return { ...prev, role };
    });
    addToast('Role Changed', `Switched active mode to ${role.toUpperCase()}`, 'info');
  };

  const signIn = async (email: string, role: UserRole = 'user') => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) {
        addToast('Sign in error', error.message, 'error');
        return;
      }
      addToast('Check your email', 'We sent you a magic login link!', 'info');
      return;
    }

    // Demo Mode Sign In
    setUser({
      id: `usr-${Date.now()}`,
      email,
      full_name: email.split('@')[0],
      role,
      created_at: new Date().toISOString(),
    });
    addToast('Signed In', `Welcome back, ${email.split('@')[0]}!`, 'success');
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    addToast('Signed Out', 'You have been signed out successfully.', 'info');
  };

  // --- User Action Handlers ---
  const toggleBookmark = (listId: string) => {
    setBookmarkedListIds((prev) => {
      const exists = prev.includes(listId);
      if (exists) {
        addToast('Bookmark removed', 'Removed from your saved lists collection.', 'info');
        return prev.filter((id) => id !== listId);
      } else {
        addToast('List saved', 'Added to your bookmarked lists.', 'success');
        return [...prev, listId];
      }
    });
  };

  const isBookmarked = (listId: string) => bookmarkedListIds.includes(listId);

  const toggleUpvote = (toolId: string) => {
    const alreadyUpvoted = upvotedToolIds.includes(toolId);

    // Optimistic state toggle
    setUpvotedToolIds((prev) =>
      alreadyUpvoted ? prev.filter((id) => id !== toolId) : [...prev, toolId]
    );

    setTools((prev) =>
      prev.map((tool) => {
        if (tool.id === toolId) {
          const delta = alreadyUpvoted ? -1 : 1;
          const newUpvotes = Math.max(0, tool.upvotes + delta);
          // Recompute ranking score: 0.4*popularity + 0.3*recency + 0.2*growth + 0.1*manual_boost
          const popularityScore = Math.min(100, Math.round(newUpvotes / 40));
          const newScore = Math.min(100, Math.max(50, Math.round(0.4 * popularityScore + 0.3 * 95 + 0.2 * 90 + 0.1 * 95)));
          return {
            ...tool,
            upvotes: newUpvotes,
            score: newScore,
          };
        }
        return tool;
      })
    );

    if (alreadyUpvoted) {
      addToast('Upvote removed', 'Your upvote has been retracted.', 'info');
    } else {
      addToast('Upvoted!', 'Thanks for helping rank the best tools.', 'success');
    }
  };

  const isUpvoted = (toolId: string) => upvotedToolIds.includes(toolId);

  // --- Submit Tool ---
  const submitTool = async (candidate: {
    name: string;
    url: string;
    category_id: string;
    description: string;
    pricing: 'free' | 'freemium' | 'paid';
    notes?: string;
  }) => {
    // Normalization & duplicate domain check
    let cleanUrl = candidate.url.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }

    try {
      const parsed = new URL(cleanUrl);
      const domain = parsed.hostname.replace(/^www\./, '');

      const existsInTools = tools.some((t) => t.url.includes(domain));
      const existsInStaging = stagingTools.some((s) => s.url.includes(domain) && s.status === 'pending');

      if (existsInTools) {
        return { success: false, message: `Tool "${domain}" is already listed in our directory!` };
      }
      if (existsInStaging) {
        return { success: false, message: `Tool "${domain}" is already pending admin review in staging!` };
      }

      // Generate clean staging item
      const newStaging: ToolStaging = {
        id: `stage-${Date.now()}`,
        name: candidate.name,
        slug: candidate.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        url: cleanUrl,
        description: candidate.description,
        logo_url: `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
        pricing: candidate.pricing,
        source: 'user',
        score: Math.floor(Math.random() * 15) + 82, // realistic initial score
        category_id: candidate.category_id,
        status: 'pending',
        created_at: new Date().toISOString(),
        submitter_email: user?.email || 'guest@top10.app',
        notes: candidate.notes || 'Submitted by community member via submission form',
      };

      setStagingTools((prev) => [newStaging, ...prev]);
      addToast('Submission Received!', 'Your tool has been staged for curator review.', 'success');
      return { success: true, message: 'Tool submitted successfully to the staging queue.' };
    } catch {
      return { success: false, message: 'Please enter a valid website URL.' };
    }
  };

  // --- Admin Approval Actions ---
  const approveStagingTool = async (stagingId: string, targetListId?: string) => {
    const candidate = stagingTools.find((s) => s.id === stagingId);
    if (!candidate) return;

    // Convert staging to approved Tool
    const newTool: Tool = {
      id: `tool-${Date.now()}`,
      name: candidate.name,
      slug: candidate.slug,
      url: candidate.url,
      description: candidate.description,
      logo_url: candidate.logo_url,
      pricing: candidate.pricing,
      source: (candidate.source as Tool['source']) || 'curated',
      score: candidate.score,
      upvotes: Math.floor(Math.random() * 25) + 10,
      last_checked: new Date().toISOString(),
      status: 'approved',
      category_id: candidate.category_id,
    };

    setTools((prev) => [newTool, ...prev]);

    // Update staging status
    setStagingTools((prev) =>
      prev.map((s) => (s.id === stagingId ? { ...s, status: 'approved' as const } : s))
    );

    // Optionally attach to a list or category's top list
    if (targetListId) {
      setLists((prev) =>
        prev.map((l) => {
          if (l.id === targetListId) {
            const currentItems = l.items || [];
            if (currentItems.length < 10) {
              const nextRank = currentItems.length + 1;
              return {
                ...l,
                items: [...currentItems, { list_id: l.id, tool_id: newTool.id, rank: nextRank }],
                updated_at: new Date().toISOString(),
              };
            }
          }
          return l;
        })
      );
    }

    addToast('Tool Approved', `"${newTool.name}" has been published to Top10!`, 'success');
  };

  const rejectStagingTool = async (stagingId: string) => {
    setStagingTools((prev) =>
      prev.map((s) => (s.id === stagingId ? { ...s, status: 'rejected' as const } : s))
    );
    addToast('Candidate Rejected', 'Item moved to rejected history.', 'info');
  };

  const updateStagingTool = async (updated: ToolStaging) => {
    setStagingTools((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    addToast('Changes Saved', `Updated details for ${updated.name}`, 'success');
  };

  const bulkApproveAboveThreshold = async (minScore: number): Promise<number> => {
    const pendingEligible = stagingTools.filter((s) => s.status === 'pending' && s.score >= minScore);
    if (pendingEligible.length === 0) {
      addToast('No Matching Tools', `No pending items found with AI score ≥ ${minScore}.`, 'info');
      return 0;
    }

    for (const item of pendingEligible) {
      await approveStagingTool(item.id);
    }

    addToast('Bulk Approval Complete', `Approved ${pendingEligible.length} tools with score ≥ ${minScore}`, 'success');
    return pendingEligible.length;
  };

  const reorderListItems = (listId: string, reorderedToolIds: string[]) => {
    setLists((prev) =>
      prev.map((l) => {
        if (l.id === listId) {
          const newItems = reorderedToolIds.slice(0, 10).map((toolId, index) => ({
            list_id: listId,
            tool_id: toolId,
            rank: index + 1,
          }));
          return {
            ...l,
            items: newItems,
            updated_at: new Date().toISOString(),
          };
        }
        return l;
      })
    );
    addToast('Ranks Updated', 'List rankings re-ordered and saved.', 'success');
  };

  const updateList = (listId: string, partial: Partial<List>) => {
    setLists((prev) =>
      prev.map((l) => (l.id === listId ? { ...l, ...partial, updated_at: new Date().toISOString() } : l))
    );
    addToast('List Updated', 'List settings and metadata saved.', 'success');
  };

  const createList = (newListData: Omit<List, 'id' | 'view_count' | 'updated_at'>) => {
    const id = `list-${Date.now()}`;
    const fullList: List = {
      ...newListData,
      id,
      view_count: 0,
      updated_at: new Date().toISOString(),
    };
    setLists((prev) => [fullList, ...prev]);
    addToast('New List Created', `"${fullList.title}" is now live!`, 'success');
  };

  const removeDeadTool = (toolId: string) => {
    setTools((prev) => prev.filter((t) => t.id !== toolId));
    setLists((prev) =>
      prev.map((l) => ({
        ...l,
        items: (l.items || []).filter((item) => item.tool_id !== toolId).map((item, idx) => ({ ...item, rank: idx + 1 })),
      }))
    );
    addToast('Dead Tool Removed', 'Tool scrubbed from lists and catalog.', 'info');
  };

  const replaceDeadTool = (deadToolId: string, replacement: Partial<Tool>) => {
    setTools((prev) =>
      prev.map((t) => (t.id === deadToolId ? { ...t, ...replacement, status: 'approved' as const, last_checked: new Date().toISOString() } : t))
    );
    addToast('Tool Replaced', 'Updated link and verified healthy.', 'success');
  };

  // --- Auto-Fetching Pipeline Simulator & Executor ---
  const runAutoFetch = async () => {
    setIsFetching(true);
    setFetchLogs([]);

    const log = (level: FetchLogEntry['level'], message: string, source?: string) => {
      setFetchLogs((prev) => [
        ...prev,
        {
          id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: new Date().toLocaleTimeString(),
          level,
          message,
          source,
        },
      ]);
    };

    log('info', 'Starting autonomous tool discovery pipeline across 3 active categories...');

    await new Promise((r) => setTimeout(r, 600));
    log('info', 'Connecting to Google Gemini API (model: gemini-2.5-flash with Google Search grounding)...', 'Gemini');

    await new Promise((r) => setTimeout(r, 800));
    log('info', 'Querying Google Search Grounding for trending tools in "AI & Technology", "Productivity", "Education"...', 'Google Search');

    await new Promise((r) => setTimeout(r, 900));
    log('info', 'Querying public API connectors: GitHub (star delta > 500/wk), Hacker News Algolia, Product Hunt feeds...', 'Connectors');

    await new Promise((r) => setTimeout(r, 1000));
    log('success', 'Found 14 raw tool candidates from live search and public repositories.', 'Crawler');

    await new Promise((r) => setTimeout(r, 800));
    log('info', 'Extracting OpenGraph metadata, favicons, HTTP status codes, and deduplicating domain registry...', 'Extractor');

    await new Promise((r) => setTimeout(r, 900));
    log('info', 'Synthesizing clean <140 char descriptions and computing algorithmic quality scores (0-100)...', 'Gemini');

    // Simulate discovering 2 new tools into staging
    const candidatesToAdd: ToolStaging[] = [
      {
        id: `stage-${Date.now()}-1`,
        name: 'Cursor Composer v2',
        slug: 'cursor-composer-v2',
        url: 'https://cursor.com/features/composer',
        description: 'Multi-file AI workspace orchestrating complex cross-repository architecture refactors in real time.',
        logo_url: 'https://cursor.com/favicon.ico',
        pricing: 'freemium',
        source: 'gemini',
        score: 96,
        category_id: 'cat-1',
        status: 'pending',
        created_at: new Date().toISOString(),
        notes: 'Discovered via Google Search Grounding: Top trending GitHub repos and developer Twitter mentions.',
      },
      {
        id: `stage-${Date.now()}-2`,
        name: 'Omnivore',
        slug: 'omnivore-reader',
        url: 'https://omnivore.app',
        description: 'Open source, free, read-it-later app with newsletter inbox, highlighters, and Obsidian integration.',
        logo_url: 'https://omnivore.app/favicon.ico',
        pricing: 'free',
        source: 'hackernews',
        score: 92,
        category_id: 'cat-2',
        status: 'pending',
        created_at: new Date().toISOString(),
        notes: 'HN Algolia front page feature. 12k GitHub stars.',
      },
    ];

    setStagingTools((prev) => [...candidatesToAdd, ...prev]);

    await new Promise((r) => setTimeout(r, 700));
    log('success', `Added ${candidatesToAdd.length} verified candidate tools into staging queue for review.`, 'Staging');

    const nowIso = new Date().toISOString();
    setLastFetchTime(nowIso);
    localStorage.setItem(LOCAL_STORAGE_KEYS.LAST_FETCH, nowIso);
    setIsFetching(false);
    addToast('Fetch Run Complete', `Added ${candidatesToAdd.length} new candidates to Staging.`, 'success');
  };

  return (
    <AppContext.Provider
      value={{
        user,
        role: user?.role || 'user',
        isLoggedIn: Boolean(user),
        setMockRole,
        signIn,
        signOut,
        categories,
        tools,
        lists,
        stagingTools,
        bookmarkedListIds,
        upvotedToolIds,
        toggleBookmark,
        toggleUpvote,
        isBookmarked,
        isUpvoted,
        submitTool,
        approveStagingTool,
        rejectStagingTool,
        updateStagingTool,
        bulkApproveAboveThreshold,
        reorderListItems,
        updateList,
        createList,
        removeDeadTool,
        replaceDeadTool,
        isFetching,
        fetchLogs,
        lastFetchTime,
        runAutoFetch,
        isSearchOpen,
        openSearch: () => setIsSearchOpen(true),
        closeSearch: () => setIsSearchOpen(false),
        toasts,
        addToast,
        removeToast,
        isSupabaseActive: isSupabaseConfigured,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
