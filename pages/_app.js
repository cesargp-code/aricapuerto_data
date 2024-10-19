import '../styles/globals.css'
import '@tabler/core/dist/css/tabler.min.css'
import { useEffect } from 'react'

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    require('@tabler/core/dist/js/tabler.min.js')
  }, [])

  return <Component {...pageProps} />
}

export default MyApp