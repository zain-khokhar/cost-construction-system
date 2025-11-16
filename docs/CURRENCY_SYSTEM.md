# Currency System Implementation Guide

## Overview
The Cost Construction Management System now supports multiple currencies per project with company-level default settings. This allows organizations to manage international projects with different currencies while maintaining accurate financial tracking.

## Features Implemented

### 1. **Currency Utilities** (`lib/utils/currencies.js`)
- **20 Popular Trading Currencies** supported:
  - USD ($), EUR (€), GBP (£), JPY (¥), CNY (¥), AUD (A$), CAD (C$), CHF, INR (₹), SGD (S$), HKD (HK$), KRW (₩), SEK (kr), NOK (kr), NZD (NZ$), MXN (Mex$), BRL (R$), ZAR (R), AED (د.إ), SAR (﷼)
- Helper functions:
  - `getCurrencySymbol(code)` - Returns symbol for currency code
  - `getCurrencyName(code)` - Returns full name
  - `getCurrency(code)` - Returns complete currency object
  - `formatCurrency(amount, code, options)` - Formats amount with symbol

### 2. **Database Schema Updates**

#### Project Model (`models/Project.js`)
```javascript
currency: {
  type: String,
  default: 'USD',
  trim: true,
  uppercase: true,
}
```
- Each project stores its own currency
- Defaults to USD if not specified

#### Company Model (`models/Company.js`)
```javascript
defaultCurrency: {
  type: String,
  default: 'USD',
  trim: true,
  uppercase: true,
}
```
- Company-wide default currency setting
- Used as default when creating new projects

### 3. **UI Components**

#### CurrencySelect Component (`components/ui/CurrencySelect.js`)
- Reusable dropdown for currency selection
- Shows currency symbol, name, and code
- Used in project forms and settings

#### Currency Settings Page (`app/settings/currency/page.js`)
- Dedicated dashboard for managing company currency settings
- Visual display of all available currencies
- Real-time preview of selected currency
- Accessible via navigation sidebar

### 4. **API Endpoints**

#### Company Settings (`app/api/companies/settings/route.js`)
- **GET** `/api/companies/settings` - Fetch company settings including default currency
- **PATCH** `/api/companies/settings` - Update default currency (Admin only)

### 5. **Project Management**

#### Project Creation/Edit Form (`app/projects/page.js`)
- Currency dropdown added to project form
- Pre-populates with company default
- Can be changed per project
- Persists with project data

### 6. **Display Components Updated**

All currency displays now use dynamic symbols based on project currency:

#### Project Components
- `ProjectHeader.js` - Budget display with project currency
- `PurchaseTab.js` - Unit prices and total costs
- All project-related displays

#### Chart Components (All updated with `currency` prop)
- `VendorSpendPieChart.js` - Pie chart tooltips
- `TopItemsBarChart.js` - Bar chart values
- `PhaseCostBarChart.js` - Phase cost displays
- `ItemCostHorizontalChart.js` - Item cost charts
- `CostTrendChart.js` - Trend line values
- `BudgetProgressChart.js` - Budget vs actual
- `BudgetUtilizationChart.js` - Utilization percentages

#### Reports
- `ReportsSummary.js` - Total spending, budgets, remaining budget
- `app/reports/page.js` - Reports page with project-specific currency

#### Dashboard (`app/page.js`)
- All charts use selected project's currency
- Falls back to USD for multi-project views

## Usage Guide

### For Administrators

#### Setting Default Currency
1. Navigate to **Currency Settings** in the sidebar
2. Select your organization's default currency from the dropdown
3. Click **Save Settings**
4. The selected currency will be used for all new projects

#### Creating Projects with Custom Currency
1. Go to **Projects** → **New Project**
2. Fill in project details
3. Select currency from the **Currency** dropdown
4. The selected currency will be used for all costs in that project

### For Developers

#### Using Currency in Components
```javascript
import { getCurrencySymbol, formatCurrency } from '@/lib/utils/currencies';

// Get symbol
const symbol = getCurrencySymbol('EUR'); // Returns '€'

// Format amount
const formatted = formatCurrency(1234.56, 'GBP'); // Returns '£1,234.56'
```

