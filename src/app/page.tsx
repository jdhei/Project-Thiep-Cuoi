import { Nav } from "@/components/landing/Nav";
import { Interactions } from "@/components/ui/Interactions";
import {
  LandingHero,
  Features,
  Steps,
  Templates,
  Pricing,
  CtaBand,
  Footer,
} from "@/components/landing/sections";

export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
        <LandingHero />
        <Features />
        <Steps />
        <Templates />
        <Pricing />
        <CtaBand />
      </main>
      <Footer />
      <Interactions />
    </>
  );
}
