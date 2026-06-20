export const THEMES = [
  {
    id: "yapa",
    name: "YAPA",
    tagline: "Pastel & playful",
    swatch: ["#F2683C", "#EC6F9E", "#2DB390"],
    copy: {
      heroLead: "The perks employees",
      heroEmph: "actually want.",
      heroSub:
        "A benefits marketplace people open every week — not once a quarter. Your company funds it, you just pick what you love.",
      ctaPrimary: "Get started — it's 2 min",
      ctaSecondary: "Skip to live demo",
      howTitle: "How YAPA works",
      steps: [
        { t: "Pick what you love", d: "Browse a marketplace of local deals and AI-built bundles. Add them to a selection." },
        { t: "Your employer approves", d: "One tap funds it. The money never passes through your hands." },
        { t: "Enjoy — we pay providers", d: "Payment routes directly to each gym, clinic, or travel agency. Done." },
      ],
      aiQuote: "“Find me something relaxing under 5,000 L.”",
      aiSub: "Just talk to YAPA. It understands your intent, respects your budget, and bundles offers from several providers into one perfect package.",
      aiCta: "Try the concierge",
      providersKicker: "Local providers, ready to go",
      footerTitle: "Ready to actually enjoy your benefits?",
      footerCta: "Create your free account",
      heroSubApp: "Your company has set aside benefits made for you. Spend them on what you actually love.",
      ctaConcierge: "Talk to the concierge",
      ctaBrowse: "Browse the marketplace",
      conciergeTitle: "YAPA Concierge",
      conciergeSub: "Your benefits buddy",
      conciergeEmpty: "What are you in the mood for?",
      suggestions: [
        "Find me something relaxing under 5,000 L",
        "I'm burnt out and need a reset",
        "Plan a fun weekend by the sea",
        "Help me grow my career this quarter",
      ],
      secPicked: { t: "Picked for you", sub: "Personalized by AI from your interests & budget" },
      secTrending: { t: "Trending this week", sub: "What your colleagues are loving" },
      secSeasonal: { t: "Seasonal drops", sub: "Limited-time — gone when summer's gone" },
    },
  },
];

export const THEME_MAP = Object.fromEntries(THEMES.map((t) => [t.id, t]));
export const DEFAULT_THEME = "perx";
export function themeCopy(id) {
  return (THEME_MAP[id] || THEME_MAP[DEFAULT_THEME]).copy;
}
