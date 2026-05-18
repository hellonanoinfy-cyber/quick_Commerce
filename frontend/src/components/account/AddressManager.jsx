'use client';

import { useState } from 'react';

import AddressCard from '@/components/account/AddressCard';
import AddressModal from '@/components/account/AddressModal';
import { Button } from '@/components/ui/Button';
import useAccountStore from '@/stores/account-store';

const emptyAddress = {
  fullName: '',
  phone: '',
  address: '',
  landmark: '',
  city: '',
  state: '',
  pincode: '',
  type: 'Home',
  isDefault: false,
};

const validateAddress = form => {
  const errors = {};
  if (form.fullName.trim().length < 3) errors.fullName = 'Enter a valid name';
  if (!/^[6-9]\d{9}$/.test(form.phone.trim())) errors.phone = 'Enter a 10 digit Indian phone';
  if (form.address.trim().length < 8) errors.address = 'Enter a complete address';
  if (form.city.trim().length < 2) errors.city = 'City is required';
  if (form.state.trim().length < 2) errors.state = 'State is required';
  if (!/^\d{6}$/.test(form.pincode.trim())) errors.pincode = 'Enter a 6 digit pincode';
  return errors;
};

export default function AddressManager() {
  const { addresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } =
    useAccountStore();
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyAddress);
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState({});

  const reset = () => {
    setEditingId(null);
    setForm(emptyAddress);
    setErrors({});
    setOpen(false);
  };

  const submit = event => {
    event.preventDefault();
    const validationErrors = validateAddress(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    if (editingId) updateAddress(editingId, form);
    else addAddress(form);
    reset();
  };

  const openEditor = address => {
    setEditingId(address?.id || null);
    setForm(address || emptyAddress);
    setErrors({});
    setOpen(true);
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 rounded-2xl bg-[var(--brand-light)] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-black text-gray-900">Delivery addresses</p>
          <p className="text-sm font-medium text-gray-500">
            Add multiple addresses and choose a default for checkout.
          </p>
        </div>
        <Button
          onClick={() => openEditor(null)}
          className="w-fit bg-[var(--brand-primary)] px-6 hover:bg-[var(--brand-primary-hover)]"
        >
          Add Address
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.map(address => (
          <AddressCard
            key={address.id}
            address={address}
            onEdit={() => openEditor(address)}
            onDelete={() => deleteAddress(address.id)}
            onDefault={() => setDefaultAddress(address.id)}
          />
        ))}
        {addresses.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#E9DFFC] bg-white p-8 text-center md:col-span-2">
            <p className="font-black text-gray-900">No addresses yet</p>
            <p className="mt-1 text-sm font-medium text-gray-500">
              Add a shipping address to speed up checkout.
            </p>
          </div>
        )}
      </div>
      <AddressModal
        open={open}
        form={form}
        errors={errors}
        editing={Boolean(editingId)}
        onChange={event => {
          const { name, value, type, checked } = event.target;
          setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        }}
        onSubmit={submit}
        onClose={reset}
      />
    </section>
  );
}
