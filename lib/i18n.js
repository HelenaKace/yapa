// Lightweight i18n. English + Albanian (Shqip). Architected so adding a market
// = adding a column. UI reads strings via t(key, lang).
export const LANGS = [
  { code: "en", label: "EN", name: "English", flag: "🇬🇧" },
  { code: "sq", label: "SQ", name: "Shqip", flag: "🇦🇱" },
];

const STRINGS = {
  "nav.discover": { en: "Discover", sq: "Zbulo" },
  "nav.browse": { en: "Browse", sq: "Shfleto" },
  "nav.packages": { en: "Packages", sq: "Paketa" },
  "nav.concierge": { en: "Concierge", sq: "Asistenti" },
  "nav.mybenefits": { en: "My Benefits", sq: "Përfitimet" },
  "role.employee": { en: "Employee", sq: "Punonjës" },
  "role.employer": { en: "Employer", sq: "Punëdhënës" },
  "role.provider": { en: "Provider", sq: "Ofrues" },
  "budget.left": { en: "Budget left", sq: "Buxheti i mbetur" },
  "budget.of": { en: "of", sq: "nga" },
  "cta.add": { en: "Add", sq: "Shto" },
  "cta.added": { en: "Added", sq: "Shtuar" },
  "cta.submit": { en: "Submit for approval", sq: "Dërgo për miratim" },
  "cta.viewall": { en: "View all", sq: "Shiko të gjitha" },
  "concierge.title": { en: "PERX Concierge", sq: "Asistenti PERX" },
  "concierge.sub": { en: "Tell me what you're in the mood for.", sq: "Më thuaj çfarë ke qejf." },
  "cart.title": { en: "Your selection", sq: "Përzgjedhja jote" },
  "cart.empty": { en: "Nothing here yet — go find something good.", sq: "Asgjë këtu — gjej diçka të mirë." },
  "cart.total": { en: "Total", sq: "Totali" },
  "hello": { en: "Hey", sq: "Tungjatjeta" },
  "discover.foryou": { en: "Picked for you", sq: "Zgjedhur për ty" },
  "discover.trending": { en: "Trending this week", sq: "Në trend këtë javë" },
  "discover.seasonal": { en: "Seasonal drops", sq: "Oferta sezonale" },
};

export function t(key, lang = "en") {
  const s = STRINGS[key];
  if (!s) return key;
  return s[lang] || s.en || key;
}
