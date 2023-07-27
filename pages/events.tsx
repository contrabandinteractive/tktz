import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState } from "react";
import { useRouter } from 'next/router';
import ReactDOM from "react-dom";

const url = 'https://jsonplaceholder.typicode.com/posts';

const Events: NextPage = ({ predata, hostURL }) => {

  const [events, setEvents] = useState(predata);

  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  

  
  useEffect(() => {
     setPosts(events.finalEvents);
  }, []);


  function Post(props) {
    const { name, eventId } = props.data;
    return (
      <div className="card w-full bg-transparent text-primary-content p-[10px] min-w-[300px]">
        <div className="card-body tickets-card grid place-items-center">
          <h2 className="card-title p-[10px]">{name}</h2>

          <div className="card-actions justify-end">
                <Link href={ `/buy?id=${eventId}` } ><label className="btn modal-button">See More</label></Link>
          </div>
        </div>
      </div>
    );
  }

  function Pagination({ data, RenderComponent, title, pageLimit, dataLimit }) {
    const [pages] = useState(Math.round(data.length / dataLimit));
    const [currentPage, setCurrentPage] = useState(1);
  
    function goToNextPage() {
        setCurrentPage((page) => page + 1);
    }
  
    function goToPreviousPage() {
        setCurrentPage((page) => page - 1);
      }
  
      function changePage(event) {
        const pageNumber = Number(event.target.textContent);
        setCurrentPage(pageNumber);
      }
  
      const getPaginatedData = () => {
        const startIndex = currentPage * dataLimit - dataLimit;
        const endIndex = startIndex + dataLimit;
        return data.slice(startIndex, endIndex);
      };
  
      const getPaginationGroup = () => {
        let start = Math.floor((currentPage - 1) / pageLimit) * pageLimit;
        return new Array(pageLimit).fill().map((_, idx) => start + idx + 1);
      };

      useEffect(() => {
        window.scrollTo({ behavior: 'smooth', top: '0px' });
      }, [currentPage]);
  
    return (
        <div>
    
        {/* show the posts, 10 posts at a time */}
        <div className="dataContainer grid grid-cols-1 md:grid-cols-2 max-w-full">
          {getPaginatedData().map((d, idx) => (
            <RenderComponent key={idx} data={d} />
          ))}
        </div>
    
        {/* show the pagiantion
            it consists of next and previous buttons
            along with page numbers, in our case, 5 page
            numbers at a time
        */}
        <div className="pagination">
          {/* previous button */}
          <button
            onClick={goToPreviousPage}
            className={`prev ${currentPage === 1 ? 'disabled' : ''}`}
          >
            prev
          </button>
    
          {/* show page numbers */}
          {getPaginationGroup().map((item, index) => (
            <button
              key={index}
              onClick={changePage}
              className={`paginationItem ${currentPage === item ? 'active' : null}`}
            >
               {/* uncomment to show page numbers */}
               {/* <span>{item}</span> */}
            </button>
          ))}
    
          {/* next button */}
          <button
            onClick={goToNextPage}
            className={`next ${currentPage === pages ? 'disabled' : ''}`}
          >
            next
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <Head>
        <title>TKTZ</title>
        <link rel="icon" href="/favicon.ico" />
        <style>
        @import url('https://fonts.googleapis.com/css2?family=Poiret+One&display=swap');
        </style>
      </Head>

      <main className="flex w-full flex-1 flex-col items-center justify-center text-center">
        <Link href="/"><h1 className="text-6xl font-bold cursor-pointer">
          TKTZ
        </h1></Link>


        <p className="mt-3 text-2xl">
          Events
        </p>

        <div className="mt-6 flex max-w-full md:max-w-4xl flex-wrap items-center justify-around sm:w-full">
                

                    <div className="max-w-full">
                        
                    
                        
                            {posts.length > 0 ? (
                                
                                <Pagination
                                    data={posts}
                                    RenderComponent={Post}
                                    title="Posts"
                                    pageLimit={5}
                                    dataLimit={9}
                                />
                                
                            ) : (
                            <h1>No events to display.</h1>
                            )}
                        
                    

                    </div>
                
               
               

        </div>
      </main>
      <footer>
        <div className="mt-[40px] grid place-content-center text-center cursor-pointer">
          <p><Link href="/"><Image src="/images/home.png" width="80" height="80" /></Link></p>
          <p className="text-sm pt-[20px]">By <Link href="https://contrabandinteractive.com">Contraband Interactive</Link></p>
        </div>
      </footer>

    </div>
  )
}

export async function getServerSideProps(context) {
    var hostURL;
        if(context.req.headers.host=="localhost:3000"){
          hostURL = 'http://localhost:3000';
        }
        else{
          hostURL = 'https://'+context.req.headers.host;
    }

    var endpoint;
    if(context.req.headers.host=="localhost:3000"){
      endpoint = 'http://localhost:3000/api/get_all_events'
    }
    else{
      endpoint = 'https://'+context.req.headers.host+'/api/get_all_events'
    }
    console.log(endpoint);

    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    }
    const response = await fetch(endpoint, options)
    const result = await response.json()
    const predata = result;

    return { props: { predata, hostURL } }

  
}

export default Events
