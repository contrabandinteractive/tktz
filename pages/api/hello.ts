// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { XummSdk } from 'xumm-sdk'

const Sdk = new XummSdk('XXX', 'XXX');

type Data = {
  name: string
}

let finalAppName = "";

async function pong() { 
  const appInfo = await Sdk.ping();
  const myAppName = appInfo.application.name;
  finalAppName = myAppName;
  console.log(myAppName);
  return myAppName
}

//pong()

export default async function handler( 
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  await pong();
  res.status(200).json({ name: 'John Doe '+finalAppName })
}
