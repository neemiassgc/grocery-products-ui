import Head from 'next/head'
import Image from 'next/image'
import { Component } from "react"
import Table from "../components/table"
import { BsSearch } from "react-icons/bs"

function Header() {
  return (
    <header className="w-full h-8 bg-blue-600 flex items-center justify-center">
    </header>
  )
}

export default class App extends Component {
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