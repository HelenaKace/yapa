// YAPA seed catalog — Albania-first, internationally architected.
// Prices stored in ALL (Albanian Lek), the platform's base unit.
// ~1 EUR ≈ 100 ALL (see lib/format.js for live-ish conversion table).

export const CATEGORIES = [
  { id: "fitness", emoji: "💪", color: "perx.orange", en: "Fitness", sq: "Fitnes" },
  { id: "wellness", emoji: "🧘", color: "perx.sky", en: "Wellness", sq: "Mirëqenie" },
  { id: "food", emoji: "🍽️", color: "perx.pink", en: "Food & Dining", sq: "Ushqim" },
  { id: "travel", emoji: "✈️", color: "perx.blue", en: "Travel", sq: "Udhëtim" },
  { id: "learning", emoji: "📚", color: "perx.purple", en: "Learning", sq: "Mësim" },
  { id: "health", emoji: "🩺", color: "perx.sky", en: "Health", sq: "Shëndet" },
  { id: "telecom", emoji: "📱", color: "perx.blue", en: "Telecom", sq: "Telekom" },
  { id: "retail", emoji: "🛒", color: "perx.yellow", en: "Retail", sq: "Pazar" },
  { id: "transport", emoji: "🚗", color: "perx.coral", en: "Transport", sq: "Transport" },
];

export const PROVIDERS = [
  { id: "p_gymflow", name: "GymFlow Tirana", category: "fitness", city: "Tirana", emoji: "🏋️", blurb: "Modern gyms in Blloku & Komuna e Parisit." },
  { id: "p_purepilates", name: "Pure Pilates", category: "wellness", city: "Tirana", emoji: "🤸", logo: "/logos/purepilates.png", blurb: "Reformer pilates & mobility studio." },
  { id: "p_skyspa", name: "Sky Spa Tirana", category: "wellness", city: "Tirana", emoji: "💆", blurb: "Rooftop spa, sauna & massage." },
  { id: "p_mullixhiu", name: "Mullixhiu", category: "food", city: "Tirana", emoji: "🍲", logo: "/logos/mullixhiu.png", blurb: "Iconic Albanian farm-to-table dining." },
  { id: "p_komiteti", name: "Komiteti Kafe-Muzeum", category: "food", city: "Tirana", emoji: "☕", blurb: "Retro café, raki & local plates." },
  { id: "p_wolt", name: "Wolt Albania", category: "food", city: "Tirana", emoji: "🛵", logo: "/logos/wolt.png", blurb: "Food delivery credit, citywide." },
  { id: "p_saranda", name: "Saranda Escapes", category: "travel", city: "Sarandë", emoji: "🏖️", blurb: "Riviera weekends & island day-trips." },
  { id: "p_alps", name: "Albanian Alps Co.", category: "travel", city: "Theth", emoji: "🏔️", blurb: "Guided hikes in Theth & Valbona." },
  { id: "p_coursera", name: "SkillUp Academy", category: "learning", city: "Online", emoji: "🎓", blurb: "Online courses & certifications." },
  { id: "p_british", name: "British Council Tirana", category: "learning", city: "Tirana", emoji: "🇬🇧", logo: "/logos/britishcouncil.png", blurb: "Language courses & IELTS prep." },
  { id: "p_hygeia", name: "Hygeia Hospital", category: "health", city: "Tirana", emoji: "🏥", blurb: "Check-ups & specialist visits." },
  { id: "p_smile", name: "Smile Dental Studio", category: "health", city: "Tirana", emoji: "🦷", blurb: "Dental care & whitening." },
  { id: "p_vodafone", name: "Vodafone Albania", category: "telecom", city: "Nationwide", emoji: "📶", logo: "/logos/vodafone.png", blurb: "Mobile data & device deals." },
  { id: "p_spar", name: "SPAR Albania", category: "retail", city: "Nationwide", emoji: "🛒", logo: "/logos/spar.png", blurb: "Groceries & everyday essentials." },
  { id: "p_bolt", name: "Bolt", category: "transport", city: "Tirana", emoji: "🚕", blurb: "Rides & scooters across the city." },
];

