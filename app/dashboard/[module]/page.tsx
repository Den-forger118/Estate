import { notFound } from "next/navigation";
import { DashboardModule, moduleMeta } from "../../data/dashboard";
import { ModuleView } from "../DashboardViews";

type Props = {
  params: Promise<{ module: string }>;
};

export function generateStaticParams() {
  return Object.keys(moduleMeta)
    .filter((module) => module !== "dashboard")
    .map((module) => ({ module }));
}

export default async function DashboardModulePage({ params }: Props) {
  const { module } = await params;

  if (!(module in moduleMeta) || module === "dashboard") {
    notFound();
  }

  return <ModuleView module={module as DashboardModule} />;
}
