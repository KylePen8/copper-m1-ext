import Image from "next/image";
import { CheckIcon, XIcon } from "lucide-react";
import { SiteFooter } from "@/components/copper/site-footer";
import { SiteHeader } from "@/components/copper/site-header";
import { TalkToCopper } from "@/components/copper/talk-to-copper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatMemory,
  formatNotesHours,
  formatUsd,
  getPlans,
  getPrivacySummary,
  getProducts,
  type Plan,
  type Product,
} from "@/lib/copper/catalog";
import { cn } from "@/lib/utils";

const TAGLINE = "From raw ideas to refined answers.";

// Alt text and captions for the lifestyle photos, keyed by catalog path.
const SHOWCASE_COPY: Record<string, { alt: string; caption: string }> = {
  "/assets/lifestyle/copper-home-desert-light.png": {
    alt: "Copper Home speaker on a stone kitchen counter beside a window, with a desert sunset and saguaro cacti outside",
    caption:
      "Copper Home keeps the kitchen counter company while the sun sets over the desert.",
  },
  "/assets/lifestyle/copper-notes-stone-desk.png": {
    alt: "Copper Notes recorder standing on a stone desk next to its charging puck, with a sunlit desert window behind",
    caption: "Copper Notes on the desk, ready for the next meeting.",
  },
  "/assets/lifestyle/copper-notes-golden-hour.png": {
    alt: "A man in a linen shirt writing in a notebook, with a Copper Notes recorder clipped to his shirt pocket in warm golden light",
    caption: "Clipped to a pocket, Copper Notes listens so you can focus.",
  },
};

const CUTOUT_ALT: Record<string, string> = {
  "copper-home":
    "Copper Home, a round copper-orange fabric smart speaker with a circular clock display on top",
  "copper-notes":
    "Copper Notes, a square brushed-copper clip-on recorder with a glowing amber ring around its button",
};

const container = "mx-auto w-full max-w-6xl px-4";
const sectionSpacing = "scroll-mt-28 py-16 sm:scroll-mt-16 md:py-24";

