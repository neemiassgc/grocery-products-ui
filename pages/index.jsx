import Head from "next/head"
import DataTable from "../modules/components/datatable"
import SearchableContainer from "../modules/components/searchable-container"
import { useEffect, useState } from "react"
import CircularProgress from "@mui/material/CircularProgress"

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

function PageLoading({component}) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      setTimeout(() => setLoading(false), 5000)
  }, [])

  return <>
    {
      loading ?
      <div className="w-screen h-screen flex justify-center items-center">
        <CircularProgress color="success" size={200}/>
      </div> : component
    }
  </>
}

export default App