import { notFound } from "next/navigation";
import { CaseStudyPage } from "@/components/CaseStudyPage";
import { CASE_STUDIES, getCaseStudy } from "@/lib/caseStudies";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return CASE_STUDIES.map((study) => ({ slug: study.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const study = getCaseStudy(slug);

  if (!study) {
    return { title: "Case Study" };
  }

  return {
    title: study.seo.title.replace(/\s*—\s*Lever\s*$/, ""),
    description: study.seo.description,
    openGraph: {
      title: study.seo.title,
      description: study.seo.description,
    },
  };
}

export default async function CaseStudyRoute({ params }: PageProps) {
  const { slug } = await params;
  const study = getCaseStudy(slug);

  if (!study) {
    notFound();
  }

  return <CaseStudyPage study={study} />;
}
