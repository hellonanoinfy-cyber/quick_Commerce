'use client';

import { CheckCircle2 } from 'lucide-react';

const STEP_LABELS = ['Address', 'Payment', 'Confirm'];

export default function CheckoutSteps({ steps = STEP_LABELS, currentStep = 0 }) {
  return (
    <div className="mb-8 overflow-x-auto px-2">
      <div className="mx-auto flex max-w-2xl items-center justify-center">
        {steps.map((step, index) => (
          <div key={step} className="flex flex-1 items-center">
            <div className="flex min-w-0 flex-1 flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-black shadow-md sm:h-11 sm:w-11 ${
                  index <= currentStep
                    ? 'bg-[var(--brand-primary)] text-white shadow-violet-200'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {index < currentStep ? <CheckCircle2 size={18} /> : index + 1}
              </div>
              <span
                className={`mt-2 text-center text-[10px] font-black uppercase tracking-wider sm:text-[11px] ${
                  index <= currentStep ? 'text-[var(--brand-primary)]' : 'text-gray-400'
                }`}
              >
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="mx-1 mb-6 h-0.5 flex-1 rounded-full bg-gray-200 sm:mx-2">
                <div
                  className={`h-full rounded-full bg-[var(--brand-primary)] transition-all duration-300 ${
                    index < currentStep ? 'w-full' : 'w-0'
                  }`}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
