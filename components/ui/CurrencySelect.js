import { CURRENCIES } from '@/lib/utils/currencies';

export default function CurrencySelect({ value, onChange, disabled = false, className = '' }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${className}`}
    >
      {CURRENCIES.map((currency) => (
        <option key={currency.code} value={currency.code}>
          {currency.symbol} - {currency.name} ({currency.code})
        </option>
      ))}
    </select>
  );
}
