import Head from 'next/head'
import Image from 'next/image'
import { Component } from "react"

class App extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <>
        <Header/>
        <div className="mt-32">
          <div className="w-fit mx-auto bg-gray-50 p-3 rounded-md shadow-md">
          </div>
        </div>
      </>
    )
  }
}

export default App