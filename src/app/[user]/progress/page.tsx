import type { Metadata } from "next";
import { ProgressView } from "@/components/ProgressView";

export const metadata: Metadata = { title: "Progress" };

export default async function ProgressPage({ params }: { params: Promise<{ user: string }> }) {
  const { user } = await params;
  return <ProgressView userId={user} />;
}
