import type { MetadataRoute } from "next";
import { CASE_STUDIES } from "@/lib/caseStudies";
import { getBlogMeta } from "@/lib/blog";
import { SITE_URL } from "@/lib/siteUrl";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const blog = getBlogMeta();

  return [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/use-cases/`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...CASE_STUDIES.map((study) => ({
      url: `${SITE_URL}/use-cases/${study.slug}/`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    {
      url: `${SITE_URL}${blog.section.path}/`,
      lastModified: new Date(blog.article.date),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}${blog.article.path}/`,
      lastModified: new Date(blog.article.date),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];
}
