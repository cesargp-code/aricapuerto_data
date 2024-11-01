import React, { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Script from 'next/script';
import { useRouter } from 'next/router';
import { IconInfoCircleFilled } from '@tabler/icons-react';

const Layout = ({ children }) => {
  const router = useRouter();
  const isHomePage = router.pathname === '/';
  const [showOffcanvas, setShowOffcanvas] = useState(false);

  const toggleOffcanvas = () => {
    setShowOffcanvas(!showOffcanvas);
  };

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
                <img id="logo" src="/img/logo-inverted.svg" alt="Logo" />
              </Link>
            </h1>
            <div className="navbar-nav flex-row order-md-last">
              <div className="nav-item">
                <button 
                  className="nav-link px-0 border-0 bg-transparent" 
                  onClick={toggleOffcanvas}
                  aria-label="Open information"
                >
                  <IconInfoCircleFilled size={30} color="#F28B2F" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Offcanvas */}
        <div className={`offcanvas offcanvas-end ${showOffcanvas ? 'show' : ''}`} 
             tabIndex="-1" 
             id="infoOffcanvas"
             aria-labelledby="infoOffcanvasLabel">
          <div className="offcanvas-header">
            <h5 className="offcanvas-title" id="infoOffcanvasLabel">Sobre el sistema</h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={toggleOffcanvas}
              aria-label="Close"
            ></button>
          </div>
          <div className="offcanvas-body">
            <img 
              src="/img/buoy_pic.jpg" 
              alt="Boya oceanográfica" 
              className="img-fluid rounded mb-3 w-100"
            />
            <p>
            Este sistema de última generación representa una inversión de más de 150 millones de pesos para monitorear en tiempo real las condiciones marítimas y meteorológicas del Puerto de Arica.
            </p>
            <p>
            La boya está equipada con medidores de oleaje, estación meteorológica y sistemas de comunicación satelital, operando de manera autónoma gracias a su alimentación por energía solar.
            </p>
            <p>
            Esta tecnología optimiza las operaciones portuarias y refuerza la seguridad marítima, especialmente relevante ante el aumento de marejadas por el cambio climático, posicionando al Puerto de Arica a la vanguardia en la macrozona norte.
            </p>
          </div>
        </div>

        {/* Backdrop */}
        {showOffcanvas && (
          <div 
            className="offcanvas-backdrop fade show" 
            onClick={toggleOffcanvas}
          ></div>
        )}

        <div className="page-wrapper">
          <div className="page-body">
            <div className="container-xl">
              <div className="row row-deck row-cards">
                {children}
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <footer className="footer d-print-none">
          <div className="container-xl">
            <div className="row text-center align-items-center flex-row-reverse">
              <div className="col-lg-auto ms-lg-auto">
              </div>
              <div className="col-12 col-lg-auto mt-3 mt-lg-0">
                <ul className="list-inline list-inline-dots mb-0">
                  <li className="list-inline-item">
                    Empresa Portuaria Arica © 2024
                  </li>
                  <li className="list-inline-item">
                    <a href="https://www.google.cl/maps/place/M%C3%A1ximo+Lira+389,+Arica,+Regi%C3%B3n+de+Arica+y+Parinacota/@-18.476221,-70.3212228,17z/data=!3m1!4b1!4m2!3m1!1s0x915aa9919caea8d3:0x7789ee7a703f8688" target="_blank">Avda. Máximo Lira #389, Arica</a>
                  </li>
                  <li className="list-inline-item">
                    Fono: <a href="tel:+56582593400">(+5658) 2593400</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </footer>
      </div>
      <Script 
        src="https://cdn.jsdelivr.net/npm/@tabler/core@1.0.0-beta17/dist/js/tabler.min.js"
        strategy="afterInteractive"
      />
    </>
  );
};

export default Layout;