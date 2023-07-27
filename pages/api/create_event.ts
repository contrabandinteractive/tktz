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


var dbClient = new faunadb.Client({
  secret: 'XXX',
  domain: 'db.fauna.com', // Adjust if you are using Region Groups
})

async function createTx(body) {


  var xrplEventName = body.xrplEventName;
  var ticketURI = "TKTZ";
  var ticketNum = body.xrplTicketsNum;
  var ticketAmount = body.xrplTicketPrice;
  var receivingWallet = body.xrplWallet;
  var xrplEventDate = body.xrplEventDate;

  // 1. Insert event name into DB
  await dbClient.query(
    q.Create(q.Collection("Events"), {
      data: {
        name: xrplEventName,
        eventId: eventId,
        receivingWallet: receivingWallet,
        eventDate: xrplEventDate
      },
    })
  )

  //dbClient.close();

}




export default async function handler( 
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const body = req.body
  await createTx(body);
  res.status(200).json({ eventId: eventId })
}
