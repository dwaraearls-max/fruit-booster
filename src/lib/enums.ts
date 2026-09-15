export const UserRole = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  STAFF: "STAFF",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const OrderStatus = {
  NEW: "NEW",
  PAYMENT_CONFIRMED: "PAYMENT_CONFIRMED",
  PREPARING: "PREPARING",
  READY: "READY",
  OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const ORDER_STATUS_VALUES = Object.values(OrderStatus) as [
  OrderStatus,
  ...OrderStatus[],
];

export const PaymentStatus = {
  AWAITING_PAYMENT: "AWAITING_PAYMENT",
  PENDING: "PENDING",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const DeliveryType = {
  DELIVERY: "DELIVERY",
  PICKUP: "PICKUP",
} as const;
export type DeliveryType = (typeof DeliveryType)[keyof typeof DeliveryType];

export const PromoType = {
  PERCENT: "PERCENT",
  FIXED: "FIXED",
} as const;
export type PromoType = (typeof PromoType)[keyof typeof PromoType];
