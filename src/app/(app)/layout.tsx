import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getProfile } from "@/data/repositories/profile.repository";
import { AppNav } from "@/components/layout/AppNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const profile = await getProfile(session.user.id);
  if (!profile?.onboardingCompletedAt) redirect("/onboarding");

  return (
    <div className="min-h-screen bg-paper">
      <AppNav />
      <main className="mx-auto max-w-2xl px-4 pb-24 pt-6 md:ml-56 md:max-w-3xl md:pb-10">{children}</main>
    </div>
  );
}
