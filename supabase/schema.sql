-- ============================================================================
-- TOP10 DATABASE SCHEMA & RLS POLICIES
-- ============================================================================

-- 1. Create Enums
DO $$ BEGIN
  CREATE TYPE pricing_tier AS ENUM ('free', 'freemium', 'paid');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE tool_status AS ENUM ('pending', 'approved', 'rejected', 'dead');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('user', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT NOT NULL DEFAULT 'Layers',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Profiles Table (linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'user',
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Tools Table
CREATE TABLE IF NOT EXISTS tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  url TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  logo_url TEXT,
  pricing pricing_tier NOT NULL DEFAULT 'freemium',
  source TEXT NOT NULL DEFAULT 'curated',
  score NUMERIC(5,2) NOT NULL DEFAULT 85.00,
  upvotes INT NOT NULL DEFAULT 0,
  last_checked TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  status tool_status NOT NULL DEFAULT 'approved',
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Lists Table
CREATE TABLE IF NOT EXISTS lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  view_count INT NOT NULL DEFAULT 0,
  is_trending BOOLEAN NOT NULL DEFAULT false,
  is_new BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. List Items Table (Rank 1 - 10)
CREATE TABLE IF NOT EXISTS list_items (
  list_id UUID NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  rank INT NOT NULL CHECK (rank >= 1 AND rank <= 10),
  PRIMARY KEY (list_id, tool_id)
);

-- 7. Upvotes Table
CREATE TABLE IF NOT EXISTS upvotes (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (user_id, tool_id)
);

-- 8. Bookmarks Table
CREATE TABLE IF NOT EXISTS bookmarks (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  list_id UUID NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (user_id, list_id)
);

-- 9. Tools Staging Table (Pending candidates discovered by Edge Function / Submissions)
CREATE TABLE IF NOT EXISTS tools_staging (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT NOT NULL,
  logo_url TEXT,
  pricing pricing_tier NOT NULL DEFAULT 'freemium',
  source TEXT NOT NULL,
  score NUMERIC(5,2) NOT NULL DEFAULT 80.00,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitter_email TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_tools_slug ON tools(slug);
CREATE INDEX IF NOT EXISTS idx_tools_status ON tools(status);
CREATE INDEX IF NOT EXISTS idx_tools_category ON tools(category_id);
CREATE INDEX IF NOT EXISTS idx_tools_score ON tools(score DESC);
CREATE INDEX IF NOT EXISTS idx_lists_slug ON lists(slug);
CREATE INDEX IF NOT EXISTS idx_lists_category ON lists(category_id);
CREATE INDEX IF NOT EXISTS idx_list_items_list_rank ON list_items(list_id, rank);
CREATE INDEX IF NOT EXISTS idx_staging_status ON tools_staging(status);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools_staging ENABLE ROW LEVEL SECURITY;

-- Helper function: Is user an admin?
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Categories: Public read, admin write
CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT USING (true);
CREATE POLICY "Admins can modify categories" ON categories
  FOR ALL USING (is_admin());

-- Tools: Public read on approved content, admins can do all
CREATE POLICY "Approved tools viewable by everyone" ON tools
  FOR SELECT USING (status = 'approved');
CREATE POLICY "Admins can view and edit all tools" ON tools
  FOR ALL USING (is_admin());

-- Lists: Public read, admins can do all
CREATE POLICY "Lists are viewable by everyone" ON lists
  FOR SELECT USING (true);
CREATE POLICY "Admins can modify lists" ON lists
  FOR ALL USING (is_admin());

-- List Items: Public read, admins can do all
CREATE POLICY "List items are viewable by everyone" ON list_items
  FOR SELECT USING (true);
CREATE POLICY "Admins can modify list items" ON list_items
  FOR ALL USING (is_admin());

-- Profiles: Users can view all profiles, users can edit own profile
CREATE POLICY "Profiles viewable by everyone" ON profiles
  FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Upvotes: Authenticated users manage own upvotes
CREATE POLICY "Upvotes viewable by everyone" ON upvotes
  FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert own upvotes" ON upvotes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own upvotes" ON upvotes
  FOR DELETE USING (auth.uid() = user_id);

-- Bookmarks: Authenticated users manage own bookmarks
CREATE POLICY "Users can view own bookmarks" ON bookmarks
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bookmarks" ON bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own bookmarks" ON bookmarks
  FOR DELETE USING (auth.uid() = user_id);

-- Tools Staging: Public can submit (INSERT), Admins and Edge Function (service_role) can SELECT/UPDATE/DELETE
CREATE POLICY "Anyone can submit to staging" ON tools_staging
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view and manage staging" ON tools_staging
  FOR ALL USING (is_admin());

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Insert Categories
INSERT INTO categories (id, name, slug, icon, description) VALUES
  ('11111111-1111-1111-1111-111111111111', 'AI & Technology', 'ai-technology', 'Sparkles', 'Generative models, coding assistants, machine learning platforms, and neural tools.'),
  ('22222222-2222-2222-2222-222222222222', 'Productivity', 'productivity', 'Zap', 'Work management, asynchronous docs, automation, focus, and collaboration suites.'),
  ('33333333-3333-3333-3333-333333333333', 'Education', 'education', 'GraduationCap', 'Interactive learning platforms, university open courseware, language study, and simulations.')
ON CONFLICT (slug) DO NOTHING;

-- Insert Seed Tools for AI & Technology
INSERT INTO tools (id, name, slug, url, description, logo_url, pricing, source, score, upvotes, status, category_id) VALUES
  ('a1111111-0000-0000-0000-000000000001', 'ChatGPT', 'chatgpt', 'https://chatgpt.com', 'OpenAI’s premier AI assistant with reasoning models, internet browsing, and voice capabilities.', 'https://cdn.oaistatic.com/_next/static/media/apple-touch-icon.59f939e8.png', 'freemium', 'curated', 98.0, 3420, 'approved', '11111111-1111-1111-1111-111111111111'),
  ('a1111111-0000-0000-0000-000000000002', 'Claude', 'claude', 'https://claude.ai', 'Anthropic’s conversational intelligence engine known for nuanced analysis, artifact previews, and writing.', 'https://claude.ai/favicon.ico', 'freemium', 'curated', 97.0, 2980, 'approved', '11111111-1111-1111-1111-111111111111'),
  ('a1111111-0000-0000-0000-000000000003', 'Google Gemini', 'google-gemini', 'https://gemini.google.com', 'Multimodal AI with massive context window, live Google Search grounding, and Workspace integration.', 'https://www.gstatic.com/lamda/images/favicon_v1_150160cddff7f294ce30.svg', 'freemium', 'gemini', 96.0, 2840, 'approved', '11111111-1111-1111-1111-111111111111'),
  ('a1111111-0000-0000-0000-000000000004', 'Perplexity AI', 'perplexity-ai', 'https://www.perplexity.ai', 'Conversational answer engine delivering cited, real-time web research summaries and deep queries.', 'https://www.perplexity.ai/favicon.ico', 'freemium', 'producthunt', 95.0, 2310, 'approved', '11111111-1111-1111-1111-111111111111'),
  ('a1111111-0000-0000-0000-000000000005', 'DeepSeek', 'deepseek', 'https://www.deepseek.com', 'Open-weights reasoning model powerhouse delivering top-tier mathematical and coding inference.', 'https://www.deepseek.com/favicon.ico', 'free', 'github', 94.0, 1890, 'approved', '11111111-1111-1111-1111-111111111111'),
  ('a1111111-0000-0000-0000-000000000006', 'Mistral Le Chat', 'mistral-le-chat', 'https://chat.mistral.ai', 'European frontier AI platform with Pixtral vision, canvas code editing, and fast open models.', 'https://mistral.ai/favicon.ico', 'freemium', 'hackernews', 92.0, 1450, 'approved', '11111111-1111-1111-1111-111111111111'),
  ('a1111111-0000-0000-0000-000000000007', 'Poe by Quora', 'poe', 'https://poe.com', 'Unified ecosystem offering access to every major AI model and custom bot creators under one plan.', 'https://poe.com/favicon.ico', 'freemium', 'curated', 90.0, 1120, 'approved', '11111111-1111-1111-1111-111111111111'),
  ('a1111111-0000-0000-0000-000000000008', 'Groq', 'groq', 'https://groq.com', 'LPU Inference Engine delivering lightning-fast 500+ tokens-per-second conversational open LLMs.', 'https://groq.com/favicon.ico', 'free', 'hackernews', 89.0, 1040, 'approved', '11111111-1111-1111-1111-111111111111'),
  ('a1111111-0000-0000-0000-000000000009', 'Pi by Inflection', 'pi-ai', 'https://pi.ai', 'Empathetic, highly conversational personal AI designed for thoughtful dialogue and support.', 'https://pi.ai/favicon.ico', 'free', 'curated', 87.0, 820, 'approved', '11111111-1111-1111-1111-111111111111'),
  ('a1111111-0000-0000-0000-000000000010', 'HuggingChat', 'huggingchat', 'https://huggingface.co/chat', 'Open-source chat interface powered by Hugging Face featuring community open weights.', 'https://huggingface.co/favicon.ico', 'free', 'github', 86.0, 790, 'approved', '11111111-1111-1111-1111-111111111111')
ON CONFLICT (slug) DO NOTHING;

-- Insert Seed Lists
INSERT INTO lists (id, title, slug, category_id, description, view_count, is_trending, is_new) VALUES
  ('l1111111-1111-1111-1111-111111111111', 'Top 10 LLMs & AI Chatbots in 2026', 'top-10-llms-and-ai-chatbots', '11111111-1111-1111-1111-111111111111', 'The definitive ranked ranking of frontier artificial intelligence models, conversational assistants, and reasoning engines.', 14890, true, false)
ON CONFLICT (slug) DO NOTHING;

-- Insert List Items for LLM list
INSERT INTO list_items (list_id, tool_id, rank) VALUES
  ('l1111111-1111-1111-1111-111111111111', 'a1111111-0000-0000-0000-000000000001', 1),
  ('l1111111-1111-1111-1111-111111111111', 'a1111111-0000-0000-0000-000000000002', 2),
  ('l1111111-1111-1111-1111-111111111111', 'a1111111-0000-0000-0000-000000000003', 3),
  ('l1111111-1111-1111-1111-111111111111', 'a1111111-0000-0000-0000-000000000004', 4),
  ('l1111111-1111-1111-1111-111111111111', 'a1111111-0000-0000-0000-000000000005', 5),
  ('l1111111-1111-1111-1111-111111111111', 'a1111111-0000-0000-0000-000000000006', 6),
  ('l1111111-1111-1111-1111-111111111111', 'a1111111-0000-0000-0000-000000000007', 7),
  ('l1111111-1111-1111-1111-111111111111', 'a1111111-0000-0000-0000-000000000008', 8),
  ('l1111111-1111-1111-1111-111111111111', 'a1111111-0000-0000-0000-000000000009', 9),
  ('l1111111-1111-1111-1111-111111111111', 'a1111111-0000-0000-0000-000000000010', 10)
ON CONFLICT (list_id, tool_id) DO NOTHING;
