import type { NextApiRequest, NextApiResponse } from 'next'
import { XummSdk } from 'xumm-sdk'
const xrpl = require("xrpl");
var finalMessage = '';
var signURL;

const Sdk = new XummSdk('XXX', 'XXX');


async function signIn(body) {
    const appInfo = await Sdk.ping()
    console.log(appInfo.application.name)

    /*
    const request = {
        "TransactionType": "SignIn"
    }
    */
    var request;

    if(body.currentPage=="index"){
      request = {
        options: {
          return_url: {
            app: body.hostURL+'/?payload={id}&id='+body.eid,
            web: body.hostURL+'/?payload={id}&id='+body.eid
          }
        },
        txjson: {
          "TransactionType": "SignIn"
        }
      }
    }
    else{
      request = {
        options: {
          return_url: {
            app: body.hostURL+'/'+body.currentPage+'?payload={id}&id='+body.eid,
            web: body.hostURL+'/'+body.currentPage+'?payload={id}&id='+body.eid
          }
        },
        txjson: {
          "TransactionType": "SignIn"
        }
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
    await signIn(body);
    res.status(200).json({ signURL: signURL })
}
  