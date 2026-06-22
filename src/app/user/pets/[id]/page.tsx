import { Container } from "@/shared/ui/Container";
import { DashboardTabs } from "@/widgets/user-dashboard/ui/DashboardTabs";
import { PetDetail } from "@/widgets/user-dashboard/ui/PetDetail";

export const metadata = {
  title: "Pet — Claw & Soul",
};

export default async function UserPetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Container>
      <PetDetail petId={id} />
    </Container>
  );
}
