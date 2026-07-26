"use client";

import { useState, useEffect } from "react";
import type { BackupPrefs } from "@/lib/types";
import {
  getPremiumStatus,
  setPremiumStatus,
  getGoogleDriveToken,
  setBackupPrefs,
  getBackupPrefs,
} from "@/lib/store";
import {
  setGoogleConfig,
  authenticate,
  uploadBackup,
  listBackups,
  restoreBackup,
  deleteBackup,
  logout as gdriveLogout,
} from "@/lib/googleDrive";
import { MaterialSymbol } from "./MaterialSymbol";
import { useToast } from "./Toast";
import { PremiumBadge } from "./PremiumBadge";

const GOOGLE_CLIENT_ID = "";

type DriveFile = { id: string; name: string; createdAt: string };

export function GoogleDriveBackup() {
  const [isPremium, setIsPremium] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [backups, setBackups] = useState<DriveFile[]>([]);
  const [backupPrefs, setLocalPrefs] = useState<BackupPrefs>({ autoBackup: false, backupFrequency: "manual" });
  const { showToast } = useToast();

  useEffect(() => {
    setIsPremium(getPremiumStatus());
    setLocalPrefs(getBackupPrefs());
    if (getGoogleDriveToken()) setIsAuthed(true);
    if (GOOGLE_CLIENT_ID) setGoogleConfig(GOOGLE_CLIENT_ID);
  }, []);

  const handleAuth = async () => {
    if (!GOOGLE_CLIENT_ID) {
      showToast("Google Client ID belum diatur. Hubungi developer.", "error");
      return;
    }
    setBusy(true);
    try {
      await authenticate();
      setIsAuthed(true);
      showToast("Berhasil terhubung ke Google Drive");
      refreshBackups();
    } catch (e) {
      showToast(`Gagal autentikasi: ${e}`, "error");
    }
    setBusy(false);
  };

  const refreshBackups = async () => {
    const token = getGoogleDriveToken();
    if (!token) return;
    try {
      const list = await listBackups(token);
      setBackups(list);
    } catch {
      setIsAuthed(false);
    }
  };

  const handleUpload = async () => {
    const token = getGoogleDriveToken();
    if (!token) return;
    setBusy(true);
    try {
      await uploadBackup(token);
      showToast("Backup berhasil diupload ke Google Drive!");
      refreshBackups();
      const prefs = getBackupPrefs();
      setBackupPrefs({ ...prefs, lastBackupAt: new Date().toISOString() });
    } catch (e) {
      showToast(`Gagal upload: ${e}`, "error");
    }
    setBusy(false);
  };

  const handleRestore = async (fileId: string) => {
    const token = getGoogleDriveToken();
    if (!token) return;
    if (!confirm("Data saat ini akan diganti dengan data backup. Lanjutkan?")) return;
    setBusy(true);
    try {
      const msg = await restoreBackup(token, fileId);
      showToast(msg);
    } catch (e) {
      showToast(`Gagal restore: ${e}`, "error");
    }
    setBusy(false);
  };

  const handleDelete = async (fileId: string) => {
    const token = getGoogleDriveToken();
    if (!token) return;
    if (!confirm("Hapus backup ini?")) return;
    setBusy(true);
    try {
      await deleteBackup(token, fileId);
      showToast("Backup dihapus");
      refreshBackups();
    } catch (e) {
      showToast(`Gagal hapus: ${e}`, "error");
    }
    setBusy(false);
  };

  const handleLogout = () => {
    gdriveLogout();
    setIsAuthed(false);
    setBackups([]);
    showToast("Putus dari Google Drive");
  };

  const togglePremium = () => {
    const next = !isPremium;
    setPremiumStatus(next);
    setIsPremium(next);
  };

  const handleAutoBackupToggle = () => {
    const next = { ...backupPrefs, autoBackup: !backupPrefs.autoBackup };
    setLocalPrefs(next);
    setBackupPrefs(next);
  };

  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <MaterialSymbol icon="cloud" className="text-primary" />
          <h2 className="text-headline-md font-bold text-on-surface">
            Backup Cloud
          </h2>
        </div>
        {isPremium && <PremiumBadge size="lg" />}
      </div>

      {!GOOGLE_CLIENT_ID && (
        <p className="text-body-md text-on-surface-variant mb-4 bg-warning-container/10 border border-warning/20 rounded-xl p-4">
          Google Client ID belum dikonfigurasi. Buat project di{" "}
          <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer"
             className="text-primary underline">Google Cloud Console</a>,
          aktifkan Google Drive API, buat OAuth client, lalu set <code className="bg-surface-container-high px-1 rounded">GOOGLE_CLIENT_ID</code> di
          components/GoogleDriveBackup.tsx.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-label-sm text-on-surface-variant">Mode Premium:</span>
        <button
          onClick={togglePremium}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            isPremium ? "bg-amber-400" : "bg-outline"
          }`}
        >
          <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
            isPremium ? "translate-x-[22px]" : "translate-x-0.5"
          }`} />
        </button>
        <span className="text-label-sm text-on-surface-variant">
          {isPremium ? "Aktif" : "Nonaktif"}
        </span>
      </div>

      {isPremium && (
        <>
          {!isAuthed ? (
            <button
              onClick={handleAuth}
              disabled={busy}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-label-md font-medium text-on-primary hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              <MaterialSymbol icon="login" size={16} />
              {busy ? "Menghubungkan..." : "Hubungkan ke Google Drive"}
            </button>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-label-sm text-success">
                  <MaterialSymbol icon="check_circle" size={16} /> Terhubung ke Google Drive
                </span>
                <button
                  onClick={handleLogout}
                  className="text-label-sm text-on-surface-variant hover:text-error transition-colors"
                >Putuskan</button>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleUpload}
                  disabled={busy}
                  className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-label-md font-medium text-on-primary hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  <MaterialSymbol icon="cloud_upload" size={16} />
                  {busy ? "Memproses..." : "Backup Sekarang"}
                </button>
                <button
                  onClick={refreshBackups}
                  className="flex items-center gap-2 rounded-xl border border-outline-variant px-5 py-2.5 text-label-md font-medium text-on-surface hover:bg-surface-container-low transition-all"
                >
                  <MaterialSymbol icon="refresh" size={16} />
                  Refresh
                </button>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <button
                  onClick={handleAutoBackupToggle}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    backupPrefs.autoBackup ? "bg-primary" : "bg-outline"
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    backupPrefs.autoBackup ? "translate-x-[18px]" : "translate-x-0.5"
                  }`} />
                </button>
                <span className="text-label-sm text-on-surface">Backup Otomatis</span>
              </label>

              {backupPrefs.lastBackupAt && (
                <p className="text-label-xs text-on-surface-variant">
                  Backup terakhir: {new Date(backupPrefs.lastBackupAt).toLocaleString("id-ID")}
                </p>
              )}

              {backups.length > 0 && (
                <div>
                  <h3 className="text-label-md font-bold mb-2 text-on-surface">Riwayat Backup</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {backups.map((f) => (
                      <div key={f.id} className="flex items-center justify-between rounded-xl bg-surface-container p-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-label-sm font-medium text-on-surface truncate">{f.name}</p>
                          <p className="text-label-xs text-on-surface-variant">
                            {new Date(f.createdAt).toLocaleString("id-ID")}
                          </p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={() => handleRestore(f.id)}
                            disabled={busy}
                            className="rounded-lg p-2 text-on-surface-variant hover:text-primary hover:bg-primary-container/30 transition-all"
                            title="Pulihkan"
                          >
                            <MaterialSymbol icon="restore" size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(f.id)}
                            disabled={busy}
                            className="rounded-lg p-2 text-on-surface-variant hover:text-error hover:bg-error-container/30 transition-all"
                            title="Hapus"
                          >
                            <MaterialSymbol icon="delete" size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {!isPremium && (
        <div className="text-center py-6">
          <MaterialSymbol icon="lock" size={32} className="text-outline mb-2" />
          <p className="text-label-md text-on-surface-variant mb-1">Fitur Premium</p>
          <p className="text-body-sm text-on-surface-variant/60">
            Backup ke Google Drive tersedia untuk pengguna premium.
          </p>
        </div>
      )}
    </div>
  );
}
