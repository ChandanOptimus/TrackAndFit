import { notFound } from "next/navigation";
import { UserNav } from "@/components/UserNav";
import { getUser } from "@/lib/users";

export default async function UserLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ user: string }>;
}) {
  const { user: id } = await params;
  const user = getUser(id);
  if (!user) notFound();

  return (
    <div
      className="shell"
      style={{ "--user": user.accent, "--user-soft": user.accentSoft } as React.CSSProperties}
    >
      <UserNav user={user} />
      <main className="page">{children}</main>
    </div>
  );
}
