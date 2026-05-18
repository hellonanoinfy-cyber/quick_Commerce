'use client';

import { Mail, MessageSquare, Smartphone } from 'lucide-react';

const CHANNELS = [
  { id: 'email', label: 'Email', description: 'OTP to your inbox', icon: Mail, comingSoon: false },
  {
    id: 'sms',
    label: 'SMS',
    description: 'OTP via text message',
    icon: Smartphone,
    comingSoon: true,
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    description: 'OTP via WhatsApp',
    icon: MessageSquare,
    comingSoon: true,
  },
];

export default function OtpChannelSelector({ value = 'email', onChange, disabled = false }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700">Receive OTP via</p>
      <div
        className="grid grid-cols-1 gap-3 sm:grid-cols-3"
        role="group"
        aria-label="OTP delivery channel"
      >
        {CHANNELS.map(channel => {
          const Icon = channel.icon;
          const selected = value === channel.id;
          const isDisabled = disabled || channel.comingSoon;

          return (
            <button
              key={channel.id}
              type="button"
              disabled={isDisabled}
              onClick={() => {
                if (!channel.comingSoon) onChange?.(channel.id);
              }}
              className={`relative flex flex-col items-start gap-1 rounded-xl border-2 p-3 text-left transition-all ${
                selected && !channel.comingSoon
                  ? 'border-[var(--brand-primary)] bg-[var(--brand-light)] shadow-sm'
                  : 'border-gray-200 bg-white'
              } ${isDisabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:border-[#E9DFFC]'}`}
              aria-pressed={selected && !channel.comingSoon}
            >
              {channel.comingSoon && (
                <span className="absolute right-2 top-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800">
                  Soon
                </span>
              )}
              <span className="flex items-center gap-2">
                <Icon
                  className={`h-4 w-4 ${selected && !channel.comingSoon ? 'text-[var(--brand-primary)]' : 'text-gray-500'}`}
                  aria-hidden
                />
                <span
                  className={`text-sm font-semibold ${selected && !channel.comingSoon ? 'text-[var(--brand-primary)]' : 'text-gray-800'}`}
                >
                  {channel.label}
                </span>
              </span>
              <span className="text-xs text-gray-500">{channel.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
