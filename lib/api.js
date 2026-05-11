const DEFAULT_API = "https://namescout.dev";

async function callApi(path) {
  const base = process.env.NAMESCOUT_API || DEFAULT_API;
  const url = `${base.replace(/\/$/, "")}${path}`;
  let response;
  try {
    response = await fetch(url, { headers: { Accept: "application/json", "User-Agent": "namescout-cli" } });
  } catch (err) {
    throw new Error(`Network error: ${err.message}`);
  }

  if (response.status === 429) {
    const retryAfter = response.headers.get("retry-after") ?? "60";
    throw new Error(`Rate limit exceeded. Try again in ${retryAfter}s.`);
  }

  if (!response.ok) {
    let detail = "";
    try {
      const body = await response.json();
      detail = body?.error ? `: ${body.error}` : "";
    } catch {
      // ignore
    }
    throw new Error(`API returned ${response.status}${detail}`);
  }

  return response.json();
}

export function fetchReport(query, mode) {
  return callApi(`/api/v1/check?q=${encodeURIComponent(query)}&mode=${encodeURIComponent(mode)}`);
}

export function fetchSuggestions(query, mode, count) {
  return callApi(
    `/api/v1/suggest?q=${encodeURIComponent(query)}&mode=${encodeURIComponent(mode)}&count=${count}`,
  );
}
