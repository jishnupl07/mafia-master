import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const MafiaModerator = lazy(() => import("@/components/MafiaModerator"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mafia Moderator — Secret Role Reveal" },
      {
        name: "description",
        content:
          "A premium moderator console for the party game Mafia/Werewolf. Assign and secretly reveal player roles with smooth animations.",
      },
      { property: "og:title", content: "Mafia Moderator" },
      {
        property: "og:description",
        content: "Secretly assign and reveal roles for Mafia/Werewolf party games.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-[#0F172A]" />}>
      <MafiaModerator />
    </Suspense>
  );
}
