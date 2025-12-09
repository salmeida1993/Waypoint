export const api = async (url, options = {}) => {
  const res = await fetch("/api" + url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    credentials: "include",
    body: options.data ? JSON.stringify(options.data) : undefined,
  });

  const text = await res.text();
  console.log("API Response:", text);
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error("Invalid JSON response from server: " + text);
  }
  if (!res.ok) {
    throw new Error(data.message || "API request failed");
  }
  return data;
};
