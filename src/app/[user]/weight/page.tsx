import type { Metadata } from "next";
import { WeightView } from "@/components/WeightView";

export const metadata: Metadata = { title: "Log weight" };

export default async function WeightPage({ params }: { params: Promise<{ user: string }> }) {
  const { user } = await params;
  return <WeightView userId={user} />;
}
