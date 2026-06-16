import type { DiscountTier, PricingConfig, WalkDiscount } from "@/lib/tenant/types";

export type { PricingConfig, SupervisionLevel } from "@/lib/tenant/types";

/** Highest-threshold discount tier that applies for the given night count. */
export const getActiveDiscount = (
  config: PricingConfig,
  nights: number
): DiscountTier | null => {
  return config.nightly.discounts.reduce<DiscountTier | null>((best, discount) => {
    if (nights < discount.minNights) return best;
    if (!best || discount.minNights > best.minNights) return discount;
    return best;
  }, null);
};

export const getActiveWalkDiscount = (
  config: PricingConfig,
  nights: number
): WalkDiscount | null => {
  return config.addOns.walkDiscounts.reduce<WalkDiscount | null>((best, discount) => {
    if (nights < discount.minNights) return best;
    if (!best || discount.minNights > best.minNights) return discount;
    return best;
  }, null);
};

export const getActiveExtraPetDiscount = (
  config: PricingConfig,
  nights: number
): DiscountTier | null => {
  return config.addOns.extraPetDiscounts.reduce<DiscountTier | null>((best, discount) => {
    if (nights < discount.minNights) return best;
    if (!best || discount.minNights > best.minNights) return discount;
    return best;
  }, null);
};

/** Effective nightly rate after applying the active long-stay discount. */
export const getNightlyRate = (config: PricingConfig, nights: number): number => {
  const discount = getActiveDiscount(config, nights);
  const multiplier = discount ? 1 - discount.percentOff / 100 : 1;
  return config.nightly.baseStandard * multiplier;
};
