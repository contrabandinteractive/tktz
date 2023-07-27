import type { NextApiRequest, NextApiResponse } from 'next'
import { getCookies, getCookie, hasCookie, deleteCookie } from 'cookies-next';



export default async function handler( 
    req: NextApiRequest,
    res: NextApiResponse<Data>
  ) {
    //await checkCookie(req,res);

    deleteCookie('cookieWalletAddress',{ req, res })
    
    res.status(200).json({ done: "done" })
}
  