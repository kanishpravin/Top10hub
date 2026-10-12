// Supabase Edge Function: fetch-tools
// Runtime: Deno (TypeScript)
// Handles Gemini API with Google Search grounding, GitHub API, HN Algolia, OG Metadata extraction,
// staging insertion, and URL health check.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ToolCandidate {
  name: string;
  url: string;
  domain: string;
  category_id: string;
  category_name: string;
  source: string;
  raw_description?: string;
}

// 1. Pluggable Source: Google Gemini with Search Grounding
async function fetchGeminiGroundingCandidates(
  categoryName: string,
  categoryId: string,
  geminiKey: string
): Promise<ToolCandidate[]> {
  const prompt = `Search for trending, highly-rated, and popular tools, developer software, or web applications launched or trending in 2025/2026 for the category "${categoryName}". 
Return a JSON array of the top 3 tools with strictly this format:
[
  { "name": "ToolName", "url": "https://official-domain.com", "raw_description": "short summary" }
]
Do not wrap in markdown quotes if possible, output raw JSON only.`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          tools: [{ googleSearch: {} }], // Google Search grounding enabled
        }),
      }
    );

    if (!res.ok) {
      console.warn("Gemini Search Grounding request failed:", res.statusText);
      return [];
    }

    const data = await res.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    const cleanedJson = candidateText.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleanedJson);

    return (Array.isArray(parsed) ? parsed : []).map((item: any) => {
      const url = item.url?.startsWith("http") ? item.url : `https://${item.url}`;
      const domain = new URL(url).hostname.replace(/^www\./, "");
      return {
        name: item.name,
        url,
        domain,
        category_id: categoryId,
        category_name: categoryName,
        source: "gemini",
        raw_description: item.raw_description,
      };
    });
  } catch (err) {
    console.error("Gemini grounding error:", err);
    return [];
  }
}

// 2. Pluggable Source: GitHub API (Trending Repositories)
async function fetchGitHubCandidates(categoryId: string, categoryName: string): Promise<ToolCandidate[]> {
  try {
    const query = encodeURIComponent(`topic:${categoryName.toLowerCase().includes("ai") ? "ai" : "productivity"} stars:>1000 pushed:>2026-01-01`);
    const res = await fetch(`https://api.github.com/search/repositories?q=${query}&sort=stars&order=desc&per_page=3`, {
      headers: { "User-Agent": "Top10-Curator-Bot" },
    });

    if (!res.ok) return [];
    const data = await res.json();

    return (data.items || []).map((repo: any) => {
      const targetUrl = repo.homepage && repo.homepage.startsWith("http") ? repo.homepage : repo.html_url;
      const domain = new URL(targetUrl).hostname.replace(/^www\./, "");
      return {
        name: repo.name,
        url: targetUrl,
        domain,
        category_id: categoryId,
        category_name: categoryName,
        source: "github",
        raw_description: repo.description || "Open source developer software",
      };
    });
  } catch (err) {
    console.error("GitHub API error:", err);
    return [];
  }
}

// 3. Pluggable Source: Hacker News Algolia API
async function fetchHackerNewsCandidates(categoryId: string, categoryName: string): Promise<ToolCandidate[]> {
  try {
    const term = categoryName.includes("AI") ? "Show HN AI" : "Show HN tool";
    const res = await fetch(
      `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(term)}&tags=show_hn&hitsPerPage=3`
    );

    if (!res.ok) return [];
    const data = await res.json();

    return (data.hits || [])
      .filter((hit: any) => hit.url && hit.url.startsWith("http"))
      .map((hit: any) => {
        const domain = new URL(hit.url).hostname.replace(/^www\./, "");
        const cleanName = hit.title.replace(/^Show HN:\s*/i, "").split(/[-–|]/)[0].trim();
        return {
          name: cleanName,
          url: hit.url,
          domain,
          category_id: categoryId,
          category_name: categoryName,
          source: "hackernews",
          raw_description: hit.title,
        };
      });
  } catch (err) {
    console.error("HN Algolia error:", err);
    return [];
  }
}

// 4. Extract OpenGraph and Favicon metadata
async function extractMetadata(url: string, domain: string) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Top10Bot/1.0; +https://top10.app)" },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return {
        is_healthy: false,
        og_title: "",
        og_description: "",
        og_image: "",
        favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
      };
    }

    const html = await res.text();
    const getMeta = (prop: string) => {
      const match = html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']+)["']`, "i"));
      return match ? match[1] : "";
    };

    const ogTitle = getMeta("og:title") || "";
    const ogDesc = getMeta("og:description") || getMeta("description") || "";
    const ogImage = getMeta("og:image") || "";
    const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

    return {
      is_healthy: true,
      og_title: ogTitle,
      og_description: ogDesc,
      og_image: ogImage,
      favicon,
    };
  } catch {
    return {
      is_healthy: false,
      og_title: "",
      og_description: "",
      og_image: "",
      favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
    };
  }
}

// 5. Synthesize clean JSON summary with Gemini
async function synthesizeToolDetails(
  candidate: ToolCandidate,
  meta: any,
  geminiKey: string
) {
  if (!geminiKey) {
    return {
      description: meta.og_description.slice(0, 140) || candidate.raw_description?.slice(0, 140) || "Modern digital productivity and software tool.",
      pricing: "freemium",
      score: 88,
    };
  }

  const prompt = `Analyze this software tool:
