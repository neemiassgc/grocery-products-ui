import Head from "next/head"
import DataTable from "../modules/components/datatable"
import SearchableContainer from "../modules/components/searchable-container"
import { useEffect, useState } from "react"
import { warmup } from "../modules/net"
import { BiErrorCircle } from "react-icons/bi"

function App() {
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

  useEffect(() => {
      warmup(() => setLoading(false), () => {
        setError(true);
        setLoading(false);
      })
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
  const lineOfParams = window.location.href.split("?")[1];
  const setOfParams = lineOfParams ? lineOfParams.split("&") : [];
  for (const param of setOfParams) {
    const [key, __] = param.split("=");
    if (key === "code") return true;
  }
  return false;
}

export default App