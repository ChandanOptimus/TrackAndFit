import type { Metadata } from "next";
import { DashboardView } from "@/components/DashboardView";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage({ params }: { params: Promise<{ user: string }> }) {
  const { user } = await params;
  return <DashboardView userId={user} />;
}
