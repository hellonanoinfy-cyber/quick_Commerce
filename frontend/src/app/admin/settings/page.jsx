'use client';

import { useState } from 'react';

import AdminForm from '@/components/admin/AdminForm';

const fields = [
  { name: 'storeName', label: 'Store Name', required: true },
  { name: 'supportEmail', label: 'Support Email', required: true },
  { name: 'codLimit', label: 'COD Limit', type: 'number', required: true },
  {
    name: 'freeShippingThreshold',
    label: 'Free Shipping Threshold',
    type: 'number',
    required: true,
  },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    storeName: 'FirstCry',
    supportEmail: 'support@firstcry.local',
    codLimit: '5000',
    freeShippingThreshold: '499',
  });
  const [saved, setSaved] = useState(false);

  const submit = event => {
    event.preventDefault();
    setSaved(true);
  };

  return (
    <section className="max-w-3xl rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-xl font-black text-gray-900">Store Settings</h2>
      <AdminForm
        fields={fields}
        values={settings}
        onChange={event =>
          setSettings(prev => ({ ...prev, [event.target.name]: event.target.value }))
        }
        onSubmit={submit}
        submitLabel="Save Settings"
      />
      {saved && (
        <p className="mt-4 rounded-xl bg-green-50 p-3 text-sm font-black text-green-700">
          Settings saved locally for this admin session.
        </p>
      )}
    </section>
  );
}
