import { notFound } from "next/navigation";
import { communityModuleMeta, type CommunityModule } from "../../data/community";
import { ModuleView } from "../CommunityViews";

type Props = {
  params: Promise<{ module: string }>;
};

export function generateStaticParams() {
  return Object.keys(communityModuleMeta).map((module) => ({ module }));
}

export default async function CommunityModulePage({ params }: Props) {
  const { module } = await params;

  if (!(module in communityModuleMeta)) {
    notFound();
  }

  return <ModuleView module={module as Exclude<CommunityModule, "community">} />;
}
