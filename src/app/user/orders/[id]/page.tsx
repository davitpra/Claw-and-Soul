import { Container } from "@/shared/ui/Container";
import { OrderDetail } from "@/widgets/user-dashboard/ui/OrderDetail";

export const metadata = {
  title: "Order details — Claw & Soul",
};

export default async function UserOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Container className="pb-10">
      <OrderDetail id={id} />
    </Container>
  );
}
