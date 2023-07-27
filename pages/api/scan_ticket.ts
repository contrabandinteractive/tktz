import type { NextApiRequest, NextApiResponse } from 'next'
import { XummSdk } from 'xumm-sdk'
var faunadb = require('faunadb');
var q = faunadb.query;
const xrpl = require("xrpl");
var finalResult = "Cannot retrieve ticket information.";


var dbClient = new faunadb.Client({
    secret: 'XXX',
    domain: 'db.fauna.com', // Adjust if you are using Region Groups
})

async function verifyScan(body) {
    

          let ticketdbid;
          await dbClient.query(
              q.Paginate(q.Match(q.Index('find_ticket_by_tokenId'), body.tokenId))
            )
            .then((ret) => ticketdbid=ret.data[0].id)
            .catch((err) => console.error(
              'Error: [%s] %s: %s',
              err.name,
              err.message,
              //err.errors()[0].description,
          ));
          
          // Make sure ticket wasn't already purchased
          let isUsed;
          await dbClient.query(
            q.Get(q.Ref(q.Collection('Tickets'), ticketdbid))
          )
          .then((ret) => isUsed=ret.data.isUsed)
          .catch((err) => console.error(
            'Error: [%s] %s: %s',
            err.name,
            err.message,
            err.errors()[0].description,
          ))

          if(isUsed==true){
            // Ticket has been used, so return error
            finalResult = "Sorry, Ticket has already been used!"
          }
          else{
            // Mark as used in DB
            await dbClient.query(
                q.Update(
                  q.Ref(q.Collection('Tickets'), ticketdbid),
                  {
                    data: {
                      isUsed: true
                    },
                  },
                )
            );
            finalResult = "Ticket has been successfully scanned. Thank you!"
          }


}

export default async function handler( 
    req: NextApiRequest,
    res: NextApiResponse<Data>
  ) {
    const body = req.body
    await verifyScan(body);
    res.status(200).json({ status: finalResult })
}
  