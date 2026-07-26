import { Container } from "@/shared/ui/Container";
import { AllPbn } from "@/widgets/user-dashboard/ui/AllPbn";

export const metadata = {
  title: "My Paint by Numbers — Claw & Soul",
};

export default function UserPbnPage() {
  return (
    <Container className="pb-10">
      <AllPbn />
    </Container>
  );
}
