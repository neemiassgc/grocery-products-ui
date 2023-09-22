import { useState, useEffect } from "react"
import { requestAccessTokenUsingCode } from "../modules/net"
import { requestAccessTokenUsingRefreshToken } from "../modules/net"
import { createUUID } from "../modules/utils"
import { hitResourceServer } from "../modules/net"
import * as storage from "../modules/storage"

export function useSmallScreenMediaQuery() {
  const [smallScreen, setSmallScreen] = useState(false);

  useEffect(() => {
    if (!smallScreen && window.innerWidth <= 768) {
      setSmallScreen(true);
      return;
    }

    const updateSize = e => {
      if (e.matches && !smallScreen)
        setSmallScreen(true)
      else if (!e.matches && smallScreen)
        setSmallScreen(false)
    };
    let mediaQueryDetection = window.matchMedia("(max-width: 768px)");
    mediaQueryDetection.addEventListener("change", updateSize)

    return () => {
      if (mediaQueryDetection)
        mediaQueryDetection.removeEventListener("change", updateSize)
    }
  }, [smallScreen]);

  return smallScreen;
}

export function useOauth2Flow() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");


  const setErrorPageWithMessage = errorMessage => {
    setError(true);
    setLoading(false);
    setErrorMessage(errorMessage);
  }

  const showErrorScreenWithData = errorObj => {
    const {headers} = errorObj;
    if (wwwAuthenticateHeaderDoesNotExit(headers.entries())) return;
    const [typeOfError, errorMessage] = extractErrorDataFromWwwAuthenticateHeader(headers.entries())
    setErrorPageWithMessage(`${typeOfError}: ${errorMessage}`);
  }

  useEffect(() => {
    isThereValidAccessToken()
      .then(() => {
        hitResourceServer()
          .then(() => setLoading(false))
          .catch(errorObj => {
            if (errorObj instanceof TypeError) {
              setErrorPageWithMessage(`${errorObj.name}: ${error.message}`)
              return;
            }
            if (errorObj.status === 401) {
              requestAccessTokenUsingRefreshToken()
                .then(response => {
                  storage.saveAccessToken(response.access_token);
                  storage.saveRefreshToken(response.refresh_token);
                  window.location.reload();
                })
                .catch(resp => {
                  storage.removeAccessToken();
                  storage.removeRefreshToken();
                  showErrorScreenWithData(resp)
                })
              return;
            }
            showErrorScreenWithData(errorObj)
          })
      })
      .catch(() => {     
         if (isThereErrorQueryParam()) {
          const warningsMap = {
            access_denied: "Access Denied",
            invalid_scope: "Invalid scopes"
          }
          const errorValue = extractErrorFromUri();
          setErrorPageWithMessage(warningsMap[errorValue])
         }
         else if (isNotThereCodeQueryParam()) {
          const stateUUID = createUUID();
          storage.saveUUID(stateUUID);
          
          const authUrl = storage.getRootAuthUrl();
          const path = "/realms/security/protocol/openid-connect/auth";
          const params = createQueryParams({
            response_type: "code",
            client_id: "grocerystoreapp",
            scope: "grocerystoreapp",
            state: stateUUID,
            redirect_uri: window.location.href
          })
          window.location.href = authUrl + path + params
         }
         else {
          verifyStateQueryParam()
            .then(() => {
              const code = extractAuthCodeFromUri();
              requestAccessTokenUsingCode(code)
                .then(jsonObj => {
                  storage.saveAccessToken(jsonObj.access_token);
                  storage.saveRefreshToken(jsonObj.refresh_token);
                  hitResourceServer()
                    .then(() => setLoading(false))
                    .catch(showErrorScreenWithData)
                })
                .catch(({error, error_description}) => setErrorPageWithMessage(`${error}: ${error_description}`));
            })
            .catch(() => setErrorPageWithMessage("It was not possible to validate integrity"))
         }
        })
  }, [])

  return {
    loading,
    errorMessage,
    error
  }
}

function wwwAuthenticateHeaderDoesNotExit(entries) {
  return extractWwwAuthenticateHeader(entries) === null;
}

function extractErrorDataFromWwwAuthenticateHeader(entries) {
  const wwwAuthenticateHeader = extractWwwAuthenticateHeader(entries);
  const pairOfData = wwwAuthenticateHeader.split(",");
  const typeOfError = pairOfData[0].split("=")[1].replaceAll("\"", "");
  const errorMessage = pairOfData[1].split("=")[1].replaceAll("\"", "");
  return [typeOfError, errorMessage];
}

function extractWwwAuthenticateHeader(entries) {
  for (const [header, value] of entries) {
    if (header === "www-authenticate")
      return value;
  }
  return null;
}

function verifyStateQueryParam() {
  return new Promise((resolve, reject) => {
    if (isNotThereStateParam()) {
      reject("State value does not exits");
      return;
    }

    const storedUUID = storage.getUUID();
    if (!storedUUID) {
      reject("State value not generated yet");
      return;
    }

    const state = extractStateFromUri();
    if (state === storedUUID) resolve();
    else reject("State value is not valid");
  });
}

function isThereValidAccessToken() {
  return new Promise((res, rej) => {
    const accessToken = storage.getAccessToken();
    if (accessToken) res();
    else rej();
  });
}

function isThereErrorQueryParam() {
  return extractErrorFromUri() !== null;
}

function extractErrorFromUri() {
  return extractParamFromUri("error")
}

function isNotThereCodeQueryParam() {
  return extractAuthCodeFromUri() === null;
}

function extractAuthCodeFromUri() {
  return extractParamFromUri("code");
}

function isNotThereStateParam() {
  return extractStateFromUri() === null;
}

function extractStateFromUri() {
  return extractParamFromUri("state")
}

function extractParamFromUri(paramToExtract) {
  const lineOfParams = window.location.href.split("?")[1];
  const setOfParams = lineOfParams ? lineOfParams.split("&") : [];
  for (const param of setOfParams) {
    const [key, value] = param.split("=");
    if (key === paramToExtract)
      return value.length === 0 ? null : value;
  }
  return  null;
}

function createQueryParams(obj) {
  const params = [];
  for (let param in obj)
    params.push(`${param}=${obj[param]}`)
  return "?"+params.join("&");
}