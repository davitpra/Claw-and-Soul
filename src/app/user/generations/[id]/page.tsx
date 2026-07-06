import { Container } from "@/shared/ui/Container";
import { GenerationDetail } from "@/widgets/user-dashboard/ui/GenerationDetail";

export const metadata = {
  title: "Artwork — Claw & Soul",
};

export default async function UserGenerationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Container className="pb-10">
      <GenerationDetail id={id} />
    </Container>
  );
}
