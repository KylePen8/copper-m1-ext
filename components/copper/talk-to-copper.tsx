"use client";

import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

// A scripted "Talk to Copper" demo. Every reply is a fixed string below: there
// are no AI or API calls.

type Phase = "idle" | "thinking" | "awaiting-choice" | "done";
type Message = { from: "you" | "copper"; text: string };
type Reply = { text: string; next: "awaiting-choice" | "done" };

export const REPLY_DELAY_MS = 700;

export const PROMPTS: { prompt: string; reply: Reply }[] = [
  {
    prompt: "Hey Copper, check the backyard for the dog",
    reply: {
      text: "I checked the backyard. The dog is napping on the patio.",
      next: "done",
    },
  },
  {
    prompt: "Hey Copper, order my usual",
    reply: {
      text: "Want your usual from Saguaro Burger?",
      next: "awaiting-choice",
    },
  },
  {
    prompt: "Hey Copper, turn the AC down 5 degrees",
    reply: {
      text: "Done. The AC is now set to 73°F, 5 degrees cooler.",
      next: "done",
    },
  },
];

const ORDER_CONFIRMED: Reply = {
  text: "Ordered! Your usual from Saguaro Burger is on its way.",
  next: "done",
};
const ORDER_CANCELLED: Reply = { text: "Okay, never mind.", next: "done" };

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true
  );
}

export function TalkToCopper() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [messages, setMessages] = useState<Message[]>([]);
  const timeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const yesButton = useRef<HTMLButtonElement>(null);

  useEffect(() => () => clearTimeout(timeout.current), []);

  useEffect(() => {
    if (phase === "awaiting-choice") yesButton.current?.focus();
  }, [phase]);

  function respond(reply: Reply) {
    const finish = () => {
      setMessages((current) => [
        ...current,
        { from: "copper", text: reply.text },
      ]);
      setPhase(reply.next);
    };
    clearTimeout(timeout.current);
    if (prefersReducedMotion()) {
      finish();
    } else {
      setPhase("thinking");
      timeout.current = setTimeout(finish, REPLY_DELAY_MS);
    }
  }

  function ask(prompt: string, reply: Reply) {
    setMessages([{ from: "you", text: prompt }]);
    respond(reply);
  }

  function choose(answer: "Yes" | "No") {
    setMessages((current) => [...current, { from: "you", text: answer }]);
    respond(answer === "Yes" ? ORDER_CONFIRMED : ORDER_CANCELLED);
  }

  function startOver() {
    clearTimeout(timeout.current);
    setMessages([]);
    setPhase("idle");
  }

  const thinking = phase === "thinking";

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-start gap-3">
        <Badge variant="outline">Demo · simulated responses</Badge>
        <h2 className="text-3xl font-bold sm:text-4xl">Talk to Copper</h2>
        <p className="text-muted-foreground max-w-prose text-lg">
          Pick something to say and see how Copper answers. These replies are
          scripted for this page.
        </p>
      </div>
      <Card>
        <CardContent className="grid gap-6 lg:grid-cols-[2fr_3fr] lg:gap-10">
          <div className="flex flex-col gap-3">
            <p className="text-muted-foreground text-sm font-semibold uppercase tracking-wide">
              Try saying
            </p>
            {PROMPTS.map(({ prompt, reply }) => (
              <Button
                key={prompt}
                variant="outline"
                className="h-auto justify-start px-4 py-3 text-left whitespace-normal"
                disabled={thinking || phase === "awaiting-choice"}
                onClick={() => ask(prompt, reply)}
              >
                &ldquo;{prompt}&rdquo;
              </Button>
            ))}
          </div>
          <div className="flex flex-col gap-4">
            <div
              role="log"
              aria-live="polite"
              aria-label="Conversation with Copper"
              className="bg-muted/50 flex min-h-48 flex-col gap-3 rounded-lg p-4"
            >
              {messages.length === 0 && (
                <p className="text-muted-foreground m-auto text-center">
                  Pick a prompt to hear what Copper says.
                </p>
              )}
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex max-w-[85%] flex-col gap-1",
                    message.from === "you"
                      ? "items-end self-end"
                      : "items-start",
                  )}
                >
                  <span className="text-muted-foreground text-xs font-medium">
                    {message.from === "you" ? "You" : "Copper"}
                  </span>
                  <p
                    className={cn(
                      "rounded-2xl px-4 py-2",
                      message.from === "you"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-card text-card-foreground rounded-bl-sm border",
                    )}
                  >
                    {message.text}
                  </p>
                </div>
              ))}
              {thinking && (
                <p className="text-muted-foreground flex items-center gap-2 text-sm">
                  <Spinner />
                  Copper is thinking…
                </p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {phase === "awaiting-choice" && (
                <>
                  <Button ref={yesButton} onClick={() => choose("Yes")}>
                    Yes
                  </Button>
                  <Button variant="outline" onClick={() => choose("No")}>
                    No
                  </Button>
                </>
              )}
              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  className="ml-auto"
                  disabled={thinking}
                  onClick={startOver}
                >
                  Start over
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
