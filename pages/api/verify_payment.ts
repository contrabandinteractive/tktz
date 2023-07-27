import type { NextApiRequest, NextApiResponse } from 'next'
import { XummSdk } from 'xumm-sdk'
var faunadb = require('faunadb');
var q = faunadb.query;
const xrpl = require("xrpl");
var finalMessage;
var walletAddress;
var finalResult;

const Sdk = new XummSdk('XXX', 'XXX');

var dbClient = new faunadb.Client({
    secret: 'XXX',
    domain: 'db.fauna.com', // Adjust if you are using Region Groups
})

async function verifyPayment(body) {
    const appInfo = await Sdk.ping()
    console.log(appInfo.application.name)

    const theStatus = await Sdk.payload.get(body.buypayload, true);
    //console.log(theStatus);
    console.log("Ticket resolved status: "+theStatus?.meta.resolved);
    finalMessage = theStatus?.meta.resolved;

    if(finalMessage==true){
    //Mark ticket as sold in the DB if payload is resolved
          let resultId;
          await dbClient.query(
              q.Paginate(q.Match(q.Index('find_ticket_by_offerId'), body.boughtofferId))
            )
            .then((ret) => resultId=ret.data[0].id)
            .catch((err) => console.error(
              'Error: [%s] %s: %s',
              err.name,
              err.message,
              //err.errors()[0].description,
          ));
          
          // Make sure ticket wasn't already purchased
          let alreadySold;
          await dbClient.query(
            q.Get(q.Ref(q.Collection('Tickets'), resultId))
            //q.Get(q.Ref(q.Collection('Events'), '341640181339652687'))
          )
          .then((ret) => alreadySold=ret.data.status)
          .catch((err) => console.error(
            'Error: [%s] %s: %s',
            err.name,
            err.message,
            err.errors()[0].description,
          ))

          if(alreadySold!='sold'){
                
                  // Mark as sold in DB
                  await dbClient.query(
                    q.Update(
                      q.Ref(q.Collection('Tickets'), resultId),
                      {
                        data: {
                          status: 'sold',
                          purchaser: body.wallet
                        },
                      },
                    )
                  );
                  
                  // Pay seller
                  // Get event ID
                  let theEventId;
                  await dbClient.query(
                    q.Get(q.Ref(q.Collection('Tickets'), resultId))
                    //q.Get(q.Ref(q.Collection('Events'), '341640181339652687'))
                  )
                  .then((ret) => theEventId=ret.data.eventId)
                  .catch((err) => console.error(
                    'Error: [%s] %s: %s',
                    err.name,
                    err.message,
                    err.errors()[0].description,
                  ))
                  //console.log('present event id:'+theEventId);
                  
                  let eventResultId;
                  await dbClient.query(
                    q.Paginate(q.Match(q.Index('search_by_id'), theEventId))
                  )
                  .then((ret) => eventResultId=ret.data[0].id)
                  .catch((err) => console.error(
                    'Error: [%s] %s: %s',
                    err.name,
                    err.message,
                    err.errors()[0].description,
                  ))
                  //console.log('present resultevent id:'+eventResultId);

                  // Get ticket price
                  let dbTicketAmount;
                  await dbClient.query(
                    q.Get(q.Ref(q.Collection('Tickets'), resultId))
                    //q.Get(q.Ref(q.Collection('Events'), '341640181339652687'))
                  )
                  .then((ret) => dbTicketAmount=ret.data.amount)
                  .catch((err) => console.error(
                    'Error: [%s] %s: %s',
                    err.name,
                    err.message,
                    err.errors()[0].description,
                  ))
                  //console.log('ticket amount:'+dbTicketAmount);

                  // Calculate final amount to pay to seller after taking 1% fee
                  let finalTicketAmount = dbTicketAmount * 0.99;
                  
                  // Get the seller wallet from Ref ID
                  let sellerWallet;
                  await dbClient.query(
                    q.Get(q.Ref(q.Collection('Events'), eventResultId))
                    //q.Get(q.Ref(q.Collection('Events'), '341640181339652687'))
                  )
                  .then((ret) => sellerWallet=ret.data.receivingWallet)
                  .catch((err) => console.error(
                    'Error: [%s] %s: %s',
                    err.name,
                    err.message,
                    err.errors()[0].description,
                  ))
                  

                  console.log("The seller wallet where payment will be sent: "+sellerWallet)

                  // Initiate payment to sellerWallet
                  var xrplAccount = "XXX";
                  var xrplAccountSecret = "XXX";
                  const wallet = xrpl.Wallet.fromSeed(xrplAccountSecret);
                  const client = new xrpl.Client("wss://xrplcluster.com");
                  await client.connect();  
                  
                  
                  const transactionBlob = {
                    TransactionType: "Payment",
                    Account: xrplAccount,
                    Destination: sellerWallet,
                    Amount: finalTicketAmount.toString()
                  }

                  let tx = await client.submitAndWait(transactionBlob,{wallet})
                  console.log("Transaction result:", tx.result.meta.TransactionResult)
                  console.log("Balance changes:",
                  JSON.stringify(xrpl.getBalanceChanges(tx.result.meta), null, 2))

                  finalResult=true;
            }
            else{
              finalResult=false;
            }

    }
    

}

export default async function handler( 
    req: NextApiRequest,
    res: NextApiResponse<Data>
  ) {
    const body = req.body
    await verifyPayment(body);
    res.status(200).json({ resolved: finalResult })
}
  