import Head from "next/head"
import DataTable from "../modules/components/datatable"
import SearchableContainer from "../modules/components/searchable-container"
import { useEffect } from "react"
import { BiErrorCircle } from "react-icons/bi";
import { saveRootAuthUrl } from "../modules/storage";
import { useOauth2Flow } from "../modules/hooks";

function App() {
  useEffect(() => {
    saveRootAuthUrl();
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
  const { error, errorMessage, loading } = useOauth2Flow();

  const loader = <div className="w-screen h-screen flex justify-center items-center">
    <Spinner/>
  </div>

  const errorWarning = <div className="w-screen h-screen flex justify-center items-center">
    <div className="flex-col just">
      <span className="text-lg">{errorMessage?.length === 0 ? "It was not possible to connect to the server" : errorMessage}</span>
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

export default App