import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';

function EloquenceApp({ Component, pageProps }: AppProps) {
  const { isAuthenticated } = useAuthStore();

  // Initialize auth state on app load
  useEffect(() => {
    // The auth store will automatically hydrate from localStorage
    // This ensures authentication state is restored on page refresh
  }, []);

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
      <Toaster 
        position="top-center" 
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Component {...pageProps} />
    </>
  );
}

export default EloquenceApp; 