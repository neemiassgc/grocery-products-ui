import Head from "next/head"
import DataTable from "../modules/components/datatable"
import SearchableContainer from "../modules/components/searchable-container"
import { useEffect, useState } from "react"
import { hitResourceServer } from "../modules/net"
import { BiErrorCircle } from "react-icons/bi";
import { requestAccessTokenUsingCode } from "../modules/net"
import { requestAccessTokenUsingRefreshToken } from "../modules/net"
import { createUUID } from "../modules/utils"
import * as storage from "../modules/storage"

function App() {
  useEffect(() => {
    storage.saveRootAuthUrl();
  }, [])

  return <>
      <Head>
        <title>Grocery products ui</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width"/>
      </Head>
      <PageLoading>
        <header className="w-full bg-blue-500 flex h-0 md:h-72"/>
        <main className=" mt-3 md:-mt-52 flex justify-center">
          <div className="basis-full md:basis-11/12 h-[38rem] shadow-none md:shadow-2xl p-3 md:p-5 border-0 md:border rounded-md flex flex-col gap-2 bg-white">
            <SearchableContainer/>
            <DataTable/>
          </div>
        </main>
      </PageLoading>
  </>
}

function PageLoading({children}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const accessToken = storage.getAccessToken();

    if (!accessToken) {
      if (isThereErrorParam()) {
        const warningsMap = {
          access_denied: "Access Denied",
          invalid_scope: "Invalid scopes"
        }
        const errorValue = extractErrorFromUri();
        setErrorMessage(warningsMap[errorValue]);
        setError(true)
        setLoading(false)
      }
      else if (isNotThereCodeParam()) {
        const stateUUID = createUUID();
        storage.saveUUID(stateUUID);
        
        const authUrl = storage.getRootAuthUrl();
        const path = "/realms/security/protocol/openid-connect/auth";
        const params = "?response_type=code&client_id=grocerystoreapp&scope=grocerystoreapp&state="+stateUUID+"&=redirect_uri="+window.location.href;
        window.location.href = authUrl+path+params
      }
      else {
        stateValidationForCsrfProtection()
        .then(() => {
          const code = extractAuthCodeFromUri();
          requestAccessTokenUsingCode(code)
            .then(jsonObj => {
              storage.saveAccessToken(jsonObj.access_token);
              storage.saveRefreshToken(jsonObj.refresh_token);
              hitResourceServer()
                .then(() => setLoading(false))
                .catch(error => {
                  setError(true);
                  setLoading(false);
                  setErrorMessage(error);
                })
            })
            .catch(errorObj => {
              console.log(errorObj)
              setError(true);
              setLoading(false);
              setErrorMessage(errorObj.error_description);
            })
        })
        .catch(errorMessage => {
          setError(true);
          setLoading(false);
          setErrorMessage(errorMessage);
        })
      }
    }
    else {
      hitResourceServer()
        .then(() => setLoading(false))
        .catch((err) => {
          if (err instanceof TypeError) {
            setError(true);
            setLoading(false);
            setErrorMessage(`${err.name}: ${err.message}`);
            return;
          }
          requestAccessTokenUsingRefreshToken()
            .then(response => {
              console.log("saving refresh token")
              storage.saveAccessToken(response.access_token);
              storage.saveRefreshToken(response.refresh_token);
              window.location.reload();
            })
            .catch(error => {
              storage.saveAccessToken(null)
              setError(true);
              setLoading(false);
              setErrorMessage(error);
            })
        })
    }
  }, [])

  const loader = <div className="w-screen h-screen flex justify-center items-center">
    <Spinner/>
  </div>

  const errorWarning = <div className="w-screen h-screen flex justify-center items-center">
    <div className="flex-col just">
      <span className="text-lg">It was not possible to connect to the server</span>
      <div className="w-full">
        <BiErrorCircle className="w-28 h-28 text-red-600 m-auto"/>
      </div>
    </div>
  </div>

  return <>
    {
      loading ? loader : error ? errorWarning : children
    }
  </>
}

function Spinner() {
  return <>
    <span className="loader"></span>
  </>
}

function containsCodeParam() {
function stateValidationForCsrfProtection() {
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

function isThereErrorParam() {
  return extractErrorFromUri() !== null
}

function extractErrorFromUri() {
  return extractParamFromUri("error")
}
  const lineOfParams = window.location.href.split("?")[1];
  const setOfParams = lineOfParams ? lineOfParams.split("&") : [];
  for (const param of setOfParams) {
    const [key, __] = param.split("=");
    if (key === "code") return true;
  }
  return false;
}

export default App