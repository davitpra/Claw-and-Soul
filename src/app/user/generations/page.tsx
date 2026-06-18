import { Container } from "@/shared/ui/Container";
import { DashboardTabs } from "@/widgets/user-dashboard/ui/DashboardTabs";

export const metadata = {
  title: "My Artworks — Claw & Soul",
};

export default function UserGenerationsPage() {
  return (
    <Container className="py-10">
      <DashboardTabs />
      <div className="mt-8 rounded-xl bg-white p-8">
        <h1 className="font-display text-2xl font-black text-text-main">
          My Artworks
        </h1>
        <p className="mt-2 text-text-muted">
          All your generated pet artworks will appear here. Coming soon.
        </p>
      </div>
    </Container>
  );
}
