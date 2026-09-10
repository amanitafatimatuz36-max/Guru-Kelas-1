import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, CheckCircle2 } from 'lucide-react';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>Terpasang di Perangkat</span>
      </div>
    );
  }

  return (
    <>
      {isInstallable && (
        <button
          id="btn-install-pwa"
          onClick={install}
          className={`flex items-center gap-2 font-medium text-white bg-blue-700 hover:bg-blue-800 transition-colors shadow-sm rounded-lg active:scale-95 ${
            compact ? 'px-2.5 py-1.5 text-xs' : 'px-3.5 py-2 text-sm'
          }`}
          title="Install Aplikasi di HP/Desktop"
        >
          <Smartphone className="w-4 h-4" />
          <span>Pasang Aplikasi (PWA)</span>
        </button>
      )}

      {isIOS && !isInstallable && (
        <button
          id="btn-install-ios-pwa"
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-2 font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors rounded-lg ${
            compact ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-1.5 text-xs'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Pasang di iPhone / iPad</span>
        </button>
      )}

      {/* Manual fallback prompt if browser hasn't fired prompt yet */}
      {!isInstallable && !isIOS && !isInstalled && (
        <div className="text-xs text-slate-400 flex items-center gap-1">
          <Download className="w-3 h-3" />
          <span className="hidden sm:inline">Bisa dipasang via menu browser</span>
        </div>
      )}

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-blue-600" />
                Pasang di iPhone / iPad
              </h3>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p className="flex items-start gap-2">
                <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-xs">1</span>
                <span>Buka halaman ini di browser <strong>Safari</strong>.</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-xs">2</span>
                <span>Ketuk tombol <strong>Bagikan / Share</strong> (ikon kotak bertanda panah ke atas) di bilah navigasi bawah.</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-xs">3</span>
                <span>Gulir ke bawah dan pilih <strong>Tambahkan ke Layar Utama (Add to Home Screen)</strong>.</span>
              </p>
            </div>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-6 w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
};
