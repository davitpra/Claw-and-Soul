import { Container } from "@/shared/ui/Container";
import { DashboardSidebar } from "@/widgets/user-dashboard/ui/DashboardSidebar";

export const metadata = {
  title: "My Orders — Claw & Soul",
};

export default function UserOrdersPage() {
  return (
    <Container className="py-10">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
        <DashboardSidebar />
        <div className="rounded-xl bg-white p-8">
          <h1 className="font-display text-2xl font-bold text-text-main">
            My Orders
          </h1>
          <p className="mt-2 text-text-muted">
            Your full order history will live here. Coming soon.
          </p>
        </div>
      </div>
    </Container>
  );
}
