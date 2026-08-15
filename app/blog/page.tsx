import type { Metadata } from "next";
import { BlogIndexPage } from "@/components/BlogIndexPage";
import { getBlogIndex } from "@/lib/blog";

export const dynamic = "force-static";

export async function generateMetadata(): Promise<Metadata> {
  const index = getBlogIndex();
  const title = [index.title, index.titleAccent].filter(Boolean).join(" ");
  return {
    title,
    description: index.lede[0],
    openGraph: {
      title: `${title} — Lever`,
      description: index.lede[0],
    },
  };
}

export default function Blog() {
  const index = getBlogIndex();
  return <BlogIndexPage index={index} />;
}
