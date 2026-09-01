import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getProfile } from "@/data/repositories/profile.repository";

export default async function RootPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  const profile = await getProfile(session.user.id);
  if (!profile?.onboardingCompletedAt) {
    redirect("/onboarding");
  }
  redirect("/home");
}
