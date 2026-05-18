'use client';

import { useState } from 'react';

import AccountLayout from '@/components/account/AccountLayout';
import AccountMenuList from '@/components/account/AccountMenuList';
import AccountPaymentMethods from '@/components/account/AccountPaymentMethods';
import AccountSidebar from '@/components/account/AccountSidebar';
import AccountStats from '@/components/account/AccountStats';
import AddressManager from '@/components/account/AddressManager';
import ManageQuickLinks from '@/components/account/ManageQuickLinks';
import MyLittleOne from '@/components/account/MyLittleOne';
import OrderHistory from '@/components/account/OrderHistory';
import ProfileForm from '@/components/account/ProfileForm';
import ProfileHeader from '@/components/account/ProfileHeader';
import WishlistSection from '@/components/account/WishlistSection';
import EmptyState from '@/components/common/EmptyState';
import useAccountStore from '@/stores/account-store';
import useAuthStore from '@/stores/auth-store';

export default function AccountPage() {
  const { isAuthenticated, user } = useAuthStore();
  const { addresses, wishlist, savedProducts, children } = useAccountStore();
  const [activeSection, setActiveSection] = useState('profile');
  const [editingProfile, setEditingProfile] = useState(false);

  const handleNavigate = section => {
    setActiveSection(section);
    if (section === 'profile') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <AccountLayout
      title="My Account"
      description="Manage your profile, little ones, orders, addresses, and payment methods."
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'My Account' }]}
    >
      {!isAuthenticated ? (
        <EmptyState
          title="You're browsing as a guest"
          description="Cart works without an account. Login later to save addresses, orders, and wishlist."
          actionLabel="EXPLORE PRODUCTS"
          actionHref="/products"
        />
      ) : (
        <div className="space-y-6">
          <AccountStats
            addressCount={addresses.length}
            wishlistCount={wishlist.length}
            orderCount={2}
            childCount={children.length}
          />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
            <AccountSidebar activeSection={activeSection} onSelect={setActiveSection} />
            <div className="space-y-6">
              {activeSection === 'profile' && (
                <>
                  <ProfileHeader
                    user={user}
                    isEditing={editingProfile}
                    onEditProfile={() => setEditingProfile(prev => !prev)}
                  />
                  <MyLittleOne compact />
                  <AccountMenuList />
                  <ManageQuickLinks onNavigate={handleNavigate} />
                  {editingProfile && (
                    <section className="rounded-2xl border border-[var(--border-default)] bg-white p-5 shadow-sm sm:p-6">
                      <div className="mb-6">
                        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[var(--brand-primary)]">
                          Profile
                        </p>
                        <h2 className="text-2xl font-black text-gray-900">Personal details</h2>
                      </div>
                      <ProfileForm onSaved={() => setEditingProfile(false)} />
                    </section>
                  )}
                </>
              )}
              {activeSection === 'little-one' && <MyLittleOne />}
              {activeSection === 'addresses' && (
                <section className="rounded-2xl border border-[var(--border-default)] bg-white p-5 shadow-sm sm:p-6">
                  <AddressManager />
                </section>
              )}
              {activeSection === 'orders' && <OrderHistory />}
              {activeSection === 'payments' && <AccountPaymentMethods />}
              {activeSection === 'wishlist' && <WishlistSection items={wishlist} />}
              {activeSection === 'saved' && (
                <WishlistSection items={savedProducts} title="Saved Products" />
              )}
            </div>
          </div>
        </div>
      )}
    </AccountLayout>
  );
}
