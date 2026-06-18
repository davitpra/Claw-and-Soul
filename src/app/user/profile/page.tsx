import { Container } from "@/shared/ui/Container";
import { DashboardTabs } from "@/widgets/user-dashboard/ui/DashboardTabs";

export const metadata = {
  title: "Profile & Settings — Claw & Soul",
};

export default function UserProfilePage() {
  return (
    <Container className="py-10">
      <DashboardTabs />
      <div className="mt-8 rounded-xl bg-white p-8">
        <h1 className="font-display text-2xl font-black text-text-main">
          Profile &amp; Settings
        </h1>
        <p className="mt-2 text-text-muted">
          Update your name, email, and password here. Coming soon.
        </p>
      </div>
    </Container>
  );
}
