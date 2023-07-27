// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { XummSdk } from 'xumm-sdk'
import { v4 as uuidv4 } from 'uuid'
const xrpl = require("xrpl");
var faunadb = require('faunadb');
var q = faunadb.query;
var ticketsCreated = 0;
const eventId = uuidv4();
var sellOfferCreated=1;

const Sdk = new XummSdk('XXX', 'XXX');

type Data = {
  name: string
}

var dbClient = new faunadb.Client({
  secret: 'XXX',
  domain: 'db.fauna.com', // Adjust if you are using Region Groups
})

async function createTx(body) {



  // Current custodial wallet
  var xrplAccount = "XXX";
  var xrplAccountSecret = "XXX";

  var xrplEventName = body.xrplEventName;
  var ticketURI = "TKTZ";
  var ticketNum = body.xrplTicketsNum;
  var ticketAmount = body.xrplTicketPrice;
  var receivingWallet = body.xrplWallet;

  // 1. Insert event name into DB
  dbClient.query(
    q.Create(q.Collection("Events"), {
      data: {
        name: xrplEventName,
        eventId: eventId,
        receivingWallet: receivingWallet
      },
    })
  )

  //dbClient.close()

  // 2. Create tickets
  const wallet = xrpl.Wallet.fromSeed(xrplAccountSecret);
  const client = new xrpl.Client("wss://xls20-sandbox.rippletest.net:51233");
  await client.connect();  
  
  // NFT transactionblob
  const transactionBlob = {
    TransactionType: "NFTokenMint",
    Account: wallet.classicAddress,
    URI: xrpl.convertStringToHex("ticketURI"),
    Flags: 8,
    NFTokenTaxon: 0 
  }

  let currentStep = 1;
  for (let step = 0; step < ticketNum; step++) {
    //setResults('<p>Creating Ticket '+currentStep.toString()+' of '+ ticketNum.toString() +'...</p><img id="loadingImg" src="'+loadingImg.toString()+'" />');
    let tx = await client.submitAndWait(transactionBlob,{wallet})
    let nfts = await client.request({
      method: "account_nfts",
      account: wallet.classicAddress
    })
    currentStep++;
    console.log(nfts)
    console.log("Transaction result:", tx.result.meta.TransactionResult)
    console.log("Balance changes:",
    JSON.stringify(xrpl.getBalanceChanges(tx.result.meta), null, 2))
  }

  // Get tokens
  let nfts = await client.request({
    method: "account_nfts",
    account: wallet.classicAddress
  })
  console.log('NFTs list');
  console.log(nfts);

  let ticketIdList = [];
  let sellOffersFinalList = [];
  for (let step = 0; step < ticketNum; step++) {
    ticketIdList.push( nfts.result.account_nfts[step].NFTokenID );
  }
  console.log('Id list');
  console.log(ticketIdList);

  console.log(ticketIdList[0]);
  let finalAmount = ticketAmount * 1000000;

  // Create sell offers
  currentStep = 1;
    
  for (let step = 0; step < ticketNum; step++) {
      console.log("Current ticket ID");
      console.log(ticketIdList[step]);
      // Prepare transaction 
      let transactionBlob2 = {
            "TransactionType": "NFTokenCreateOffer",
            "Account": wallet.classicAddress,
            "NFTokenID": ticketIdList[step],
            "Amount": finalAmount.toString(),
            "Flags": 1
      }

      // Submit signed blob 
      //setResults('<p>Putting up Ticket '+currentStep.toString()+' of '+ ticketNum.toString() +' for sale...</p><img id="loadingImg" src="'+loadingImg.toString()+'" />');
      let tx = await client.submitAndWait(transactionBlob2,{wallet})//AndWait
      console.log("Sell offer created: "+sellOfferCreated);
      sellOfferCreated++;
      currentStep++;

      console.log("***Sell Offers***")
      
      let nftSellOffers
        try {
          nftSellOffers = await client.request({
          method: "nft_sell_offers",
          nft_id: ticketIdList[step]
        })
        } catch (err) {
          console.log("No sell offers.")
      }
    
      // Get last offer index ID
      let allTheOffers = nftSellOffers.result.offers;
      let theLastOfferID;
      for (let offerStep = 0; offerStep < allTheOffers.length; offerStep++) {
        if(nftSellOffers.result.offers[offerStep].amount == finalAmount){
          theLastOfferID = nftSellOffers.result.offers[offerStep].nft_offer_index;
        }
      }

      console.log(JSON.stringify(nftSellOffers,null,2))
      sellOffersFinalList.push(theLastOfferID);
      console.log('Index: '+ theLastOfferID);
      console.log(nftSellOffers);

      // Insert ticket / offer into DB
      dbClient.query(
        q.Create(q.Collection("Tickets"), {
          data: {
            eventId: eventId,
            offerId: theLastOfferID,
            tokenId: ticketIdList[step],
            status: 'available',
            isUsed: false,
            amount: finalAmount,
            purchaser: 'n/a'
          },
        })
      )

      console.log("***Buy Offers***")
      let nftBuyOffers
      try {
        nftBuyOffers = await client.request({
        method: "nft_buy_offers",
        tokenid: ticketIdList[step] })
      } catch (err) {
        console.log("No buy offers.")
      }
      console.log(JSON.stringify(nftBuyOffers,null,2))

      // Check transaction results -------------------------------------------------
      console.log("Transaction result:",
      JSON.stringify(tx.result.meta.TransactionResult, null, 2))
      console.log("Balance changes:",
      JSON.stringify(xrpl.getBalanceChanges(tx.result.meta), null, 2))
    }

    let ticketListHTML = '';
    for(let step=0;step<sellOffersFinalList.length;step++){
      ticketListHTML = ticketListHTML + '<p>Offer ID: '+sellOffersFinalList[step]+'</p>';
    }
    //setResults('<p>Success! There are now ' + ticketIdList.length.toString() + ' tickets available for purchase from account:<br/>'+account+'</p><br/><br/><p><img id="ticketImg" src="'+tokenUrl+'"></p>'+ticketListHTML);

  	client.disconnect()



}




export default async function handler( 
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const body = req.body
  await createTx(body);
  res.status(200).json({ eventId: eventId })
}
