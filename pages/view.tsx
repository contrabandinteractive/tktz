import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState } from "react";
import { useRouter } from 'next/router';
import ReactDOM from "react-dom";
import QRCode from "react-qr-code";
import { setCookie, getCookie, hasCookie } from 'cookies-next';

var xummAddress;
var payload;



const ViewPage: NextPage = ({ predata, nftresultjson, hostURL }) => {

  const signIn = async () => {
    const data = {
      eid: "0",
      currentPage: 'view',
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
  
  
  const getNfts = async () => {
      const data = {
        walletAddress: xummAddress
      }
      const JSONdata = JSON.stringify(data)
  
      const endpoint = '/api/get_nfts'
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSONdata,
      }
      const response = await fetch(endpoint, options)
      const result = await response.json()
      console.log(result);
  }

  const [tickets, setTickets] = useState(nftresultjson);
  const [xummAddressDisplay, setXummAddressDisplay] = useState(predata);


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


        <p className="mt-3 text-2xl">
          View Tickets
        </p>

        <div className="mt-6 flex max-w-4xl flex-wrap items-center justify-around sm:w-full">
                
                

                {xummAddressDisplay!=null &&
                    <>
                        <div className="w-full">Tickets found for Wallet<br></br>{xummAddressDisplay}</div>

                        <div>
                          {tickets.finalNfts.map((item, i) => (
                            <div className="card bg-transparent text-primary-content tickets-card place-content-center mb-[20px]">
                              <div className="card-body block content-center mx-0 my-auto place-content-center">
                                <h2 className="card-title snap-center mx-0 my-auto place-content-center pb-[20px]">{item.name}</h2>
                                <p className="text-sm">{item.isUsed} Token ID: <span className="truncate text-xs text-ellipsis overflow-hidden max-w-[200px] block place-content-center float-right">{item.tokenId}</span></p>
                                <div className="card-actions block place-content-center pt-[20px] pb-[20px]">
                                {(item.isUsed!=true) ? <label htmlFor={ `my-modal-${item.tokenId}` } className="btn modal-button border-[#e0d196]">QR Code</label> : <button class="btn" disabled="disabled">Already used</button>}
                                      <input type="checkbox" id={ `my-modal-${item.tokenId}` } className="modal-toggle" />
                                      <div className="modal">
                                        <div className="modal-box">
                                          <h3 className="font-bold text-lg">Scan For Entry</h3>
                                          <div className="grid place-items-center">
                                            <QRCode value={ `https://tktz.wtf/scan?tokenId=${item.tokenId}` } />
                                            <div className="pt-[10px]"><p className="text-lg text-black"><Link href={ `https://tktz.wtf/scan?tokenId=${item.tokenId}` }>Or follow this link to scan.</Link></p></div>
                                          </div>
                                          <div className="modal-action">
                                            <label htmlFor={ `my-modal-${item.tokenId}` } className="btn">Close</label>
                                          </div>
                                        </div>
                                      </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                    </>
                }
                
                {xummAddressDisplay==null &&
                    <div className="pt-[20px] clear-both w-full"><button className="btn" onClick={signIn}>Sign in with XUMM</button></div>
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

  var hostURL;
      if(context.req.headers.host=="localhost:3000"){
        hostURL = 'http://localhost:3000';
      }
      else{
        hostURL = 'https://'+context.req.headers.host;
  }



  var predata = null;
  
   // check if cookie exists
   var cookieWalletAddress;
   let options = {
    req: context.req,
    res: context.res
   }
   if( hasCookie('cookieWalletAddress',options) ){
    cookieWalletAddress = getCookie('cookieWalletAddress',options);
   }
  
  predata = cookieWalletAddress;


  
  // Get NFTs
  const nftdata = {
    walletAddress: cookieWalletAddress
  }
  const nftJSONdata = JSON.stringify(nftdata)

  var nftendpoint;
    if(context.req.headers.host=="localhost:3000"){
      nftendpoint = 'http://localhost:3000/api/get_nfts'
    }
    else{
      nftendpoint = 'https://'+context.req.headers.host+'/api/get_nfts'
  }

  //const nftendpoint = 'http://localhost:3000/api/get_nfts'
  const nftoptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: nftJSONdata,
  }
  const nftresponse = await fetch(nftendpoint, nftoptions)
  let nftresult = await nftresponse.json()
  //const nftresultjson = JSON.parse(nftresult)
  const nftresultjson = nftresult;
  console.log("nftresultjson "+nftresultjson);

  return { props: { predata, nftresultjson, hostURL } };
  
}

export default ViewPage
