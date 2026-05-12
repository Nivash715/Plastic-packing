const configuredApiUrl = import.meta.env.VITE_API_BASE_URL;

function getApiBaseUrls() {
  if (configuredApiUrl) return [configuredApiUrl];

  const urls = ["http://127.0.0.1:8000", "http://localhost:8000"];

  if (typeof window !== "undefined") {
    urls.unshift(`${window.location.protocol}//${window.location.hostname}:8000`);
  }

  return [...new Set(urls)];
}

export async function apiRequest(path, options = {}) {
  let response;
  let lastNetworkError;

  for (const baseUrl of getApiBaseUrls()) {
    try {
      response = await fetch(`${baseUrl}${path}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
      });
      break;
    } catch (err) {
      lastNetworkError = err;
    }
  }

  if (!response) {
    throw new Error(
      `Cannot connect to backend on port 8000. Checked ${getApiBaseUrls().join(", ")}.`,
      { cause: lastNetworkError },
    );
  }

  if (!response.ok) {
    let message = "Request failed. Please try again.";
    try {
      const data = await response.json();
      message = data.detail || message;
    } catch {
      message = response.statusText || message;
    }
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export function uniqueBy(rows, getKey) {
  const seen = new Set();
  return rows.filter((row) => {
    const key = getKey(row);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function downloadCsv(filename, rows) {
  if (!rows.length) return;

  const headers = Object.keys(rows[0]);
  const escapeCell = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  const csv = [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => escapeCell(row[header])).join(",")),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