Name: ${candidate.name}
URL: ${candidate.url}
Title: ${meta.og_title}
Raw Description: ${meta.og_description || candidate.raw_description}

Return JSON with:
{
  "description": "<Clean, professional one-line summary under 140 characters>",
  "pricing": "free" | "freemium" | "paid",
  "score": <numeric quality score between 60 and 99 based on usefulness and polish>,
  "is_spam_or_inappropriate": boolean
}`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return {
      description: (parsed.description || candidate.raw_description || "").slice(0, 140),
      pricing: parsed.pricing || "freemium",
      score: Number(parsed.score) || 85,
      is_spam: Boolean(parsed.is_spam_or_inappropriate),
    };
  } catch {
    return {
      description: (meta.og_description || candidate.raw_description || "").slice(0, 140),
      pricing: "freemium",
      score: 87,
      is_spam: false,
    };
  }
}

// Main Edge Function Handler
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY") || "";

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const body = await req.json().catch(() => ({}));
    const mode = body.mode || "crawl"; // 'crawl' or 'health_check'

    // --- MODE A: WEEKLY HEALTH CHECK ---
    if (mode === "health_check") {
      const { data: approvedTools, error } = await supabase
        .from("tools")
        .select("id, url, name")
        .eq("status", "approved");

      if (error) throw error;

      let deadCount = 0;
      for (const tool of approvedTools || []) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 4000);
          const res = await fetch(tool.url, { method: "HEAD", signal: controller.signal });
          clearTimeout(timeout);

          if (!res.ok && res.status >= 400 && res.status !== 403) {
            await supabase
              .from("tools")
              .update({ status: "dead", last_checked: new Date().toISOString() })
              .eq("id", tool.id);
            deadCount++;
          } else {
            await supabase
              .from("tools")
              .update({ last_checked: new Date().toISOString() })
              .eq("id", tool.id);
          }
        } catch {
          await supabase
            .from("tools")
            .update({ status: "dead", last_checked: new Date().toISOString() })
            .eq("id", tool.id);
          deadCount++;
        }
      }

      return new Response(
        JSON.stringify({ success: true, message: `Health check complete. Flagged ${deadCount} dead tools.` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- MODE B: AUTONOMOUS TOOL DISCOVERY & STAGING ---
    const { data: categories } = await supabase.from("categories").select("id, name, slug");
    const { data: existingTools } = await supabase.from("tools").select("url");
    const { data: existingStaging } = await supabase.from("tools_staging").select("url");

    const existingDomains = new Set<string>();
    for (const t of existingTools || []) {
      try {
        existingDomains.add(new URL(t.url).hostname.replace(/^www\./, ""));
      } catch {}
    }
    for (const s of existingStaging || []) {
      try {
        existingDomains.add(new URL(s.url).hostname.replace(/^www\./, ""));
      } catch {}
    }

    let stagedCount = 0;
    const insertedItems: any[] = [];

    for (const cat of categories || []) {
      // 1. Gather candidates from all pluggable sources
      const geminiCandidates = await fetchGeminiGroundingCandidates(cat.name, cat.id, geminiApiKey);
      const githubCandidates = await fetchGitHubCandidates(cat.id, cat.name);
      const hnCandidates = await fetchHackerNewsCandidates(cat.id, cat.name);

      const allCandidates = [...geminiCandidates, ...githubCandidates, ...hnCandidates];

      for (const candidate of allCandidates) {
        if (!candidate.domain || existingDomains.has(candidate.domain)) {
          continue; // de-duplicate by domain
        }

        // 2. Extract homepage metadata
        const meta = await extractMetadata(candidate.url, candidate.domain);
        if (!meta.is_healthy) continue;

        // 3. Synthesize summary with Gemini
        const synth = await synthesizeToolDetails(candidate, meta, geminiApiKey);
        if (synth.is_spam) continue;

        // 4. Insert into staging
        const stagingRow = {
          name: candidate.name,
          slug: candidate.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
          url: candidate.url,
          description: synth.description,
          logo_url: meta.favicon,
          pricing: synth.pricing,
          source: candidate.source,
          score: synth.score,
          category_id: candidate.category_id,
          status: "pending",
          notes: `Auto-fetched from ${candidate.source}. OG: ${meta.og_title || 'N/A'}`
        };

        const { error: insertErr } = await supabase.from("tools_staging").insert([stagingRow]);
        if (!insertErr) {
          existingDomains.add(candidate.domain);
          stagedCount++;
          insertedItems.push(stagingRow);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Pipeline run complete. ${stagedCount} candidates staged for review.`,
        stagedCount,
        sample: insertedItems.slice(0, 3)
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
