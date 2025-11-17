// Popular trading currencies with their symbols and full names
export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'PKR', symbol: 'Rs', name: 'Pakistani Rupees' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
  { code: 'MXN', symbol: 'Mex$', name: 'Mexican Peso' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
];

/**
 * Get currency symbol by code
 * @param {string} code - Currency code (e.g., 'USD')
 * @returns {string} Currency symbol (e.g., '$')
 */
export function getCurrencySymbol(code) {
  const currency = CURRENCIES.find(c => c.code === code);
  return currency ? currency.symbol : '$'; // Default to $ if not found
}

/**
 * Get currency name by code
 * @param {string} code - Currency code (e.g., 'USD')
 * @returns {string} Currency name (e.g., 'US Dollar')
 */
export function getCurrencyName(code) {
  const currency = CURRENCIES.find(c => c.code === code);
  return currency ? currency.name : 'US Dollar';
}

/**
 * Get currency object by code
 * @param {string} code - Currency code (e.g., 'USD')
 * @returns {object|null} Currency object or null
 */
export function getCurrency(code) {
  return CURRENCIES.find(c => c.code === code) || null;
}

/**
 * Format amount with currency symbol
 * @param {number} amount - Amount to format
 * @param {string} currencyCode - Currency code (e.g., 'USD')
 * @param {object} options - Formatting options
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currencyCode = 'USD', options = {}) {
  const {
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    useGrouping = true,
  } = options;

  const symbol = getCurrencySymbol(currencyCode);
  const formattedAmount = amount.toLocaleString(undefined, {
    minimumFractionDigits,
    maximumFractionDigits,
    useGrouping,
  });

  return `${symbol}${formattedAmount}`;
}
