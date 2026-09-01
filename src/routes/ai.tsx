import React, { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, Send, Bot, User, ArrowRight } from "lucide-react";

import { Eyebrow } from "@/components/fleet/brand";
import { SiteFooter, SiteHeader } from "@/components/fleet/site-chrome";
import { VehicleCard } from "@/components/fleet/vehicle-card";
import { Button } from "@/components/ui/button";
import { aiService, vehicleService } from "@/lib/services";
import type { AIMessage } from "@/types";

export const Route = createFileRoute("/ai")({
  head: () => ({
    meta: [
      { title: "AI Fleet Assistant — FleetFlow Intelligence" },
      {
        name: "description",
        content: "Search FleetFlow's live vehicle inventory using natural language conversation and instant recommendation matching.",
      },
    ],
  }),
  component: AIPage,
});

const PROMPT_SUGGESTIONS = [
  "Find me an automatic SUV for 4 people under ₹3000/day",
  "Show me electric vehicles available in Indiranagar",
  "What is my next active booking?",
  "Which vehicles have the highest customer rating?",
];

function AIPage() {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: "m1",
      role: "assistant",
      content:
        "Hello! I am FleetFlow Intelligence. Describe your journey, budget, seat capacity, or preferred fuel type, and I will recommend matched vehicles directly from our live operational database.",
      actions: [{ label: "Explore entire fleet", to: "/explore" }],
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: allVehicles } = useQuery({
    queryKey: ["vehicles", "all-ai"],
    queryFn: () => vehicleService.list({}),
  });

  const handleSend = async (textToSend?: string) => {
    const queryText = textToSend || inputPrompt;
    if (!queryText.trim() || loading) return;

    const userMsg: AIMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: queryText,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputPrompt("");
    setLoading(true);

    const response = await aiService.ask(queryText);
    setMessages((prev) => [...prev, response]);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteHeader />

      <main className="flex-1 mx-auto max-w-5xl w-full px-4 sm:px-8 py-10 flex flex-col space-y-6">
        {/* Header */}
        <div className="border-b border-border/80 pb-6 flex items-center justify-between">
          <div>
            <Eyebrow>FLEETFLOW INTELLIGENCE</Eyebrow>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" /> AI Fleet Concierge
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Natural language fleet search & instant inventory matching.
            </p>
          </div>
        </div>

        {/* Suggestion Chips */}
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Suggested Prompts
          </div>
          <div className="flex flex-wrap gap-2">
            {PROMPT_SUGGESTIONS.map((sug) => (
              <button
                key={sug}
                onClick={() => handleSend(sug)}
                className="px-3 py-1.5 rounded-lg bg-surface border border-border/80 hover:border-primary/50 text-xs font-medium text-foreground transition-all hover:scale-[1.02]"
              >
                💡 {sug}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 bg-surface border border-border rounded-2xl p-4 sm:p-6 space-y-6 min-h-96 overflow-y-auto shadow-xl">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 max-w-3xl animate-rise ${
                m.role === "user" ? "ml-auto flex-row-reverse" : ""
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                  m.role === "assistant"
                    ? "bg-primary/20 text-primary border-primary/30"
                    : "bg-surface-2 text-foreground border-border"
                }`}
              >
                {m.role === "assistant" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              <div className="space-y-3">
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground font-medium rounded-tr-none"
                      : "bg-surface-2 border border-border text-foreground rounded-tl-none"
                  }`}
                >
                  {m.content}
                </div>

                {m.vehicleIds && m.vehicleIds.length > 0 && allVehicles && (
                  <div className="grid gap-4 sm:grid-cols-2 pt-2">
                    {allVehicles
                      .filter((v) => m.vehicleIds?.includes(v.id))
                      .map((veh) => (
                        <div key={veh.id} className="scale-95 origin-top-left">
                          <VehicleCard vehicle={veh} />
                        </div>
                      ))}
                  </div>
                )}

                {m.actions && m.actions.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {m.actions.map((act) => (
                      <Button key={act.label} asChild size="sm" variant="outline" className="gap-1.5 text-xs">
                        <Link to={act.to as any || "/explore"}>
                          {act.label} <ArrowRight className="w-3 h-3" />
                        </Link>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3 text-xs text-muted-foreground animate-pulse">
              <Bot className="w-4 h-4 text-primary" />
              <span>FleetFlow AI is searching inventory database...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Ask AI e.g. 'Show me automatic SUVs under ₹4000/day'..."
            className="flex-1 rounded-xl bg-surface border border-border px-4 py-3 text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary shadow-xs"
          />
          <Button type="submit" disabled={loading || !inputPrompt.trim()} className="gap-2 px-5">
            <span>Send</span> <Send className="w-4 h-4" />
          </Button>
        </form>
      </main>

      <SiteFooter />
    </div>
  );
}
