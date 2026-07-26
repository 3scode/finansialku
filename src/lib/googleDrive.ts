import type { BackupData } from "./types";
import { exportBackup, importBackup, getGoogleDriveToken, setGoogleDriveToken, clearGoogleDriveToken } from "./store";

const SCOPES = "https://www.googleapis.com/auth/drive.file";
const API_BASE = "https://www.googleapis.com/drive/v3";
const MIME_JSON = "application/json";
const BACKUP_FOLDER = "FinansialKu Backups";

export let gapiLoaded = false;
let tokenClient: google.accounts.oauth2.TokenClient | null = null;
let authCallback: ((token: string) => void) | null = null;

export function setGoogleConfig(clientId: string) {
  if (typeof window === "undefined") return;
  const script = document.createElement("script");
  script.src = "https://accounts.google.com/gsi/client";
  script.async = true;
  script.onload = () => {
    gapiLoaded = true;
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPES,
      callback: (resp) => {
        if (resp.access_token) {
          setGoogleDriveToken(resp.access_token);
          authCallback?.(resp.access_token);
          authCallback = null;
        }
      },
    });
  };
  document.head.appendChild(script);
}

export function authenticate(): Promise<string> {
  return new Promise((resolve, reject) => {
    const existing = getGoogleDriveToken();
    if (existing) return resolve(existing);

    if (!tokenClient) return reject("Google belum siap. Coba lagi.");

    authCallback = (token) => resolve(token);
    try {
      tokenClient.requestAccessToken({ prompt: "consent" });
    } catch (e) {
      authCallback = null;
      reject(`Gagal autentikasi: ${e}`);
    }
  });
}

function headers(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": MIME_JSON,
  };
}

async function getOrCreateFolder(token: string): Promise<string> {
  const q = encodeURIComponent(`mimeType='application/vnd.google-apps.folder' and name='${BACKUP_FOLDER}' and trashed=false`);
  const res = await fetch(`${API_BASE}/files?q=${q}&fields=files(id,name)`, { headers: headers(token) });
  const data = await res.json();
  if (data.files?.length) return data.files[0].id;
  const create = await fetch(`${API_BASE}/files`, {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify({ name: BACKUP_FOLDER, mimeType: "application/vnd.google-apps.folder" }),
  });
  const folder = await create.json();
  return folder.id;
}

export async function uploadBackup(token: string, note?: string): Promise<string> {
  const data = exportBackup();
  const filename = `finansialku-backup-${new Date().toISOString().split("T")[0]}.json`;

  const folderId = await getOrCreateFolder(token);
  const body = JSON.stringify({
    name: filename,
    parents: [folderId],
    description: note || "",
  });

  const create = await fetch(`${API_BASE}/files`, {
    method: "POST",
    headers: { ...headers(token), "X-Upload-Content-Type": MIME_JSON },
    body,
  });
  const file = await create.json();

  const upload = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${file.id}?uploadType=media`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": MIME_JSON },
    body: JSON.stringify(data),
  });
  if (!upload.ok) {
    const err = await upload.text().catch(() => "");
    throw new Error(`Gagal upload backup: ${upload.status} ${err}`);
  }

  return file.id;
}

export async function listBackups(token: string): Promise<{ id: string; name: string; createdAt: string }[]> {
  const folderId = await getOrCreateFolder(token);
  const q = encodeURIComponent(`'${folderId}' in parents and trashed=false`);
  const res = await fetch(`${API_BASE}/files?q=${q}&fields=files(id,name,createdTime)&orderBy=createdTime desc`, {
    headers: headers(token),
  });
  const data = await res.json();
  return (data.files || []).map((f: { id: string; name: string; createdTime: string }) => ({
    id: f.id,
    name: f.name,
    createdAt: f.createdTime,
  }));
}

export async function downloadBackup(token: string, fileId: string): Promise<BackupData> {
  const res = await fetch(`${API_BASE}/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Gagal download backup");
  return res.json();
}

export async function deleteBackup(token: string, fileId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/files/${fileId}`, {
    method: "DELETE",
    headers: headers(token),
  });
  if (!res.ok) throw new Error("Gagal hapus backup");
}

export async function restoreBackup(token: string, fileId: string): Promise<string> {
  const data = await downloadBackup(token, fileId);
  const result = importBackup(data, "replace");
  return result.message;
}

export function logout(): void {
  clearGoogleDriveToken();
}
