import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState } from "react";
import { useRouter } from 'next/router';
import ReactDOM from "react-dom";






const ScanPage: NextPage = ({ predata, hostURL }) => {

  const [statusMsg] = useState(predata);


  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <Head>
        <title>TKTZ</title>
        <link rel="icon" href="/favicon.ico" />
        <style>
        @import url('https://fonts.googleapis.com/css2?family=Poiret+One&display=swap');
        </style>
      </Head>

      <main className="flex w-full flex-1 flex-col items-center justify-center px-20 text-center">
        <Link href="/"><h1 className="text-6xl font-bold cursor-pointer">
          TKTZ
        </h1></Link> 

        <div className="mt-6 flex max-w-4xl flex-wrap items-center justify-around sm:w-full">
                    <p>{statusMsg}</p>
        </div>
      </main>
      <footer>
        <div className="mt-[40px] grid place-content-center text-center cursor-pointer">
          <p><Link href="/"><Image src="/images/home.png" width="80" height="80" /></Link></p>
          <p className="text-sm pt-[20px]">By <Link href="https://contrabandinteractive.com">Contraband Interactive</Link></p>
        </div>
      </footer>

    </div>
  )
}


export async function getServerSideProps(context) {

  var hostURL;
      if(context.req.headers.host=="localhost:3000"){
        hostURL = 'http://localhost:3000';
      }
      else{
        hostURL = 'https://'+context.req.headers.host;
  }
  
  let predata;
  if(typeof context.query.tokenId !== 'undefined'){
      const data = {
        tokenId: context.query.tokenId
      }
      const JSONdata = JSON.stringify(data)

      var endpoint;
      if(context.req.headers.host=="localhost:3000"){
        endpoint = 'http://localhost:3000/api/scan_ticket'
      }
      else{
        endpoint = 'https://'+context.req.headers.host+'/api/scan_ticket'
      }
  

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSONdata,
      }
      const response = await fetch(endpoint, options)
      const result = await response.json()
      predata = result.status
  }
  
  return { props: { predata, hostURL } };
  
}

export default ScanPage
