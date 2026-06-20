import {
  OFFER_MAP,
  PACKAGE_MAP,
  PROVIDER_MAP,
  packagePriceALL,
} from "./seed.js";

export function priceForItem(item) {
  if (item.type === "package") {
    const pkg = PACKAGE_MAP[item.id];
    return pkg ? packagePriceALL(pkg) : 0;
  }
  return OFFER_MAP[item.id]?.priceALL || 0;
}

export function normalizeItems(items) {
  return items
    .map((item) => ({ type: item.type, id: item.id, priceALL: priceForItem(item) }))
    .filter((item) => item.priceALL > 0);
}

export function itemMeta(item) {
  if (item.type === "package") {
    const pkg = PACKAGE_MAP[item.id];
    return {
      title: pkg?.title || "Package",
      subtitle: pkg ? `${pkg.offerIds.length} offers bundled` : "",
      theme: pkg?.theme,
      isPackage: true,
    };
  }
  const offer = OFFER_MAP[item.id];
  return {
    title: offer?.title || "Offer",
    subtitle: PROVIDER_MAP[offer?.providerId]?.name || "Provider",
    providerId: offer?.providerId,
    isPackage: false,
  };
}

export function offerIdsForItem(item) {
  if (item.type === "package") return PACKAGE_MAP[item.id]?.offerIds || [];
  return item.id ? [item.id] : [];
}

export function payoutLinesForItems(items) {
  return items.flatMap((item) => {
    if (item.type !== "package") {
      const offer = OFFER_MAP[item.id];
      if (!offer) return [];
      return [{
        providerId: offer.providerId,
        offerId: offer.id,
        sourceType: "offer",
        sourceId: offer.id,
        amountALL: offer.priceALL,
      }];
    }

    const pkg = PACKAGE_MAP[item.id];
    const offers = (pkg?.offerIds || []).map((id) => OFFER_MAP[id]).filter(Boolean);
    if (!pkg || offers.length === 0) return [];

    const total = packagePriceALL(pkg);
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

export function providerCountForItems(items) {
  return providerPayouts(payoutLinesForItems(items)).length;
}
