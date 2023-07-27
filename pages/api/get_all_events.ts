// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
var faunadb = require('faunadb');
var q = faunadb.query;
var finalEvents = [];

var dbClient = new faunadb.Client({
  secret: 'XXX',
  domain: 'db.fauna.com', // Adjust if you are using Region Groups
})

async function getEvents(body) {
      finalEvents = [];
      let internalIds;
      await dbClient.query(
        q.Paginate(q.Match(q.Index('see_all_events')))
      )
      .then((ret) => internalIds=ret)
      .catch((err) => console.error(
        'Error: [%s] %s: %s',
        err.name,
        err.message,
        err.errors()[0].description,
      ))
      
      //console.log(internalIds.data.length)
      
      for (let step = 0; step < internalIds.data.length; step++) {
          let matchingId;
          await dbClient.query(
            q.Get(q.Ref(q.Collection('Events'), internalIds.data[step].id))
          )
          .then((ret) => matchingId=ret)
          .catch((err) => console.error(
            'Error: [%s] %s: %s',
            err.name,
            err.message,
            err.errors()[0].description,
          ))
          
          var matchingObj = {
            "name" : matchingId.data.name,
            "eventId" : matchingId.data.eventId  
          };
          finalEvents.push(matchingObj);

      }
      
    
}


export default async function handler( 
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  await getEvents();
  res.status(200).json({ finalEvents })
}
