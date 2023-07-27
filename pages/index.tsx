import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from "react";
import { useRouter } from 'next/router';
import { setCookie, getCookie, hasCookie } from 'cookies-next';


const Home: NextPage = ({ predata, hostURL }) => {


  const [cookieWalletAddress,setCookieWalletAddress] = useState( predata.cookieWalletAddress );



  const signIn = async () => {
    const data = {
      eid: 0,
      currentPage: 'index',
      hostURL: hostURL
    }
    const JSONdata = JSON.stringify(data)

    const endpoint = '/api/sign_in'
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSONdata,
    }
    const response = await fetch(endpoint, options)
    const result = await response.json()
    //window.open(result.signURL, '_blank').focus();
    window.location.href = result.signURL;
  }


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


        <p className="mt-3 text-xl md:text-2xl">
          An XRPL-powered event ticking solution.
        </p>

        <div className="mt-6 flex max-w-4xl flex-wrap items-center justify-around sm:w-full">
        {cookieWalletAddress != null &&
        <ul className="menu w-56 bg-black text-white p-2 rounded-box">
          <li><Link href="/create">Create Event</Link></li>
          <li><Link href="/events">Event Listings</Link></li>
          <li><Link href="/view">View My Tickets</Link></li>
        </ul>
        }

        {cookieWalletAddress == null &&
          <button className="btn" onClick={signIn}>Sign in with XUMM</button>
        }
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

      var cookieWalletAddress;

      let options = {
        req: context.req,
        res: context.res
      }

      if(context.query.payload!=null){
            // Verify sign in and generate server cookie
            const verifydata = {
              payload: context.query.payload
            }
            const verifyJSONdata = JSON.stringify(verifydata)

            var verifyendpoint;
            if(context.req.headers.host=="localhost:3000"){
              verifyendpoint = 'http://localhost:3000/api/verify_sign_in'
            }
            else{
              verifyendpoint = 'https://'+context.req.headers.host+'/api/verify_sign_in'
            }
        
            //const verifyendpoint = 'http://localhost:3000/api/verify_sign_in'
            const verifyoptions = {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: verifyJSONdata,
            }
            const verifyresponse = await fetch(verifyendpoint, verifyoptions)
            const verifyresult = await verifyresponse.json()
            
            cookieWalletAddress = verifyresult.walletAddress;

            setCookie('cookieWalletAddress',cookieWalletAddress,options);
            console.log('cookie set for '+cookieWalletAddress);
               
      }

  

            
            if( hasCookie('cookieWalletAddress',options) ){
             cookieWalletAddress = getCookie('cookieWalletAddress',options);
            }
     



      var predata;

      var hostURL;
      if(context.req.headers.host=="localhost:3000"){
        hostURL = 'http://localhost:3000';
      }
      else{
        hostURL = 'https://'+context.req.headers.host;
      }

      
      if( cookieWalletAddress != null ){
        console.log('cookie exists 670');
        predata = {
          cookieWalletAddress: cookieWalletAddress
        }
      }else{
        predata = {
          cookieWalletAddress: null
        }
      }

     return { props: { predata, hostURL } }
}

export default Home
