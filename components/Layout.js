import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Script from 'next/script';
import { useRouter } from 'next/router';
import { IconInfoCircleFilled, IconLogout, IconLogin } from '@tabler/icons-react';
import { TimeRangeContext } from '../contexts/TimeRangeContext';
import { useAuth } from '../contexts/AuthContext';
import LoginModal from '../components/LoginModal';

const Layout = ({ children }) => {
  const router = useRouter();
  const isHomePage = router.pathname === '/';
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { user, signOut } = useAuth();
  
  // Initialize timeRange from localStorage if available, otherwise default to 24
  const [timeRange, setTimeRange] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTimeRange = localStorage.getItem('timeRange');
      return savedTimeRange ? parseInt(savedTimeRange) : 24;
    }
    return 24;
  });

  // Save to localStorage whenever timeRange changes
  useEffect(() => {
    localStorage.setItem('timeRange', timeRange.toString());
  }, [timeRange]);

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowOffcanvas(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleLoginClick = () => {
    setShowOffcanvas(false);
    setShowLoginModal(true);
  };

  const showTimeSelector = ['/', '/temperature', '/wind', '/pressure', '/waves'].includes(router.pathname);

  return (
    <TimeRangeContext.Provider value={{ timeRange, setTimeRange }}>
      <Head>
        <title>Puerto de Arica</title>
      </Head>
      <div className="page">
        {/* Header with corrected onClick handler */}
        <header className="navbar navbar-expand-md navbar-dark bg-primary text-dark d-print-none">
          <div className="container-xl position-relative">
            {/* Left side - Brand */}
            <h1 className="navbar-brand navbar-brand-autodark d-none-navbar-horizontal pe-0 pe-md-3 mb-0">
              <Link href="/" className="h2 mb-0 text-decoration-none d-flex align-items-center">
                <img id="logo" src="/img/logo-inverted.svg" alt="Logo" />
              </Link>
            </h1>
            
            {/* Center - Time Range Selector */}
            {showTimeSelector && (
              <div className="position-absolute start-0 end-0 mx-auto d-flex justify-content-center" 
                   style={{ pointerEvents: 'none', zIndex: 1 }}>
                <div style={{ pointerEvents: 'auto' }}>
                  <select 
                    className="form-select w-auto"
                    value={timeRange}
                    onChange={(e) => setTimeRange(Number(e.target.value))}
                  >
                    <option value={24}>24h</option>
                    <option value={12}>12h</option>
                    <option value={6}>6h</option>
                  </select>
                </div>
              </div>
            )}
            
            {/* Right side - Info Button with corrected onClick handler */}
            <div className="navbar-nav flex-row order-md-last px-3">
              <div className="nav-item">
                <button 
                  className="nav-link px-0 border-0 bg-transparent" 
                  onClick={() => setShowOffcanvas(true)}
                  aria-label="Open information"
                >
                  <IconInfoCircleFilled size={30} color="#F28B2F" />
                </button>
              </div>
            </div>
          </div>
        </header>

      {/* Modified Offcanvas */}
      <div className={`offcanvas offcanvas-end ${showOffcanvas ? 'show' : ''}`} 
             tabIndex="-1" 
             id="infoOffcanvas"
             aria-labelledby="infoOffcanvasLabel">
          <div className="offcanvas-header">
            <h5 className="offcanvas-title" id="infoOffcanvasLabel">Sobre el sistema</h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setShowOffcanvas(false)}
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
              Esta tecnología optimiza las operaciones portuarias y refuerza la seguridad marítima del Puerto de Arica, siendo especialmente relevante ante el aumento de marejadas por el cambio climático, lo que posiciona al puerto a la vanguardia en la macrozona norte.
            </p>
            <p>
              La boya está equipada con medidores de oleaje, estación meteorológica y sistemas de comunicación satelital, operando de manera autónoma gracias a su alimentación por energía solar.
            </p>
            <p>
              Este sistema de última generación representa una inversión de más de 150 millones de pesos, permitiendo monitorear en tiempo real las condiciones marítimas y meteorológicas del puerto.
            </p>
          </div>
          {/* New sticky footer */}
          <div className="offcanvas-footer border-top p-3" style={{ position: 'sticky', bottom: 0, background: 'white' }}>
            {user ? (
              <div className="d-flex justify-content-between align-items-center">
                <div className="text-truncate me-2">
                  <small className="text-muted d-block">Usuario actual</small>
                  <strong>{user.email}</strong>
                </div>
                <button 
                  className="btn btn-danger"
                  onClick={handleSignOut}
                >
                  <IconLogout className="me-1"/>
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <button 
                className="btn btn-primary w-100"
                onClick={handleLoginClick}
              >
                <IconLogin className="me-1"/>
                Iniciar sesión
              </button>
            )}
          </div>
        </div>

        {/* Backdrop */}
        {showOffcanvas && (
          <div 
            className="offcanvas-backdrop fade show" 
            onClick={() => setShowOffcanvas(false)}
          ></div>
        )}

        {/* Login Modal */}
        <LoginModal 
          isOpen={showLoginModal} 
          onClose={() => setShowLoginModal(false)} 
        />

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
            <div className="row">
              <div className="col-12">
                <div className="d-flex flex-wrap justify-content-center align-items-center gap-3">
                  <div>Empresa Portuaria Arica © 2024</div>
                  <div>
                    <a href="https://www.google.cl/maps/place/M%C3%A1ximo+Lira+389,+Arica,+Regi%C3%B3n+de+Arica+y+Parinacota/@-18.476221,-70.3212228,17z/data=!3m1!4b1!4m2!3m1!1s0x915aa9919caea8d3:0x7789ee7a703f8688" 
                      target="_blank" 
                      rel="noopener noreferrer">
                      Avda. Máximo Lira #389, Arica
                    </a>
                  </div>
                  <div>
                    Fono: <a href="tel:+56582593400">(+5658) 2593400</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
      <Script 
        src="https://cdn.jsdelivr.net/npm/@tabler/core@1.0.0-beta17/dist/js/tabler.min.js"
        strategy="afterInteractive"
      />
    </TimeRangeContext.Provider>
  );
};

export default Layout;