import {
  OFFERS as SEED_OFFERS,
  PACKAGES as SEED_PACKAGES,
  PROVIDER_MAP,
  CATEGORY_MAP,
} from "./seed.js";

const byId = (items = []) => Object.fromEntries(items.map((item) => [item.id, item]));

export function seedOffers() {
  const now = Date.now();
  return SEED_OFFERS.map((offer) => ({
    ...offer,
    status: "active",
    tags: offer.tags || [],
    createdAt: now,
    updatedAt: now,
  }));
}

export function seedPackages() {
  return SEED_PACKAGES.map((pkg) => ({ ...pkg, status: "active" }));
}

export function catalogFromState(state) {
  return {
    offers: state.offers || [],
    packages: state.packages || [],
  };
}

export function offerMapFor(catalog) {
  return byId(catalog?.offers || []);
}

export function packageMapFor(catalog) {
  return byId(catalog?.packages || []);
}

export function activeOffers(catalog) {
  return (catalog?.offers || []).filter((offer) => offer.status !== "archived");
}

export function activePackages(catalog) {
  return (catalog?.packages || []).filter((pkg) => pkg.status !== "archived");
}

export function activeCatalog(catalog) {
  return {
    offers: activeOffers(catalog),
    packages: activePackages(catalog),
  };
}

export function packageRawPriceALL(pkg, catalog) {
  const offers = offerMapFor(catalog);
  return (pkg?.offerIds || []).reduce((sum, offerId) => sum + (offers[offerId]?.priceALL || 0), 0);
}

export function packagePriceALL(pkg, catalog) {
  return Math.round(packageRawPriceALL(pkg, catalog) * 0.9);
}

export function catalogForAI(catalog) {
  const offers = activeOffers(catalog).map(
    (offer) =>
      `${offer.id} | ${offer.title} | ${CATEGORY_MAP[offer.category]?.en} | ${offer.priceALL} ALL | ${PROVIDER_MAP[offer.providerId]?.name} | tags:${(offer.tags || []).join(",")}`
  );
  const packages = activePackages(catalog).map(
    (pkg) => `${pkg.id} | PACKAGE "${pkg.title}" | ${packagePriceALL(pkg, catalog)} ALL | includes:${pkg.offerIds.join("+")}`
  );
  return { offers, packages };
}
