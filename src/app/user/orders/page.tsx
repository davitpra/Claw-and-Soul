import { Container } from "@/shared/ui/Container";
import { DashboardTabs } from "@/widgets/user-dashboard/ui/DashboardTabs";

export const metadata = {
  title: "My Orders — Claw & Soul",
};

export default function UserOrdersPage() {
  return (
    <Container className="py-10">
      <DashboardTabs />
      <div className="mt-8 rounded-xl bg-white p-8">
        <h1 className="font-display text-2xl font-black text-text-main">
          My Orders
        </h1>
        <p className="mt-2 text-text-muted">
          Your full order history will live here. Coming soon.
        </p>
      </div>
    </Container>
  );
}
