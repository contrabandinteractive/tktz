import type { NextApiRequest, NextApiResponse } from 'next'
import { getCookies, getCookie, hasCookie } from 'cookies-next';
var hasTheCookie = false;
var walletAddress;



export default async function handler( 
    req: NextApiRequest,
    res: NextApiResponse<Data>
  ) {
    //await checkCookie(req,res);

    if( hasCookie('cookieWalletAddress',{ req, res }) ){
        hasTheCookie = true;
        walletAddress = getCookie('cookieWalletAddress',{ req, res });
    }

    console.log("has the server cookie? "+hasCookie('cookieWalletAddress',{ req, res }));
    
    res.status(200).json({ hasTheCookie: hasTheCookie, walletAddress: walletAddress })
}
  