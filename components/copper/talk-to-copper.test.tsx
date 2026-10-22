import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  REPLY_DELAY_MS,
  TalkToCopper,
} from "@/components/copper/talk-to-copper";

const promptButton = (name: RegExp) => screen.getByRole("button", { name });
const log = () => screen.getByRole("log", { name: "Conversation with Copper" });
const waitForReply = () =>
  act(() => {
    vi.advanceTimersByTime(REPLY_DELAY_MS);
  });

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  Reflect.deleteProperty(window, "matchMedia");
});

describe("TalkToCopper", () => {
  it("has an h2 and a clear demo label", () => {
    render(<TalkToCopper />);
    expect(
      screen.getByRole("heading", { level: 2, name: "Talk to Copper" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Demo · simulated responses")).toBeInTheDocument();
  });

  it("thinks for about 700ms with buttons disabled, then says where the dog is", () => {
    render(<TalkToCopper />);
    fireEvent.click(promptButton(/check the backyard/i));

    expect(screen.getByRole("status")).toBeInTheDocument();
    for (const name of [/backyard/i, /order my usual/i, /turn the ac/i]) {
      expect(promptButton(name)).toBeDisabled();
    }
    expect(log()).not.toHaveTextContent(/napping/);

    waitForReply();
    expect(log()).toHaveTextContent("The dog is napping on the patio.");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(promptButton(/turn the ac/i)).toBeEnabled();
  });

  it("asks about the usual order, focuses Yes, and confirms the order", () => {
    render(<TalkToCopper />);
    fireEvent.click(promptButton(/order my usual/i));
    waitForReply();

    expect(log()).toHaveTextContent("Want your usual from Saguaro Burger?");
    const yes = screen.getByRole("button", { name: "Yes" });
    expect(yes).toHaveFocus();
    expect(promptButton(/backyard/i)).toBeDisabled();

    fireEvent.click(yes);
    expect(screen.queryByRole("button", { name: "Yes" })).toBeNull();
    expect(promptButton(/backyard/i)).toBeDisabled();
    waitForReply();
    expect(log()).toHaveTextContent(/on its way/);
  });

  it("says okay, never mind when the order is declined", () => {
    render(<TalkToCopper />);
    fireEvent.click(promptButton(/order my usual/i));
    waitForReply();
    fireEvent.click(screen.getByRole("button", { name: "No" }));
    waitForReply();
    expect(log()).toHaveTextContent("Okay, never mind.");
  });

  it("confirms the new AC temperature", () => {
    render(<TalkToCopper />);
    fireEvent.click(promptButton(/turn the ac/i));
    waitForReply();
    expect(log()).toHaveTextContent(/73°F/);
  });

  it("replies instantly when the user prefers reduced motion", () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true });
    render(<TalkToCopper />);
    fireEvent.click(promptButton(/check the backyard/i));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(log()).toHaveTextContent(/napping on the patio/);
  });

  it("starts over from a finished conversation", () => {
    render(<TalkToCopper />);
    fireEvent.click(promptButton(/turn the ac/i));
    waitForReply();
    fireEvent.click(screen.getByRole("button", { name: "Start over" }));
    expect(log()).toHaveTextContent("Pick a prompt to hear what Copper says.");
    expect(screen.queryByRole("button", { name: "Start over" })).toBeNull();
  });

  it("clears its pending reply when unmounted", () => {
    const { unmount } = render(<TalkToCopper />);
    fireEvent.click(promptButton(/check the backyard/i));
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("never mentions prices or says Copper never records", () => {
    const { container } = render(<TalkToCopper />);
    for (const name of [/backyard/i, /order my usual/i]) {
      fireEvent.click(promptButton(name));
      waitForReply();
    }
    fireEvent.click(screen.getByRole("button", { name: "Yes" }));
    waitForReply();
    const text = container.textContent ?? "";
    expect(text).not.toMatch(/\$/);
    expect(text).not.toMatch(/never\s+record/i);
  });
});
