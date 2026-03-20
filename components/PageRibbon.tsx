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
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-x-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-balance text-base font-semibold sm:text-lg">{title}</h1>
          {description && (
            <p className="mt-0.5 max-w-2xl text-sm text-white/90">{description}</p>
          )}
        </div>
        <div className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:ml-auto sm:w-auto sm:justify-end">
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