// Each offer: base price in ALL, category, provider, tags drive AI recommendations.
export const OFFERS = [
  { id: "o_gym_month", providerId: "p_gymflow", title: "Unlimited Monthly Pass", priceALL: 4500, category: "fitness", tags: ["active", "routine", "strength"], desc: "All-access gym + classes for one month.", popular: true },
  { id: "o_gym_pt", providerId: "p_gymflow", title: "5x Personal Training", priceALL: 9000, category: "fitness", tags: ["active", "coaching", "goals"], desc: "Five 1:1 sessions with a coach." },
  { id: "o_pilates_5", providerId: "p_purepilates", title: "5-Class Reformer Pack", priceALL: 6000, category: "wellness", tags: ["relax", "mobility", "active"], desc: "Five reformer pilates classes.", popular: true },
  { id: "o_spa_day", providerId: "p_skyspa", title: "Rooftop Spa Day", priceALL: 4000, category: "wellness", tags: ["relax", "self-care", "treat"], desc: "Sauna, pool & 30-min massage.", popular: true },
  { id: "o_massage", providerId: "p_skyspa", title: "60-min Deep Tissue Massage", priceALL: 3000, category: "wellness", tags: ["relax", "recovery", "self-care"], desc: "Unwind after a long sprint." },
  { id: "o_mull_dinner", providerId: "p_mullixhiu", title: "Tasting Dinner for Two", priceALL: 7000, category: "food", tags: ["treat", "social", "local"], desc: "Seasonal Albanian tasting menu." },
  { id: "o_komiteti", providerId: "p_komiteti", title: "Brunch & Raki Voucher", priceALL: 2000, category: "food", tags: ["social", "local", "casual"], desc: "Weekend brunch for two." },
  { id: "o_wolt_credit", providerId: "p_wolt", title: "5,000 ALL Wolt Credit", priceALL: 5000, category: "food", tags: ["convenient", "everyday", "treat"], desc: "Lunch delivered to the office.", popular: true },
  { id: "o_saranda_wk", providerId: "p_saranda", title: "Riviera Weekend (2 nights)", priceALL: 18000, category: "travel", tags: ["escape", "sea", "treat", "social"], desc: "Boutique stay in Sarandë.", popular: true },
  { id: "o_ksamil_trip", providerId: "p_saranda", title: "Ksamil Island Day-Trip", priceALL: 5500, category: "travel", tags: ["escape", "sea", "social"], desc: "Boat day-trip to the islands." },
  { id: "o_theth_hike", providerId: "p_alps", title: "Theth Guided Hike", priceALL: 8000, category: "travel", tags: ["active", "nature", "escape", "adventure"], desc: "Full-day guided mountain hike." },
  { id: "o_skillup", providerId: "p_coursera", title: "Annual Learning Pass", priceALL: 12000, category: "learning", tags: ["growth", "career", "skills"], desc: "Unlimited courses for a year.", popular: true },
  { id: "o_skillup_ai", providerId: "p_coursera", title: "AI & Data Bootcamp", priceALL: 9000, category: "learning", tags: ["growth", "career", "tech"], desc: "8-week applied AI track." },
  { id: "o_english", providerId: "p_british", title: "Business English Course", priceALL: 8000, category: "learning", tags: ["growth", "career", "language"], desc: "10-week evening course." },
  { id: "o_checkup", providerId: "p_hygeia", title: "Full Health Check-up", priceALL: 7500, category: "health", tags: ["health", "prevention", "self-care"], desc: "Bloodwork + GP consultation.", popular: true },
  { id: "o_eyes", providerId: "p_hygeia", title: "Eye & Vision Exam", priceALL: 2500, category: "health", tags: ["health", "screen", "prevention"], desc: "For long days at the screen." },
  { id: "o_dental", providerId: "p_smile", title: "Cleaning + Whitening", priceALL: 4000, category: "health", tags: ["health", "self-care", "treat"], desc: "Dental cleaning and whitening." },
  { id: "o_vodafone_data", providerId: "p_vodafone", title: "Unlimited Data — 3 Months", priceALL: 4500, category: "telecom", tags: ["everyday", "connectivity", "remote"], desc: "Stay connected anywhere." },
  { id: "o_spar_voucher", providerId: "p_spar", title: "5,000 ALL Grocery Voucher", priceALL: 5000, category: "retail", tags: ["everyday", "family", "essentials"], desc: "Weekly groceries covered.", popular: true },
  { id: "o_bolt_credit", providerId: "p_bolt", title: "4,000 ALL Ride Credit", priceALL: 4000, category: "transport", tags: ["everyday", "commute", "convenient"], desc: "Commute or night out, sorted." },
];

