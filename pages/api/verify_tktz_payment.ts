import type { NextApiRequest, NextApiResponse } from 'next'
import { XummSdk } from 'xumm-sdk'
const {TxData} = require('xrpl-txdata')
const xrpl = require("xrpl");
var finalStatus;

const Sdk = new XummSdk('XXX', 'XXX');
const Verify = new TxData()

async function verifySignIn(body) {
    const appInfo = await Sdk.ping()
    console.log(appInfo.application.name)

    const theStatus = await Sdk.payload.get(body.payload, true);


    finalStatus = theStatus?.meta.signed;

}

export default async function handler( 
    req: NextApiRequest,
    res: NextApiResponse<Data>
  ) {
    const body = req.body
    await verifySignIn(body);
    res.status(200).json({ finalStatus: finalStatus })
}
  