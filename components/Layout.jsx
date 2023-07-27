import React from "react";
  
const Header = () => {
  return (
    <>
      <Head>
        <title>TKTZ</title>
        <link rel="icon" href="/favicon.ico" />
        <style>
        @import url('https://fonts.googleapis.com/css2?family=Poiret+One&display=swap');
        </style>
      </Head>
    </>
  );
};
  
const Footer = () => {
  return <p>TKTZ</p>;
};
  
const Layout = ({ children }) => {
  return (
    
      <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <Header />
      {children}
      <Footer />
      </div>
    
  );
};
  
export default Layout;