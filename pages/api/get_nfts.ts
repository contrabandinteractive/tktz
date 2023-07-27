import type { NextApiRequest, NextApiResponse } from 'next'
//import { XummSdk } from 'xumm-sdk'
var faunadb = require('faunadb');
var q = faunadb.query;
const xrpl = require("xrpl");
var finalMessage = '';
let finalNfts = [];

//const Sdk = new XummSdk('001b2c6e-453e-47ef-8be9-df232dc492a1', '129c6a07-b935-48d5-9524-8ce4d0878e6b'); 

var dbClient = new faunadb.Client({
    secret: 'XXX',
    domain: 'db.fauna.com', // Adjust if you are using Region Groups
})


async function getNfts(body) {
    finalNfts = [];
    // Get tokens
    const client = new xrpl.Client("wss://xrplcluster.com");
    await client.connect();  
    let nfts = await client.request({
        method: "account_nfts",
        account: body.walletAddress
    })
    
    let nftCount  = nfts.result.account_nfts.length;
      console.log('NFT Count: '+nftCount);
      console.log('For account: '+body.walletAddress);

      //Iterate over each NFT and see if it's in our DB
      for (let step = 0; step < nftCount; step++) {
        console.log(nfts.result.account_nfts[step].NFTokenID);
        let didFindNFT;
        await dbClient.query(
            q.Count(q.Match(q.Index('find_ticket_by_tokenId'), nfts.result.account_nfts[step].NFTokenID))
          )
          .then((ret) => didFindNFT=ret)
          .catch((err) => console.error(
            'Error: [%s] %s: %s',
            err.name,
            err.message,
            //err.errors()[0].description,
        ));
        
        // Token ID found in user's wallet matches on in the DB
        let ticketDBID;
        if(didFindNFT>0){
          await dbClient.query(
              q.Paginate(q.Match(q.Index('find_ticket_by_tokenId'), nfts.result.account_nfts[step].NFTokenID))
            )
            .then((ret) => ticketDBID=ret.data[0].id)
            .catch((err) => console.error(
              'Error: [%s] %s: %s',
              err.name,
              err.message,
              //err.errors()[0].description,
          ));
          
          // Get Event ID
          let eventId;
          await dbClient.query(
              q.Get(q.Ref(q.Collection('Tickets'), ticketDBID))
            )
            .then((ret) => eventId=ret.data.eventId)
            .catch((err) => console.error(
              'Error: [%s] %s: %s',
              err.name,
              err.message,
              //err.errors()[0].description,
          ));
          
          // Use Event ID to get Event Name
          let eventName;
          let internalId;
          let isUsed;
          await dbClient.query(
            q.Paginate(q.Match(q.Index('search_by_id'), eventId))
            )
            .then((ret) => internalId=ret.data[0].id)
            .catch((err) => console.error(
              'Error: [%s] %s: %s',
              err.name,
              err.message,
              //err.errors()[0].description,
          ));
          
          // Get event name
          await dbClient.query(
              q.Get(q.Ref(q.Collection('Events'), internalId))
            )
            .then((ret) => eventName=ret.data.name)
            .catch((err) => console.error(
              'Error: [%s] %s: %s',
              err.name,
              err.message,
              //err.errors()[0].description,
          ));
          
          console.log('Is ticket used?');
          // Get isUsed status
          await dbClient.query(
            q.Get(q.Ref(q.Collection('Tickets'), ticketDBID))
          )
          .then((ret) => isUsed=ret.data.isUsed)
          .catch((err) => console.error(
            'Error: [%s] %s: %s',
            err.name,
            err.message,
            //err.errors()[0].description,
          ));

          // Add token ID, event ID, and event name to JSON object
          //console.log('{ "tokenId":"'+nfts.result.account_nfts[step].NFTokenID+'" , "name":"'+eventName+'", "eventId":"'+eventId+'" },');
          console.log('Matching for event: '+eventName);


          var matchingObj = {
            "tokenId" : nfts.result.account_nfts[step].NFTokenID,    
            "name" : eventName,
            "eventId" : eventId,
            "isUsed" : isUsed
          };
          finalNfts.push(matchingObj);

        }



      }


    //finalNfts = 'test';
}

export default async function handler( 
    req: NextApiRequest,
    res: NextApiResponse<Data>
  ) {
    const body = req.body
    await getNfts(body);
    res.status(200).json({finalNfts})
}
  