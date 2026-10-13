import type { Metadata } from "next";
import { FoodView } from "@/components/FoodView";

export const metadata: Metadata = { title: "Food" };

export default async function FoodPage({ params }: { params: Promise<{ user: string }> }) {
  const { user } = await params;
  return <FoodView userId={user} />;
}
