import React from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Script from 'next/script';
import { useRouter } from 'next/router';
import { IconCircleArrowLeftFilled } from '@tabler/icons-react';

const Layout = ({ children }) => {
  const router = useRouter();
  const isHomePage = router.pathname === '/';

  return (
    <>
      <Head>
        <title>Arica</title>
      </Head>
      <div className="page">
        <header className="navbar navbar-expand-md navbar-dark bg-primary text-dark d-print-none">
          <div className="container-xl">
            <h1 className="navbar-brand navbar-brand-autodark d-none-navbar-horizontal pe-0 pe-md-3">
              <Link href="/" className="h2 mb-0 text-decoration-none d-flex align-items-center">
                {!isHomePage && (
                  <IconCircleArrowLeftFilled
                    size={30}
                    className="text-orange me-2"
                  />
                )}
                <img id="logo" src="/img/logo-inverted.svg" alt="Logo" />
              </Link>
            </h1>
            <button className="navbar-toggler text-orange" type="button" data-bs-toggle="collapse" data-bs-target="#navbar-menu">
              <span className="navbar-toggler-icon"></span>
            </button>
          </div>
        </header>
        <div className="page-wrapper">
          <div className="page-body">
            <div className="container-xl">
              <div className="row row-deck row-cards">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Script 
        src="https://cdn.jsdelivr.net/npm/@tabler/core@1.0.0-beta17/dist/js/tabler.min.js"
        strategy="afterInteractive"
      />
    </>
  );
};

export default Layout;