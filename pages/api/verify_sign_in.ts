import type { NextApiRequest, NextApiResponse } from 'next'
import { XummSdk } from 'xumm-sdk'
import { getCookies, setCookie, hasCookie } from 'cookies-next';
const xrpl = require("xrpl");
var finalMessage = '';
var walletAddress;

const Sdk = new XummSdk('XXX', 'XXX');


async function verifySignIn(body) {
    const appInfo = await Sdk.ping()
    console.log(appInfo.application.name)

    const theStatus = await Sdk.payload.get(body.payload, true);
    //console.log(theStatus);
    console.log(theStatus?.response.account);
    walletAddress = theStatus?.response.account;

}

export default async function handler( 
    req: NextApiRequest,
    res: NextApiResponse<Data>
  ) {
    const body = req.body
    await verifySignIn(body);
    //setCookie('cookieWalletAddress',walletAddress,{ req, res });
    //console.log('has server cookie 22? '+hasCookie('cookieWalletAddress',{ req, res }));
    res.status(200).json({ walletAddress: walletAddress })
}
  