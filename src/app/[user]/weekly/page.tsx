import type { Metadata } from "next";
import { WeeklyView } from "@/components/WeeklyView";

export const metadata: Metadata = { title: "Weekly report" };

export default async function WeeklyPage({ params }: { params: Promise<{ user: string }> }) {
  const { user } = await params;
  return <WeeklyView userId={user} />;
}
