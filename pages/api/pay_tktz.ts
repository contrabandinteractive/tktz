import type { NextApiRequest, NextApiResponse } from 'next'
import { XummSdk } from 'xumm-sdk'
const xrpl = require("xrpl");
var signURL = '';

const Sdk = new XummSdk('XXX', 'XXX');


async function verifySignIn(body) {
    const appInfo = await Sdk.ping()
    console.log(appInfo.application.name)

    const request = {
        options: {
          return_url: {
            app: body.hostURL+'/create?payload={id}&eventName='+body.xrplEventName+'&ticketsNum='+body.xrplTicketsNum+'&ticketPrice='+body.xrplTicketPrice+'&xrplWallet='+body.xrplWallet+'&xrplEventDate='+body.xrplEventDate,
            web: body.hostURL+'/create?payload={id}&eventName='+body.xrplEventName+'&ticketsNum='+body.xrplTicketsNum+'&ticketPrice='+body.xrplTicketPrice+'&xrplWallet='+body.xrplWallet+'&xrplEventDate='+body.xrplEventDate
          }
        },
        txjson: {
            "TransactionType": "Payment",
            "Destination": "rNvmE8U5Perd4WCzzVDzTsemn3aVBx3Mqz",
            "Amount": "25000000"
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
    await verifySignIn(body);
    res.status(200).json({ signURL: signURL })
}
  