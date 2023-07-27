// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { XummSdk } from 'xumm-sdk'
import { v4 as uuidv4 } from 'uuid'
const xrpl = require("xrpl");
var faunadb = require('faunadb');
var q = faunadb.query;
var ticketsCreated = 0;
var sellOfferCreated=1;

const Sdk = new XummSdk('XXX', 'XXX');

type Data = {
  name: string
}

var dbClient = new faunadb.Client({
  secret: 'XXX',
  domain: 'db.fauna.com', // Adjust if you are using Region Groups
})

async function createTx() {

 
  var xrplAccount = "XXX";
  var xrplAccountSecret = "XXX";


  var ticketURI = "TKTZ";


  const wallet = xrpl.Wallet.fromSeed(xrplAccountSecret);
  const client = new xrpl.Client("wss://xls20-sandbox.rippletest.net:51233");
  await client.connect();  
  

  const transactionBlob = {
    TransactionType: "NFTokenMint",
    Account: wallet.classicAddress,
    URI: xrpl.convertStringToHex("ticketURI"),
    Flags: 8,
    NFTokenTaxon: 0 
  }


  let tx = await client.submitAndWait(transactionBlob,{wallet})
 

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
  console.log(lastTokenID);
  
  let finalAmount = 1000000;


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

      console.log(tx2.result);

  client.disconnect()
  
 




}




export default async function handler( 
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  await createTx();
  res.status(200).json({ eventId: ticketsCreated })
}
