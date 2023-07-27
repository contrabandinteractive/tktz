import type { NextApiRequest, NextApiResponse } from 'next'
import { XummSdk } from 'xumm-sdk'
const xrpl = require("xrpl");
var faunadb = require('faunadb');
var q = faunadb.query;
var signURL;
var offerId;

const Sdk = new XummSdk('XXX', 'XXX');

var dbClient = new faunadb.Client({
    secret: 'XXX',
    domain: 'db.fauna.com', // Adjust if you are using Region Groups
});

async function buyTx(body) {
    // Using event id, find a ticket to buy and get that offer id
    await dbClient.query(
        //q.Get(q.Match(q.Index('count_tickets_by_id'), body.eid))
        q.Get(q.Match(q.Index('count_available_tickets_by_id'), body.eid,"available"))
      )
      .then((ret) => offerId=ret.data.offerId)
      .catch((err) => console.error(
        'Error: [%s] %s: %s',
        err.name,
        err.message,
        err.errors()[0].description,
    ))
    console.log(offerId);

    // With the offer id, create a buy transaction and send to XUMM
    
    const appInfo = await Sdk.ping()
    console.log(appInfo.application.name)
    // Prepare transaction -------------------------------------------------------
    
    
    const request = {
        options: {
          return_url: {
            app: body.hostURL+'/buy?status=bought&buypayload={id}&id='+body.eid+'&offerId='+offerId,
            web: body.hostURL+'/buy?status=bought&buypayload={id}&id='+body.eid+'&offerId='+offerId
          }
        },
        txjson: {
            TransactionType: "NFTokenAcceptOffer",
            Account: body.xummAddress,
            NFTokenSellOffer: offerId,
        }
    }
    
  
    const payload = await Sdk.payload.create(request, true)
    console.log(payload?.next.always)
    signURL = payload?.next.always;

}

export default async function handler( 
    req: NextApiRequest,
    res: NextApiResponse<Data>
  ) {
    const body = req.body
    await buyTx(body);
    res.status(200).json({ signURL: signURL })
}
  