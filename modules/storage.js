export function saveAccessToken(token) {
  localStorage.setItem("access_token", token);
}

export function getAccessToken() {
  const accessToken = localStorage.getItem("access_token");
  return accessToken === "undefined" || !accessToken ? null : accessToken;
}

export function saveRefreshToken(refreshToken) {
  localStorage.setItem("refresh_token", refreshToken);
}

export function saveRootAuthUrl() {
  if (!getRootAuthUrl())
    localStorage.setItem("root_auth_url", "http://localhost:8080")
}

export function getRootAuthUrl() {
  const rootAuthUrl = localStorage.getItem("root_auth_url")
  return rootAuthUrl === "undefined" || !rootAuthUrl ? null : rootAuthUrl;
}

export function saveUUID(uuid) {
  localStorage.setItem("uuid", uuid);
}

export function getUUID() {
  const uuid = localStorage.getItem("uuid");
  return uuid === "undefined" || !uuid ? null : uuid;
}