// Packages span MULTIPLE providers — the core "smart bundle" experience.
export const PACKAGES = [
  {
    id: "pkg_reset",
    title: "Reset & Recharge",
    emoji: "🧖",
    theme: "wellness",
    blurb: "A full self-care reset across three studios.",
    offerIds: ["o_spa_day", "o_pilates_5", "o_massage"],
    seasonal: false,
  },
  {
    id: "pkg_foodie",
    title: "Tirana Foodie",
    emoji: "🍷",
    theme: "food",
    blurb: "Eat your way through the city, on the company.",
    offerIds: ["o_mull_dinner", "o_komiteti", "o_wolt_credit"],
    seasonal: false,
  },
  {
    id: "pkg_riviera",
    title: "Riviera Escape",
    emoji: "🌊",
    theme: "travel",
    blurb: "Sea, sun and a ride to the airport.",
    offerIds: ["o_saranda_wk", "o_ksamil_trip", "o_bolt_credit"],
    seasonal: true,
    seasonalLabel: "Summer drop",
  },
  {
    id: "pkg_levelup",
    title: "Level Up",
    emoji: "🚀",
    theme: "learning",
    blurb: "Grow your skills and your network.",
    offerIds: ["o_skillup", "o_skillup_ai", "o_english"],
    seasonal: false,
  },
  {
    id: "pkg_family",
    title: "Family First",
    emoji: "👨‍👩‍👧",
    theme: "family",
    blurb: "Look after the people who matter.",
    offerIds: ["o_spar_voucher", "o_checkup", "o_dental"],
    seasonal: false,
  },
];

// The demo employer.
export const EMPLOYER = {
  id: "emp_technest",
  name: "TechNest Tirana",
  emoji: "🛰️",
  budgetPerEmployeeALL: 30000, // quarterly welfare budget
  approverName: "Anila Kola",
  approverRole: "People Ops Lead",
};

// Employees of the demo employer. The first is the "current user".
export const EMPLOYEES = [
  { id: "u_erisa", name: "Erisa Hoxha", role: "Product Designer", emoji: "🎨", interests: ["wellness", "food", "travel"], joinedDays: 412 },
  { id: "u_bledi", name: "Bledi Marku", role: "Backend Engineer", emoji: "🧑‍💻", interests: ["learning", "fitness", "telecom"], joinedDays: 188 },
  { id: "u_klea", name: "Klea Dervishi", role: "Data Analyst", emoji: "📊", interests: ["learning", "health", "retail"], joinedDays: 95 },
  { id: "u_redon", name: "Redon Shehu", role: "Sales Lead", emoji: "🤝", interests: ["travel", "food", "transport"], joinedDays: 640 },
];

export const CURRENT_USER_ID = "u_erisa";

// ---- lookups ----
const byId = (arr) => Object.fromEntries(arr.map((x) => [x.id, x]));
export const PROVIDER_MAP = byId(PROVIDERS);
export const CATEGORY_MAP = byId(CATEGORIES);
export const EMPLOYEE_MAP = byId(EMPLOYEES);
