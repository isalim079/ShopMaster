import { env } from '../config/env';

export const SETTING_KEY = {
  INVOICE_PREFIX: 'invoice.prefix',
  INVOICE_NEXT_NUMBER: 'invoice.next_number',
  PURCHASE_PREFIX: 'purchase.prefix',
  PURCHASE_NEXT_NUMBER: 'purchase.next_number',
  PURCHASE_RETURN_PREFIX: 'purchase_return.prefix',
  PURCHASE_RETURN_NEXT_NUMBER: 'purchase_return.next_number',
  SALE_RETURN_PREFIX: 'sale_return.prefix',
  SALE_RETURN_NEXT_NUMBER: 'sale_return.next_number',
  INVENTORY_LOW_STOCK_THRESHOLD: 'inventory.low_stock_threshold',
  SALE_ALLOW_NEGATIVE_STOCK: 'sale.allow_negative_stock',
  DATE_FORMAT: 'date.format',
  NUMBER_DECIMAL_PLACES: 'number.decimal_places',
} as const;

export type SettingKey = (typeof SETTING_KEY)[keyof typeof SETTING_KEY];

export interface DefaultOrganizationSetting {
  key: SettingKey;
  value: string;
  description: string;
}

export const getDefaultOrganizationSettings = (): DefaultOrganizationSetting[] => [
  {
    key: SETTING_KEY.INVOICE_PREFIX,
    value: env.SETTING_DEFAULT_INVOICE_PREFIX,
    description: 'Prefix used on invoice numbers',
  },
  {
    key: SETTING_KEY.INVOICE_NEXT_NUMBER,
    value: env.SETTING_DEFAULT_INVOICE_NEXT_NUMBER,
    description: 'Next invoice sequence number',
  },
  {
    key: SETTING_KEY.PURCHASE_PREFIX,
    value: env.SETTING_DEFAULT_PURCHASE_PREFIX,
    description: 'Prefix used on purchase order numbers',
  },
  {
    key: SETTING_KEY.PURCHASE_NEXT_NUMBER,
    value: env.SETTING_DEFAULT_PURCHASE_NEXT_NUMBER,
    description: 'Next purchase order sequence number',
  },
  {
    key: SETTING_KEY.PURCHASE_RETURN_PREFIX,
    value: env.SETTING_DEFAULT_PURCHASE_RETURN_PREFIX,
    description: 'Prefix used on purchase return numbers',
  },
  {
    key: SETTING_KEY.PURCHASE_RETURN_NEXT_NUMBER,
    value: env.SETTING_DEFAULT_PURCHASE_RETURN_NEXT_NUMBER,
    description: 'Next purchase return sequence number',
  },
  {
    key: SETTING_KEY.SALE_RETURN_PREFIX,
    value: env.SETTING_DEFAULT_SALE_RETURN_PREFIX,
    description: 'Prefix used on sale return numbers',
  },
  {
    key: SETTING_KEY.SALE_RETURN_NEXT_NUMBER,
    value: env.SETTING_DEFAULT_SALE_RETURN_NEXT_NUMBER,
    description: 'Next sale return sequence number',
  },
  {
    key: SETTING_KEY.INVENTORY_LOW_STOCK_THRESHOLD,
    value: env.SETTING_DEFAULT_LOW_STOCK_THRESHOLD,
    description: 'Stock quantity treated as low stock',
  },
  {
    key: SETTING_KEY.SALE_ALLOW_NEGATIVE_STOCK,
    value: env.SETTING_DEFAULT_ALLOW_NEGATIVE_STOCK,
    description: 'Allow sales when stock is insufficient',
  },
  {
    key: SETTING_KEY.DATE_FORMAT,
    value: env.SETTING_DEFAULT_DATE_FORMAT,
    description: 'Display date format',
  },
  {
    key: SETTING_KEY.NUMBER_DECIMAL_PLACES,
    value: env.SETTING_DEFAULT_DECIMAL_PLACES,
    description: 'Decimal places for money and quantities',
  },
];
