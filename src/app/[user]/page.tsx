import { redirect } from "next/navigation";

export default async function UserHome({ params }: { params: Promise<{ user: string }> }) {
  const { user } = await params;
  redirect(`/${user}/dashboard`);
}
