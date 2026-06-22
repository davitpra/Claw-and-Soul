import { redirect } from "next/navigation";
import { Container } from "@/shared/ui/Container";
import { AllPets } from "@/widgets/user-dashboard/ui/AllPets";
import { getPetsServer } from "@/lib/auth/server-fetch";

export const metadata = {
  title: "My Pets — Claw & Soul",
};

export default async function UserPetsPage() {
  const result = await getPetsServer();

  if (result.unauthorized) {
    redirect("/login");
  }

  return (
    <Container className="pb-10">
      <AllPets initialPets={result.data} />
    </Container>
  );
}
