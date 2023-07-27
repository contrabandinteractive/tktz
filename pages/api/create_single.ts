// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { XummSdk } from 'xumm-sdk'
import { v4 as uuidv4 } from 'uuid'
const xrpl = require("xrpl");
var faunadb = require('faunadb');
var q = faunadb.query;
var ticketsCreated = 0;
var sellOfferCreated=1;
var finalTokenID;

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
  var eventId = body.eventId;

  //dbClient.close()

  // 2. Create tickets
  const wallet = xrpl.Wallet.fromSeed(xrplAccountSecret);
  const client = new xrpl.Client("wss://xrplcluster.com");
  await client.connect();  
  
  // NFT transactionblob
  const transactionBlob = {
    TransactionType: "NFTokenMint",
    Account: wallet.classicAddress,
    URI: xrpl.convertStringToHex("https://www.tktz.wtf/tktzlogo.jpg"),
    Flags: 8,
    NFTokenTaxon: 0 
  }

  
    
    let tx = await client.submitAndWait(transactionBlob,{wallet})
    
   
    console.log("Transaction result:", tx.result.meta.TransactionResult)
    console.log("Balance changes:",
    JSON.stringify(xrpl.getBalanceChanges(tx.result.meta), null, 2))
 

  // Get tokens
  let nfts = await client.request({
    method: "account_nfts",
    account: wallet.classicAddress,
  })

  //console.log("Transaction result:", tx.result)
  let sortedNfts = nfts.result.account_nfts.sort(function(a, b) { 
    return (a.nft_serial - b.nft_serial) || a.name.localeCompare(b.NFTokenID); 
  });

  let lastNft = sortedNfts[sortedNfts.length - 1];

  //console.log(nfts.result.account_nfts)
  let lastTokenID = lastNft.NFTokenID

  let finalAmount = ticketAmount * 1000000;


      let transactionBlob2 = {
            "TransactionType": "NFTokenCreateOffer",
            "Account": wallet.classicAddress,
            "NFTokenID": lastTokenID,
            "Amount": finalAmount.toString(),
            "Flags": 1
      }

      // Submit signed blob 
      //setResults('<p>Putting up Ticket '+currentStep.toString()+' of '+ ticketNum.toString() +' for sale...</p><img id="loadingImg" src="'+loadingImg.toString()+'" />');
      let tx2 = await client.submitAndWait(transactionBlob2,{wallet})//AndWait


      
      let nftSellOffers
        try {
          nftSellOffers = await client.request({
          method: "nft_sell_offers",
          nft_id: lastTokenID
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
      //sellOffersFinalList.push(theLastOfferID);
      console.log('Index: '+ theLastOfferID);
      console.log(nftSellOffers);
      

      // Insert ticket / offer into DB
      await dbClient.query(
        q.Create(q.Collection("Tickets"), {
          data: {
            eventId: eventId,
            offerId: theLastOfferID,
            tokenId: lastTokenID,
            status: 'available',
            isUsed: false,
            amount: finalAmount,
            purchaser: 'n/a'
          },
        })
      )
    
      finalTokenID = lastTokenID;

   
  	client.disconnect()



}




export default async function handler( 
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const body = req.body
  await createTx(body);
  res.status(200).json({ tokenID: finalTokenID })
}
