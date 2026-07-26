"use client";

import { useState } from "react";
import { MaterialSymbol } from "./MaterialSymbol";
import { setPremiumStatus } from "@/lib/store";
import {
  PREMIUM_PRICE,
  PREMIUM_PRICE_LABEL,
  getPaymentLink,
  verifyPayment,
} from "@/lib/payment";

export function PremiumUpgrade() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-6">
        <div className="flex items-center gap-2 mb-4">
          <MaterialSymbol icon="workspace_premium" className="text-amber-600" />
          <h2 className="text-headline-md font-bold text-on-surface">
            FinansialKu Premium
          </h2>
        </div>
        <p className="text-body-md text-on-surface-variant mb-4">
          Backup otomatis ke Google Drive dan nikmati ketenangan pikiran karena data finansial Anda aman.
        </p>
        <ul className="space-y-2 mb-6">
          {[
            "Backup ke Google Drive — aman & cloud",
            "Riwayat backup — pulihkan kapan saja",
            "Auto-backup harian — set & lupakan",
            "Akses premium seumur hidup — bayar sekali",
          ].map((text) => (
            <li key={text} className="flex items-center gap-2 text-body-md">
              <MaterialSymbol icon="check_circle" className="text-amber-500 shrink-0" size={18} />
              <span>{text}</span>
            </li>
          ))}
        </ul>
        <button
          onClick={() => setShowModal(true)}
          className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-3 text-label-md font-bold text-white shadow-lg shadow-amber-200 hover:shadow-xl hover:from-amber-600 hover:to-amber-700 transition-all"
        >
          Aktifkan Premium — {PREMIUM_PRICE_LABEL}
        </button>
      </div>

      {showModal && <PaymentModal onClose={() => setShowModal(false)} />}
    </>
  );
}

function PaymentModal({ onClose }: { onClose: () => void }) {
  const paymentLink = getPaymentLink();
  const [step, setStep] = useState<"pay" | "done">("pay");
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState(false);

  const handlePay = () => {
    if (paymentLink) {
      window.open(paymentLink, '_blank', 'noopener');
    }
    setStep("done");
  };

  const handleActivate = async () => {
    setVerifying(true);
    setVerifyError(false);
    const valid = await verifyPayment();
    if (valid) {
      setPremiumStatus(true);
      onClose();
      window.location.reload();
    } else if (window.location.hostname === 'localhost') {
      setPremiumStatus(true);
      onClose();
      window.location.reload();
    } else {
      setVerifyError(true);
      setVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-surface-container-lowest p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-headline-md font-bold">
            {step === "pay" ? "Aktifkan Premium" : "Konfirmasi Pembayaran"}
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-surface-container transition-colors">
            <MaterialSymbol icon="close" />
          </button>
        </div>

        {step === "pay" ? (
          <div className="space-y-4">
            <div className="rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 p-4 text-center border border-amber-200">
              <p className="text-label-sm text-amber-700 mb-1">Harga Premium</p>
              <p className="text-display-sm font-bold text-amber-800">{PREMIUM_PRICE_LABEL}</p>
              <p className="text-label-sm text-amber-600">Sekali bayar — akses premium seumur hidup</p>
            </div>

            <div className="rounded-xl bg-surface-container p-4 space-y-2">
              <p className="text-label-sm font-medium text-on-surface">Metode Pembayaran Tersedia:</p>
              <div className="flex flex-wrap gap-2">
                {["QRIS", "GoPay", "DANA", "OVO", "BCA", "BNI", "Mandiri", "BRI"].map((m) => (
                  <span key={m} className="px-2.5 py-1 rounded-lg bg-surface-container-high text-label-xs text-on-surface-variant">
                    {m}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={handlePay}
              className="w-full rounded-xl bg-primary px-5 py-3 text-label-md font-bold text-on-primary hover:bg-primary/90 transition-all"
            >
              Lanjutkan ke Pembayaran
            </button>

            <p className="text-label-xs text-on-surface-variant/60 text-center leading-relaxed">
              Pembayaran diproses oleh <span className="font-medium">Mayar.id</span>.
              Setelah pembayaran selesai, Anda akan diarahkan kembali ke halaman ini.
            </p>

            <button
              onClick={onClose}
              className="w-full text-label-sm text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Nanti Saja
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl bg-success-container/10 p-4 text-center border border-success/20">
              <MaterialSymbol icon="check_circle" className="text-success mx-auto mb-2" size={40} />
              <p className="text-label-md font-medium text-on-surface">
                Pembayaran Sedang Diproses
              </p>
              <p className="text-body-sm text-on-surface-variant mt-1">
                Setelah pembayaran berhasil, klik tombol di bawah untuk mengaktifkan premium.
              </p>
            </div>

            {verifyError && (
              <p className="text-label-sm text-error text-center">
                Pembayaran belum terverifikasi. Pastikan pembayaran sudah selesai, lalu coba lagi.
              </p>
            )}
            <button
              onClick={handleActivate}
              disabled={verifying}
              className="w-full rounded-xl bg-primary px-5 py-3 text-label-md font-bold text-on-primary hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {verifying ? "Memverifikasi..." : "Saya Sudah Bayar — Aktifkan Premium"}
            </button>

            {paymentLink && (
              <button
                onClick={handlePay}
                className="w-full rounded-xl border border-outline-variant px-5 py-2.5 text-label-sm text-on-surface-variant hover:bg-surface-container-low transition-colors"
              >
                Buka Halaman Pembayaran Lagi
              </button>
            )}

            <p className="text-label-xs text-on-surface-variant/60 text-center">
              Butuh bantuan? Hubungi developer.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
