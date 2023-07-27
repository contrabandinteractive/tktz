import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState } from "react";
import { useRouter } from 'next/router';

var txValid;


const CreatePage: NextPage = ({ predata, hostURL }) => {


  const [theProgress, setTheProgress] = useState(predata);
  const [eventId, setEventId] = useState('');
  const [currentMintedTicket, setCurrentMintedTicket] = useState('');
  //const [allowMint, setAllowMint] = useState(predata.finalStatus);

  var router = useRouter();
  let eventName = router.query["eventName"];
  let ticketsNum = router.query["ticketsNum"];
  let ticketPrice = router.query["ticketPrice"];
  let xrplWallet = router.query["xrplWallet"];
  let xrplEventDate = router.query["xrplEventDate"];

  
  // NEW MINTING FUNCTION
  const mintBtn = async (event) => {
    event.preventDefault();
    // Show Loading screen
    setTheProgress(2);

    const data = {
      xrplEventName: eventName,
      xrplTicketsNum: ticketsNum,
      xrplTicketPrice: ticketPrice,
      xrplWallet: xrplWallet,
      xrplEventDate: xrplEventDate
    }

    const JSONdata = JSON.stringify(data)
  
    const endpoint = '/api/create_event'
  
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSONdata,
    }
  
    const response = await fetch(endpoint, options)
    const result = await response.json()
    let neweventid = result.eventId;
    setEventId(result.eventId);
    console.log("Event Id: "+result.eventId);

    // Run single minting for as many tickets set
    const single_endpoint = '/api/create_single'
    const single_data = {
      xrplEventName: eventName,
      xrplTicketsNum: ticketsNum,
      xrplTicketPrice: ticketPrice,
      xrplWallet: xrplWallet,
      eventId: neweventid
    }
    console.log(single_data);
    const single_JSONdata = JSON.stringify(single_data)

    const single_options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: single_JSONdata,
    }
    

    let currentStep = 1;
    let ticketNum = parseInt(ticketsNum);
    for (let step = 0; step < ticketNum; step++) {
      const single_response = await fetch(single_endpoint, single_options)
      const single_result = await single_response.json()
      setTheProgress(3);
      setCurrentMintedTicket(currentStep);
      console.log("Minting ticket " + currentStep);
      currentStep++;
    }
    setTheProgress(4);

  };
  

  
  
  const payTktz = async (event) => {
    event.preventDefault();
    const data = {
      xrplEventName: document.getElementById("xrplEventName").value,
      xrplTicketsNum: document.getElementById("xrplTicketsNum").value,
      xrplTicketPrice: document.getElementById("xrplTicketPrice").value,
      xrplWallet: document.getElementById("xrplWallet").value,
      xrplEventDate: document.getElementById("xrplEventDate").value,
      hostURL: hostURL
      }
      const JSONdata = JSON.stringify(data)
  
      const endpoint = '/api/pay_tktz'
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSONdata,
      }
      const response = await fetch(endpoint, options)
      const result = await response.json()
      window.location.href = result.signURL;
  };


  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <Head>
        <title>TKTZ</title>
        <link rel="icon" href="/favicon.ico" />
        <style>
        @import url('https://fonts.googleapis.com/css2?family=Poiret+One&display=swap');
        </style>
      </Head>

      <main className="flex w-full flex-1 flex-col items-center justify-center text-center">
        <Link href="/"><h1 className="text-6xl font-bold cursor-pointer">
          TKTZ
        </h1></Link>


        <p className="mt-3 text-xl md:text-2xl">
          Create your event and mint your NFT tickets!
        </p>

        <div className="mt-6 flex max-w-4xl flex-wrap items-center justify-around sm:w-full">
                {theProgress < 1 &&
                <div>
                <form>


                    <div className="form-control w-full max-w-xs">
                        <p>XRPL Wallet Address</p>
                        <input type="text" id="xrplWallet" name="xrplWallet" placeholder="To receive sales proceeds" className="input input-bordered w-full max-w-xs text-[16px] bg-zinc-800 text-[#e0d196]" />
                        <label className="label">
                        </label>
                    </div>
                    <div className="form-control w-full max-w-xs">
                        <p>Event Name</p>
                        <input type="text" id="xrplEventName" name="xrplEventName" placeholder="Your Event Name" className="input input-bordered w-full max-w-xs bg-zinc-800 text-[#e0d196] text-[16px]" />
                        <label className="label">
                        </label>
                    </div>
                    <div className="form-control w-full max-w-xs">
                        <p>Number of Tickets</p>
                        <input type="text" id="xrplTicketsNum" name="xrplTicketsNum" placeholder="# of tickets" className="input input-bordered w-full max-w-xs bg-zinc-800 text-[#e0d196] text-[16px] text-center w-[100px] mx-auto my-0" />
                        <label className="label">
                        </label>
                    </div>
                    <div className="form-control w-full max-w-xs">
                        <p>Ticket Price (in XRP)</p>
                        <input type="text" id="xrplTicketPrice" name="xrplTicketPrice" placeholder="Price" className="input input-bordered w-full max-w-xs bg-zinc-800 text-[#e0d196] text-[16px] text-center w-[100px] mx-auto my-0" />
                        <label className="label">
                        </label>
                    </div>
                    <div className="form-control w-full max-w-xs">
                        <p>Event Date</p>
                        <input type="date" id="xrplEventDate" name="xrplEventDate" placeholder="Date" className="input input-bordered w-full max-w-xs bg-zinc-800 text-[#e0d196] text-[16px] text-center" />
                        <label className="label">
                        </label>
                    </div>
                    <div className="form-control w-full max-w-xs pt-[15px]">
                        <p className="text-lg">TKTZ charges a 25 XRP fee to create your event. Additionally, we also take 1% of each ticket sale. You are sent payment every time someone buys one of your tickets.</p>
                    </div>
                    <div className="form-control w-full max-w-xs pt-[30px]">
                        <input className="text-lg cursor-pointer" type="submit" id="xrplSubmit" name="xrplSubmit" value="Proceed" onClick={payTktz} />
                    </div>
                </form>
                </div>
                }

                {theProgress == 1 &&
                <>
                  <div className="mt-[20px] grid place-content-center w-full">
                    <p className="text-lg">Let's begin!</p>
                    <p className="text-lg">Minting tickets for {eventName}</p>
                    <p className="text-lg">{ticketsNum} tickets at {ticketPrice} XRP each.</p>
                    <p className="text-lg">Please note that each ticket takes roughly 4 seconds to create.</p>
                  </div>
                  <div className="mt-[20px] grid place-content-center w-full">
                        <input className="text-lg cursor-pointer" type="submit" id="xrplSubmit" name="xrplSubmit" value="Begin Minting!" onClick={mintBtn} />
                  </div>
                </>
                }

                {theProgress == 2 &&
                <>
                  <div>
                    <p className="text-lg">Minting tickets and making them available for purchase. Please wait...</p>
                    <p className="text-lg">Tickets are minting to a custodial wallet and may take up to a few minutes to complete depending on the amount.</p>
                   
                  </div>
                  <div className="mt-[40px] grid place-content-center">
                    <p><Image src="/images/artdeco-load.gif" width="80" height="80" /></p>
                  </div>
                </>
                }
                {theProgress == 3 &&
                <>
                  <div>
                    <p className="text-lg">Minting tickets and making them available for purchase. Please wait...</p>
                    <p className="text-lg">Tickets are minting to a custodial wallet and may take up to a few minutes to complete depending on the amount.</p>
                    <p className="text-xl">Minting Ticket {currentMintedTicket} of {ticketsNum}...</p>
                  </div>
                  <div className="mt-[40px] grid place-content-center">
                    <p><Image src="/images/artdeco-load.gif" width="80" height="80" /></p>
                  </div>
                </>
                }
                {theProgress == 4 &&
                <div>
                  <p className="text-lg">Finished!</p>
                  <p className="underline underline-offset-8"><Link href={ '/buy/?id=' + eventId }>Click here to see your tickets &rarr;</Link></p>
                </div>
                }
        </div>
        <footer>
          <div className="mt-[40px] grid place-content-center text-center cursor-pointer">
            <p><Link href="/"><Image src="/images/home.png" width="80" height="80" /></Link></p>
            <p className="text-sm pt-[20px]">By <Link href="https://contrabandinteractive.com">Contraband Interactive</Link></p>
          </div>
        </footer>
      </main>


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

  if(context.query.payload!=null){
      const data = {
        payload: context.query.payload
      }
      const JSONdata = JSON.stringify(data)

      var endpoint;
      if(context.req.headers.host=="localhost:3000"){
        endpoint = 'http://localhost:3000/api/verify_tktz_payment'
      }
      else{
        endpoint = 'https://'+context.req.headers.host+'/api/verify_tktz_payment'
      }
  
      //const endpoint = 'http://localhost:3000/api/verify_tktz_payment'
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSONdata,
      }
      const response = await fetch(endpoint, options)
      const result = await response.json()

      let predata = 0;

      if(context.query.adminoverride==1){
        predata=1;
      }

      if(result.finalStatus==true){
        predata=1;
      }

      return { props: { predata, hostURL } }
  }else{
      let predata = 0;
      return { props: { predata, hostURL } };
  }
}

export default CreatePage
