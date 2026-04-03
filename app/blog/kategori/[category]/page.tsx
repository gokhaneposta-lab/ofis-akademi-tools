import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogIndexClient from "@/components/blog/BlogIndexClient";
import { getAllCategorySlugs, getCategoryBySlug, type BlogCategorySlug } from "@/lib/blog-posts";
import { getSiteUrl } from "@/lib/site";

const BASE_URL = getSiteUrl();

type Props = { params: Promise<{ category: string }> };

export async function generateStaticParams() {
  return getAllCategorySlugs().map((c) => ({ category: c }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const cat = getCategoryBySlug(category);
  if (!cat) return { title: "Kategori bulunamadı | Ofis Akademi" };
  const title = `Excel Blog — ${cat.label} | Ofis Akademi`;
  const url = `${BASE_URL}/blog/kategori/${cat.slug}`;
  return {
    title,
    description: cat.description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: cat.description,
      type: "website",
      url,
      siteName: "Ofis Akademi",
      locale: "tr_TR",
    },
  };
}

export default async function BlogCategoryPage({ params }: Props) {
  const { category } = await params;
  const cat = getCategoryBySlug(category);
  if (!cat) notFound();
  return <BlogIndexClient category={category as BlogCategorySlug} />;
}

