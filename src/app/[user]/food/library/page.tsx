import type { Metadata } from "next";
import { FoodLibraryView } from "@/components/FoodLibraryView";

export const metadata: Metadata = { title: "Foods" };

export default async function FoodLibraryPage({ params }: { params: Promise<{ user: string }> }) {
  const { user } = await params;
  return <FoodLibraryView userId={user} />;
}
