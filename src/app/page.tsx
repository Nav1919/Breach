"use client";

import { Hero } from "@/components/blocks/hero";
import { Icons } from "@/components/ui/icons";
// import { ProjectStatusCard } from "@/components/ui/expandable-card";

function Home() {
  return (
    <Hero
      content={{
        title: "Build beautiful apps",
        titleHighlight: "with ease",
        description:
          "A modern component library with beautiful defaults and endless customization options. Start building your next project faster.",
        primaryAction: {
          href: "/docs/getting-started",
          text: "Get Started",
          icon: <Icons.logo className="h-4 w-4" />,
        },
        secondaryAction: {
          href: "/components",
          text: "Browse Components",
          icon: <Icons.component className="h-4 w-4" />,
        },
      }}
    />
  );
}

export default Home;
