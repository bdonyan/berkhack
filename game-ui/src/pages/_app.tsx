import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { Toaster } from 'react-hot-toast';

function EloquenceApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Eloquence.AI - Public Speaking Trainer</title>
        <meta
          name="description"
          content="Real-time public speaking feedback with AI-powered analysis"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Toaster position="top-center" reverseOrder={false} />
      <Component {...pageProps} />
    </>
  );
}

export default EloquenceApp; 