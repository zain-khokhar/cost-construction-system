'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import CurrencySelect from '@/components/ui/CurrencySelect';
import { CURRENCIES, getCurrencySymbol, getCurrencyName } from '@/lib/utils/currencies';

export default function CurrencySettingsPage() {
  const [defaultCurrency, setDefaultCurrency] = useState('USD');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [companyInfo, setCompanyInfo] = useState(null);

  useEffect(() => {
    fetchCompanySettings();
  }, []);

  const fetchCompanySettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/companies/settings');
      const data = await res.json();
      if (data.ok && data.data) {
        setDefaultCurrency(data.data.defaultCurrency || 'USD');
        setCompanyInfo(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch company settings:', err);
      setMessage({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await fetch('/api/companies/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ defaultCurrency }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: 'Currency settings saved successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        throw new Error(data.error?.message || 'Failed to save settings');
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 w-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Currency Settings</h1>
        <p className="text-gray-600 mt-1">Manage default currency for your organization</p>
      </div>

      {/* Message */}
      {message.text && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <span>{message.text}</span>
          </div>
        </div>
      )}

      {/* Settings Card */}
      <Card>
        <div className="p-6">
          <div className="space-y-6">
            {/* Default Currency Setting */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Default Currency</h2>
              <p className="text-sm text-gray-600 mb-4">
                Set the default currency for new projects. This will be pre-selected when creating new projects,
                but can be changed on a per-project basis.
              </p>
              <div className="max-w-md">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Default Currency
                </label>
                <CurrencySelect
                  value={defaultCurrency}
                  onChange={setDefaultCurrency}
                />
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-blue-800">
                      <p className="font-medium">Selected: {getCurrencyName(defaultCurrency)}</p>
                      <p className="mt-1">Symbol: {getCurrencySymbol(defaultCurrency)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Available Currencies Info */}
            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Currencies</h2>
              <p className="text-sm text-gray-600 mb-4">
                The following {CURRENCIES.length} currencies are available for use in your projects:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                {CURRENCIES.map((currency) => (
                  <div
                    key={currency.code}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      currency.code === defaultCurrency
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{currency.code}</p>
                        <p className="text-sm text-gray-600">{currency.name}</p>
                      </div>
                      <span className="text-2xl font-bold text-gray-700">{currency.symbol}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <div className="border-t pt-6">
              <div className="flex items-center gap-4">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="min-w-[140px]"
                >
                  {saving ? 'Saving...' : 'Save Settings'}
                </Button>
                <Button
                  variant="outline"
                  onClick={fetchCompanySettings}
                  disabled={saving || loading}
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Additional Info Card */}
      <Card className="mt-6">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">How Currency Settings Work</h2>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p><strong>Company-Level Default:</strong> The currency selected here becomes the default for all new projects in your organization.</p>
            </div>
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p><strong>Project-Specific Override:</strong> Each project can use a different currency, selected when creating or editing the project.</p>
            </div>
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p><strong>Automatic Display:</strong> All costs, budgets, and financial data automatically display using the project's currency symbol.</p>
            </div>
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p><strong>Note:</strong> Changing the default currency only affects new projects. Existing projects retain their original currency.</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
