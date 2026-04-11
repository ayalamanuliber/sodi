"use client";

import { useState } from "react";
import Link from "next/link";
import type { ArticleMeta } from "@/lib/blog-types";
import { silos } from "@/lib/blog-types";

interface SiloGroup {
  key: string;
  label: string;
  description: string;
  color: string;
  articles: ArticleMeta[];
}

export function BlogIndex({ siloGroups }: { siloGroups: SiloGroup[] }) {
  const [activeSilo, setActiveSilo] = useState<string | null>(null);

  const filtered = activeSilo
    ? siloGroups.filter((g) => g.key === activeSilo)
    : siloGroups;

  return (
    <>
      {/* Silo filters */}
      <div className="flex gap-2 flex-wrap mb-8 sm:mb-10">
        <button
          onClick={() => setActiveSilo(null)}
          className={`px-3.5 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wide transition-all ${
            !activeSilo
              ? "bg-white/10 text-white border border-white/15"
              : "bg-white/[0.02] text-s-sub border border-white/[0.05] hover:bg-white/[0.05]"
          }`}
        >
          Todos ({siloGroups.reduce((sum, g) => sum + g.articles.length, 0)})
        </button>
        {siloGroups.map((g) => (
          <button
            key={g.key}
            onClick={() => setActiveSilo(g.key === activeSilo ? null : g.key)}
            className={`px-3.5 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wide transition-all ${
              activeSilo === g.key
                ? "bg-white/10 text-white border border-white/15"
                : "bg-white/[0.02] text-s-sub border border-white/[0.05] hover:bg-white/[0.05]"
            }`}
          >
            {g.label} ({g.articles.length})
          </button>
        ))}
      </div>

      {/* Article grid */}
      {filtered.map((group) => (
        <section key={group.key} className="mb-10 sm:mb-14">
          <div className="flex items-center gap-3 mb-4 sm:mb-5">
            <h2 className="text-[14px] sm:text-[16px] font-bold text-white tracking-tight">
              {group.label}
            </h2>
            <span className="text-[10px] text-s-dim font-mono">
              {group.articles.length} artículos
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {group.articles.map((article) => (
              <Link
                key={article.slug}
                href={`/blog/${article.slug}`}
                className="p-4 sm:p-5 bg-white/[0.02] border border-white/[0.06] rounded-xl hover:border-white/15 hover:bg-white/[0.04] transition-all group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-s-dim">
                    {group.label}
                  </span>
                  <span className="text-[9px] text-s-dim">·</span>
                  <span className="text-[9px] text-s-dim">{article.readingTime}</span>
                </div>
                <p className="text-[13px] sm:text-[14px] font-semibold text-white leading-snug group-hover:text-s-accent transition-colors">
                  {article.title}
                </p>
                <p className="text-[11px] text-s-dim mt-2 leading-relaxed line-clamp-2">
                  {article.metaDescription}
                </p>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
