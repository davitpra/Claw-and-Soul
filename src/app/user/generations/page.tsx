import { Container } from "@/shared/ui/Container";

export const metadata = {
  title: "My Artworks — Claw & Soul",
};

export default function UserGenerationsPage() {
  return (
    <Container className="pb-10">
      <div className="rounded-xl bg-white p-8">
        <h1 className="font-display text-2xl font-black text-text-main">
          My Artworks
        </h1>
        <p className="mt-2 text-text-muted">
          All your generated pet artworks will appear here. Coming soon.
        </p>
      </div>
    </Container>
  );
}
