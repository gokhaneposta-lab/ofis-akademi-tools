"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { THEME } from "@/lib/theme";
import { getPostByToolHref } from "@/lib/blog-posts";

type PageRibbonProps = {
  title: string;
  description?: string;
  children?: React.ReactNode;
};

export default function PageRibbon({ title, description, children }: PageRibbonProps) {
  const pathname = usePathname();
  const toolPost = pathname?.startsWith("/excel-araclari/") ? getPostByToolHref(pathname) : undefined;

  return (
    <div
      className="px-4 py-3 text-white"
      style={{ background: THEME.ribbon, fontFamily: THEME.font }}
    >
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold">{title}</h1>
          {description && (
            <p className="text-sm text-white/90 mt-0.5 max-w-2xl">{description}</p>
          )}
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {toolPost && (
            <Link
              href={`/blog/${toolPost.slug}`}
              className="rounded-full border border-white/40 bg-white/10 px-3 py-1.5 text-sm font-semibold transition hover:bg-white/15"
              title="Bu araç için detaylı rehbere git"
            >
              Bu konu hakkında detaylı rehber →
            </Link>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
