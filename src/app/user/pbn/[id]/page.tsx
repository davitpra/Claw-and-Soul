import { Container } from "@/shared/ui/Container";
import { PbnDetail } from "@/widgets/user-dashboard/ui/PbnDetail";

export const metadata = {
  title: "Paint by Numbers — Claw & Soul",
};

export default async function UserPbnDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Container className="pb-10">
      <PbnDetail id={id} />
    </Container>
  );
}
