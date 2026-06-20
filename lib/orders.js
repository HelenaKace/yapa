import { PROVIDER_MAP } from "./seed.js";
import { offerMapFor, packageMapFor, packagePriceALL } from "./catalog.js";

export function priceForItem(item, catalog) {
  const offers = offerMapFor(catalog);
  const packages = packageMapFor(catalog);
  if (item.type === "package") {
    const pkg = packages[item.id];
    return pkg ? packagePriceALL(pkg, catalog) : 0;
  }
  return offers[item.id]?.priceALL || 0;
}

export function normalizeItems(items, catalog) {
  return items
    .map((item) => ({ type: item.type, id: item.id, priceALL: priceForItem(item, catalog) }))
    .filter((item) => item.priceALL > 0);
}

export function itemMeta(item, catalog) {
  const offers = offerMapFor(catalog);
  const packages = packageMapFor(catalog);
  if (item.type === "package") {
    const pkg = packages[item.id];
    return {
      title: pkg?.title || "Package",
      subtitle: pkg ? `${pkg.offerIds.length} offers bundled` : "",
      theme: pkg?.theme,
      isPackage: true,
    };
  }
  const offer = offers[item.id];
  return {
    title: offer?.title || "Offer",
    subtitle: PROVIDER_MAP[offer?.providerId]?.name || "Provider",
    providerId: offer?.providerId,
    isPackage: false,
  };
}

export function offerIdsForItem(item, catalog) {
  const packages = packageMapFor(catalog);
  if (item.type === "package") return packages[item.id]?.offerIds || [];
  return item.id ? [item.id] : [];
}

export function payoutLinesForItems(items, catalog) {
  const offersById = offerMapFor(catalog);
  const packages = packageMapFor(catalog);
  return items.flatMap((item) => {
    if (item.type !== "package") {
      const offer = offersById[item.id];
      if (!offer) return [];
      return [{
        providerId: offer.providerId,
        offerId: offer.id,
        sourceType: "offer",
        sourceId: offer.id,
        amountALL: offer.priceALL,
      }];
    }

    const pkg = packages[item.id];
    const offers = (pkg?.offerIds || []).map((id) => offersById[id]).filter(Boolean);
    if (!pkg || offers.length === 0) return [];

    const total = packagePriceALL(pkg, catalog);
    const raw = offers.reduce((sum, offer) => sum + offer.priceALL, 0);
    let allocated = 0;
    return offers.map((offer, index) => {
      const amountALL = index === offers.length - 1
        ? total - allocated
        : Math.round((total * offer.priceALL) / raw);
      allocated += amountALL;
      return {
        providerId: offer.providerId,
        offerId: offer.id,
        sourceType: "package",
        sourceId: pkg.id,
        amountALL,
      };
    });
  });
}

export function providerPayouts(lines) {
  const byProvider = new Map();
  for (const line of lines) {
    const current = byProvider.get(line.providerId) || {
      providerId: line.providerId,
      providerName: PROVIDER_MAP[line.providerId]?.name || line.providerId,
      amountALL: 0,
      lines: [],
    };
    current.amountALL += line.amountALL;
    current.lines.push(line);
    byProvider.set(line.providerId, current);
  }
  return [...byProvider.values()];
}

export function providerCountForItems(items, catalog) {
  return providerPayouts(payoutLinesForItems(items, catalog)).length;
}
