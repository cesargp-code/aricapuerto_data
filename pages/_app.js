import '../styles/globals.css'
import Script from 'next/script'
import { AuthProvider } from '../contexts/AuthContext'

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-TSVEFD13BQ"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-TSVEFD13BQ');
        `}
      </Script>
      <Component {...pageProps} />
    </AuthProvider>
  )
}

export default MyApp