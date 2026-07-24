import { getEnv } from "@/lib/env";

function storageConfig() {
  const env = getEnv();
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase Storage chưa được cấu hình");
  }

  return {
    baseUrl: `${env.SUPABASE_URL}/storage/v1`,
    bucket: env.SUPABASE_STORAGE_BUCKET,
    serviceKey: env.SUPABASE_SERVICE_ROLE_KEY,
  };
}

function objectUrl(path: string): string {
  const { baseUrl, bucket } = storageConfig();
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  return `${baseUrl}/object/${encodeURIComponent(bucket)}/${encodedPath}`;
}

function authHeaders(): HeadersInit {
  const { serviceKey } = storageConfig();
  return {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
  };
}

export function isObjectStorageConfigured(): boolean {
  const env = getEnv();
  return Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function uploadObject(
  path: string,
  body: ArrayBuffer,
  contentType: string,
): Promise<void> {
  const response = await fetch(objectUrl(path), {
    method: "POST",
    headers: {
      ...authHeaders(),
      "Content-Type": contentType,
      "x-upsert": "false",
    },
    body,
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Storage upload thất bại (${response.status}): ${detail}`);
  }
}

export async function deleteObjects(paths: string[]): Promise<void> {
  if (paths.length === 0) return;

  const { baseUrl, bucket } = storageConfig();
  const response = await fetch(`${baseUrl}/object/${encodeURIComponent(bucket)}`, {
    method: "DELETE",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prefixes: paths }),
  });

  if (!response.ok && response.status !== 404) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Storage delete thất bại (${response.status}): ${detail}`);
  }
}

export async function createSignedObjectUrl(path: string, expiresIn = 3600): Promise<string> {
  const { baseUrl, bucket } = storageConfig();
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  const response = await fetch(
    `${baseUrl}/object/sign/${encodeURIComponent(bucket)}/${encodedPath}`,
    {
      method: "POST",
      headers: {
        ...authHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ expiresIn }),
    },
  );

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Không tạo được signed URL (${response.status}): ${detail}`);
  }

  const payload = (await response.json()) as { signedURL?: string; signedUrl?: string };
  const signedPath = payload.signedURL ?? payload.signedUrl;
  if (!signedPath) throw new Error("Storage không trả về signed URL");

  const env = getEnv();
  return signedPath.startsWith("http") ? signedPath : `${env.SUPABASE_URL}${signedPath}`;
}
