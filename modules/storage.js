export function saveAccessToken(token) {
  localStorage.setItem("access_token", token);
}

export function getAccessToken() {
  return localStorage.getItem("access_token");
}

export function removeAccessToken() {
  localStorage.removeItem("access_token");
}

export function saveRefreshToken(refreshToken) {
  localStorage.setItem("refresh_token", refreshToken);
}

export function removeRefreshToken() {
  localStorage.removeItem("refresh_token");
}

export function saveRootAuthUrl() {
  if (!getRootAuthUrl())
    localStorage.setItem("root_auth_url", "http://localhost:8080")
}

export function getRootAuthUrl() {
  return localStorage.getItem("root_auth_url");
}

export function saveUUID(uuid) {
  localStorage.setItem("uuid", uuid);
}

export function getUUID() {
  return localStorage.getItem("uuid");
}

export function removeUUID() {
  localStorage.removeItem("uuid");
}
