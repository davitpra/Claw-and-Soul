import { Container } from "@/shared/ui/Container";
import { DashboardSidebar } from "@/widgets/user-dashboard/ui/DashboardSidebar";
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
    <Container className="py-10">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
        <DashboardSidebar />
        <PetDetail petId={id} />
      </div>
    </Container>
  );
}
