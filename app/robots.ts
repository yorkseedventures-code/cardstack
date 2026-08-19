import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// AI crawlers/agents that fetch pages on behalf of an LLM or answer engine.
// Explicitly allowed so KoiCard can be discovered and cited by AI assistants,
// not just traditional search engines.
const AI_USER_AGENTS = [
  "GPTBot",           // OpenAI training crawler
  "OAI-SearchBot",     // OpenAI search
  "ChatGPT-User",       // ChatGPT browsing on a user's behalf
  "ClaudeBot",          // Anthropic crawler
  "Claude-User",        // Claude browsing on a user's behalf
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",   // Google's AI training/Gemini use of crawled content
  "Applebot-Extended",
  "Bingbot",
  "CCBot",              // Common Crawl (feeds many LLM training sets)
];

export default function robots(): MetadataRoute.Robots {
  const rules: MetadataRoute.Robots["rules"] = [
    {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",     // no public content, and shouldn't be crawled
        "/auth",     // login form, no unique content
        "/gift/",    // contains single-use secret claim codes, must not be indexed
        "/$",        // the app's root "/" is the authenticated dashboard, not marketing content (that's /landing)
      ],
    },
    ...AI_USER_AGENTS.map((userAgent) => ({
      userAgent,
      allow: "/",
      disallow: ["/api/", "/auth", "/gift/", "/$"],
    })),
  ];

  return {
    rules,
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
