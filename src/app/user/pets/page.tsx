import { redirect } from "next/navigation";
import { Container } from "@/shared/ui/Container";
import { DashboardTabs } from "@/widgets/user-dashboard/ui/DashboardTabs";
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
    <Container className="py-10">
      <DashboardTabs />
      <div className="mt-8">
        <AllPets initialPets={result.data} />
      </div>
    </Container>
  );
}
