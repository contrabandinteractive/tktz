import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from "react";
import { useRouter } from 'next/router';
import { setCookie, getCookie, hasCookie } from 'cookies-next';


const BuyPage: NextPage = ({ predata, hostURL }) => {


  const [eventId, setEventId] = useState(predata.eid);
  const [eventName, setEventName] = useState(predata.name);
  const [eventDate, setEventDate] = useState(predata.eventDate);
  const [totalTickets, setTotalTickets] = useState(predata.totalCount);
  //const [payload,setPayload] = useState(predata.payload);
  const [purchaseCompleted, setPurchaseCompleted] = useState(predata.verified);
  const [xummAddressDisplay, setXummAddressDisplay] = useState(predata.wallet);



  const signIn = async () => {
    const data = {
      eid: eventId,
      currentPage: 'buy',
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

  const generateBuy = async () => {
    const data = {
      eid: eventId,
      xummAddress: xummAddressDisplay,
      hostURL: hostURL
    }
    console.log(data);
    const JSONdata = JSON.stringify(data)

    const endpoint = '/api/buy_ticket'
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

      <main className="flex w-full flex-1 flex-col items-center justify-center px-20 text-center">
        <Link href="/"><h1 className="text-6xl font-bold cursor-pointer">
          TKTZ
        </h1></Link>


        <div className="mt-6 flex max-w-4xl flex-wrap items-center justify-around sm:w-full">
            {(predata!=null && purchaseCompleted==0) &&
            <>
              <div>
                <p className="pb-[20px] text-2xl">{eventName}</p>
                <p className="pb-[20px] text-lg">Event Date: {eventDate}</p>
                <p className="text-lg">There are {totalTickets} tickets available for sale.</p>
              </div>

              
              
                {(() => {
                  if (xummAddressDisplay!=null) {
                    if(totalTickets>0){
                      return <div className="pt-[20px] clear-both w-full"><p className="text-sm pb-[20px]">Your XUMM wallet:<br/>{xummAddressDisplay}</p><button className="btn" onClick={generateBuy}>Buy Ticket</button></div>;
                    }
                    else{
                      return <div className="pt-[20px] clear-both w-full"></div>
                    }
                  } else {
                    return <div className="pt-[20px] clear-both w-full"><p className="pb-[20px] text-lg">Please sign in to buy a ticket.</p><button className="btn" onClick={signIn}>Sign in with XUMM</button></div>;
                  }
                })()}
              
              
                {/*
                <div className="pt-[20px] clear-both w-full">
                  <button class="btn" onClick={generateBuy}>Buy Ticket</button>
                </div>
                */}
              
            </>
            }

            {/* Thank you page */}
            {(purchaseCompleted==1) &&
            <>
              <div>
                <p>Thanks for buying a ticket to {eventName}!</p>
                <div className="pt-[20px] clear-both w-full"><Link href="/view"><button class="btn">View My Tickets</button></Link></div>
              </div>

              
            </>
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
  let predata;
  let eventName;
  let totalCount;
  let eventDate;

  var hostURL;
      if(context.req.headers.host=="localhost:3000"){
        hostURL = 'http://localhost:3000';
      }
      else{
        hostURL = 'https://'+context.req.headers.host;
  }


  if(context.query.id!=null){
      const data = {
        eid: context.query.id
      }
      const JSONdata = JSON.stringify(data)

      var endpoint;
      if(context.req.headers.host=="localhost:3000"){
        endpoint = 'http://localhost:3000/api/get_event_name'
      }
      else{
        endpoint = 'https://'+context.req.headers.host+'/api/get_event_name'
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

      console.log("Event Name is "+result.name);
      console.log("Count is "+result.totalCount);
      console.log("Date is "+result.eventDate);
      console.log("payload is "+context.query.payload);
      console.log("buypayload is "+context.query.buypayload);
      eventName = result.name;
      totalCount = result.totalCount;
      eventDate = result.eventDate;

        if(typeof context.query.payload === 'undefined'){
          predata = {
            name: eventName,
            eventDate: eventDate,
            totalCount: totalCount,
            eid: context.query.id,
            verified: 0
        }
        }
        


        var cookieWalletAddress;
        let cOptions = {
         req: context.req,
         res: context.res
        }
        if( hasCookie('cookieWalletAddress',cOptions) ){
         cookieWalletAddress = getCookie('cookieWalletAddress',cOptions);
        }

        predata = {
          name: eventName,
          totalCount: totalCount,
          eventDate: eventDate,
          eid: context.query.id,
          //payload: context.query.payload,
          wallet: cookieWalletAddress,
          verified: 0
        }
        console.log('predata.wallet '+predata.wallet);


        

          // Verify payment if bought
        if(context.query.status == 'bought'){
                const verifyboughtdata = {
                  buypayload: context.query.buypayload,
                  boughtofferId: context.query.offerId,
                  wallet: cookieWalletAddress
                }
                const verifyboughtJSONdata = JSON.stringify(verifyboughtdata)

                var verifyboughtendpoint;
                if(context.req.headers.host=="localhost:3000"){
                  verifyboughtendpoint = 'http://localhost:3000/api/verify_payment'
                }
                else{
                  verifyboughtendpoint = 'https://'+context.req.headers.host+'/api/verify_payment'
                }
            
                //const verifyboughtendpoint = 'http://localhost:3000/api/verify_payment'
                const verifyboughtoptions = {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: verifyboughtJSONdata,
                }
                const verifyboughtresponse = await fetch(verifyboughtendpoint, verifyboughtoptions)
                const verifyboughtresult = await verifyboughtresponse.json()
                console.log("Verified? "+verifyboughtresult.resolved);
                if(verifyboughtresult.resolved==true){
                  predata = {
                    name: eventName,
                    totalCount: totalCount,
                    eid: context.query.id,
                    buypayload: context.query.buypayload,
                    verified: 1
                  }
                }
                
        }


      
      

      return { props: { predata, hostURL } }
  }
  
  return { props: { predata, hostURL } }
}

export default BuyPage