#### Adding Currency to New Charts
```javascript
export default function MyChart({ data, currency = 'USD' }) {
  const symbol = getCurrencySymbol(currency);
  
  // Use in tooltips, axes, etc.
  return (
    <Chart>
      <Tooltip formatter={(value) => `${symbol}${value.toLocaleString()}`} />
    </Chart>
  );
}
```

#### Passing Currency from Parent
```javascript
// In project detail page
<MyChart 
  data={chartData} 
  currency={project?.currency || 'USD'} 
/>
```

## Migration Notes

### Existing Projects
- Existing projects without currency will default to USD
- No data migration required
- Currency can be updated by editing the project

### Database Updates
The schema changes are backward compatible:
- `currency` field in Project has default value
- `defaultCurrency` field in Company has default value
- No breaking changes to existing queries

## Best Practices

1. **Always Pass Currency**: When creating new display components, always accept and use the currency prop
2. **Fallback to USD**: Use `currency = 'USD'` as default parameter
3. **Use Helper Functions**: Prefer `getCurrencySymbol()` over hardcoded symbols
4. **Format Consistently**: Use `formatCurrency()` for consistent number formatting
5. **Project Context**: Always use project-specific currency, not user or company currency

## Testing Checklist

✅ **Completed Features:**
- [x] Currency utilities and helper functions
- [x] Database schema updates
- [x] Project creation form with currency selection
- [x] Company currency settings page
- [x] API endpoints for currency management
- [x] All charts updated with dynamic currency
- [x] Purchase displays with correct currency
- [x] Reports with project-specific currency
- [x] Dashboard charts with currency support
- [x] Navigation link to currency settings

## Future Enhancements

Potential improvements for future versions:
1. **Currency Conversion**: Add real-time exchange rate conversion
2. **Multi-Currency Reports**: Compare costs across different currencies
3. **Currency History**: Track currency changes over time
4. **Budget Alerts**: Currency-aware budget notifications
5. **Export with Currency**: Include currency in exported reports

## Troubleshooting

### Currency Not Displaying Correctly
- Check that project has currency field populated
- Verify currency prop is passed to component
- Ensure `getCurrencySymbol()` is imported

### Old Projects Show Wrong Currency
- Edit project and save to update currency field
- Or run database migration to set default currency

### Settings Not Saving
- Verify user has admin role
- Check API endpoint permissions
- Review browser console for errors

## File Structure

```
lib/utils/
  └── currencies.js              # Currency utilities and constants

models/
  ├── Project.js                 # Updated with currency field
  └── Company.js                 # Updated with defaultCurrency

components/
  ├── ui/
  │   └── CurrencySelect.js      # Currency dropdown component
  ├── project/
  │   ├── ProjectHeader.js       # Updated with currency
  │   └── PurchaseTab.js         # Updated with currency
  ├── charts/                    # All charts updated
  │   ├── VendorSpendPieChart.js
  │   ├── TopItemsBarChart.js
  │   ├── PhaseCostBarChart.js
  │   ├── ItemCostHorizontalChart.js
  │   ├── CostTrendChart.js
  │   ├── BudgetProgressChart.js
  │   └── BudgetUtilizationChart.js
  └── reports/
      └── ReportsSummary.js      # Updated with currency

app/
  ├── settings/currency/
  │   └── page.js                # Currency settings page
  ├── api/companies/settings/
  │   └── route.js               # Currency API endpoints
  ├── projects/
  │   ├── page.js                # Project form with currency
  │   └── [id]/page.js           # Project detail page
  ├── reports/page.js            # Reports with currency
  └── page.js                    # Dashboard with currency
```

## Summary

The currency system is now fully integrated across the entire application:
- ✅ 20 major currencies supported
- ✅ Company-level default settings
- ✅ Project-specific currency selection
- ✅ All displays dynamically show correct currency symbol
- ✅ Charts and reports currency-aware
- ✅ Easy-to-use management dashboard
- ✅ Backward compatible with existing data

Users can now manage multi-currency projects with ease, while maintaining accurate financial tracking and reporting across their entire organization.
