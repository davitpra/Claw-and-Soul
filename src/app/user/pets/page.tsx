import { redirect } from "next/navigation";
import { Container } from "@/shared/ui/Container";
import { DashboardSidebar } from "@/widgets/user-dashboard/ui/DashboardSidebar";
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
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
        <DashboardSidebar />
        <AllPets initialPets={result.data} />
      </div>
    </Container>
  );
}
