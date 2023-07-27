// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
var faunadb = require('faunadb');
var q = faunadb.query;
var resultId;
var eventName;
var eventDate;
var totalCount;

var dbClient = new faunadb.Client({
  secret: 'XXX',
  domain: 'db.fauna.com', // Adjust if you are using Region Groups
})

async function getName(body) {

      await dbClient.query(
        q.Paginate(q.Match(q.Index('search_by_id'), body.eid))
      )
      .then((ret) => resultId=ret.data[0].id)
      .catch((err) => console.error(
        'Error: [%s] %s: %s',
        err.name,
        err.message,
        err.errors()[0].description,
      ))

      // Get the name from Ref ID
      await dbClient.query(
        q.Get(q.Ref(q.Collection('Events'), resultId))
        //q.Get(q.Ref(q.Collection('Events'), '341640181339652687'))
      )
      .then((ret) => eventName=ret.data.name)
      .catch((err) => console.error(
        'Error: [%s] %s: %s',
        err.name,
        err.message,
        err.errors()[0].description,
      ))

      console.log('Getting event info...');

      // Get the date from Ref ID
      await dbClient.query(
        q.Get(q.Ref(q.Collection('Events'), resultId))
        //q.Get(q.Ref(q.Collection('Events'), '341640181339652687'))
      )
      .then((ret) => eventDate=ret.data.eventDate)
      //.then((ret) => console.log(ret.data))
      .catch((err) => console.error(
        'Error: [%s] %s: %s',
        err.name,
        err.message,
        err.errors()[0].description,
      ))

      

      // Count tickets for sale
      await dbClient.query(
        q.Count(q.Match(q.Index('count_available_tickets_by_id'), body.eid,"available"))
      )
      .then((ret) => totalCount=ret)
      .catch((err) => console.error(
        'Error: [%s] %s: %s',
        err.name,
        err.message,
        err.errors()[0].description,
      ))
      
    
}


export default async function handler( 
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const body = req.body
  await getName(body);
  res.status(200).json({ name: eventName, eventDate: eventDate, totalCount: totalCount })
}