export default function Home() {
  const products = getProducts();
  const plans = getPlans();
  const privacy = getPrivacySummary();

  const home = products.find((p) => p.id === "copper-home")!;
  const notes = products.find((p) => p.id === "copper-notes")!;
  const freePlan = plans.find((p) => p.id === "free")!;
  const plusPlan = plans.find((p) => p.id === "copper-plus")!;

  const showcase = products.flatMap((product) =>
    product.lifestyle.map((src) => ({ product, src })),
  );

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section
          id="top"
          data-testid="hero"
          className={cn("bg-secondary", sectionSpacing)}
        >
          <div
            className={cn(
              container,
              "grid items-center gap-10 lg:grid-cols-[5fr_7fr]",
            )}
          >
            <div className="flex flex-col items-start gap-6">
              <h1 className="text-4xl font-bold sm:text-5xl lg:text-6xl">
                Meet {home.name} and {notes.name}.
              </h1>
              <p className="text-primary text-2xl font-semibold">{TAGLINE}</p>
              <p className="text-muted-foreground max-w-prose text-lg">
                An AI smart speaker for your home and an AI clip-on recorder for
                your meetings and lectures.
              </p>
              <Button asChild size="lg" className="h-11 px-6 text-base">
                <a href="#products">See products</a>
              </Button>
            </div>
            <div className="grid grid-cols-2 items-center gap-2 sm:gap-6">
              {[home, notes].map((product) => (
                <Image
                  key={product.id}
                  src={product.cutout}
                  alt={CUTOUT_ALT[product.id]}
                  width={1254}
                  height={1254}
                  sizes="(min-width: 1280px) 340px, (min-width: 1024px) 28vw, 45vw"
                  priority
                  className="h-auto w-full"
                />
              ))}
            </div>
          </div>
        </section>

        <section
          id="products"
          data-testid="products"
          className={sectionSpacing}
        >
          <div className={container}>
            <h2 className="mb-10 text-3xl font-bold sm:text-4xl">
              Meet the products
            </h2>
            <div className="grid gap-8 md:grid-cols-2">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        <section
          id="talk"
          data-testid="talk-to-copper"
          className={cn("bg-secondary/50", sectionSpacing)}
        >
          <div className={container}>
            <TalkToCopper />
          </div>
        </section>

        <section
          id="showcase"
          data-testid="showcase"
          className={cn("bg-muted", sectionSpacing)}
        >
          <div className={cn(container, "flex flex-col gap-12 md:gap-16")}>
            <h2 className="text-3xl font-bold sm:text-4xl">
              Made for Arizona living
            </h2>
            {showcase.map(({ product, src }, index) => {
              const copy = SHOWCASE_COPY[src] ?? {
                alt: `${product.name} in an Arizona setting`,
                caption: `${product.name} at home in the desert.`,
              };
              return (
                <div
                  key={src}
                  className="grid items-center gap-6 md:grid-cols-2 md:gap-10"
                >
                  <div
                    className={cn(
                      "relative aspect-[16/10] overflow-hidden rounded-xl",
                      index % 2 === 1 && "md:order-last",
                    )}
                  >
                    <Image
                      src={src}
                      alt={copy.alt}
                      fill
                      sizes="(min-width: 1152px) 560px, (min-width: 768px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="text-primary text-sm font-semibold uppercase tracking-wide">
                      {product.name}
                    </p>
                    <p className="text-xl font-medium sm:text-2xl">
                      {copy.caption}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section
          id="plus"
          data-testid="plus-pricing"
          className={sectionSpacing}
        >
          <div className={container}>
            <h2 className="mb-10 text-3xl font-bold sm:text-4xl">
              Free or Copper Plus
            </h2>
            <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
              <PlanCard plan={freePlan} />
              <PlanCard plan={plusPlan} highlighted />
            </div>
          </div>
        </section>

        <section
          id="privacy"
          data-testid="privacy-summary"
          className={cn("bg-accent/10", sectionSpacing)}
        >
          <div
            className={cn(
              container,
              "grid items-center gap-10 md:grid-cols-[1fr_auto]",
            )}
          >
            <div className="flex flex-col gap-6">
              <h2 className="text-3xl font-bold sm:text-4xl">
                Privacy, in plain language
              </h2>
              <p className="text-muted-foreground text-lg">
                Here is how Copper handles your recordings under our{" "}
                {privacy.policy} privacy policy. The wake word is &quot;
                {privacy.wakeWord}.&quot;
              </p>
              <ul className="border-accent flex flex-col gap-4 border-l-4 pl-5 text-base sm:text-lg">
                {privacy.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
            <Image
              src="/assets/brand/copper-mascot.png"
              alt="Copper, the robot mascot, waving and holding a checklist while wearing a yellow hard hat"
              width={1254}
              height={1254}
              sizes="240px"
              className="mx-auto h-auto w-48 md:w-60"
            />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <Card data-testid="product-card" data-product={product.id}>
      <CardContent className="flex flex-col gap-6">
        <div className="bg-secondary rounded-lg p-4">
          <Image
            src={product.cutout}
            alt={CUTOUT_ALT[product.id]}
            width={1254}
            height={1254}
            sizes="(min-width: 1152px) 360px, (min-width: 768px) 40vw, 80vw"
            className="mx-auto h-auto w-full max-w-sm"
          />
        </div>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h3 className="text-2xl font-bold">{product.name}</h3>
            <p className="text-muted-foreground">{product.type}</p>
          </div>
          <p className="text-primary text-3xl font-bold">
            {formatUsd(product.priceUsd)}
          </p>
        </div>
        <ul className="flex flex-col gap-3">
          {product.features.map((feature) => (
            <li key={feature.name}>
              <span className="font-semibold">{feature.name}.</span>{" "}
              <span className="text-muted-foreground">
                {feature.description}
              </span>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-2">
          {product.colors.map((color) => (
            <Badge key={color} variant="outline">
              {color}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function PlanCard({
  plan,
  highlighted = false,
}: {
  plan: Plan;
  highlighted?: boolean;
}) {
  const rows = [
    { label: "Monthly price", value: `${formatUsd(plan.monthlyUsd)}/month` },
    { label: "Annual price", value: `${formatUsd(plan.annualUsd)}/year` },
    { label: "Memory kept", value: formatMemory(plan.memoryDays) },
    {
      label: "Notes recording",
      value: formatNotesHours(plan.notesHoursPerMonth),
    },
  ];
  return (
    <Card className={cn(highlighted && "ring-primary ring-2")}>
      <CardHeader>
        <CardTitle
          className={cn("text-2xl font-bold", highlighted && "text-primary")}
        >
          {plan.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="flex flex-col divide-y">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex items-baseline justify-between gap-4 py-3"
            >
              <dt className="text-muted-foreground">{row.label}</dt>
              <dd className="text-right font-semibold">{row.value}</dd>
            </div>
          ))}
          <div className="flex items-baseline justify-between gap-4 py-3">
            <dt className="text-muted-foreground">Refined answers</dt>
            <dd className="flex items-center gap-1 text-right font-semibold">
              {plan.refinedAnswers ? (
                <CheckIcon className="text-primary size-4" aria-hidden />
              ) : (
                <XIcon className="text-muted-foreground size-4" aria-hidden />
              )}
              {plan.refinedAnswers ? "Included" : "Not included"}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
