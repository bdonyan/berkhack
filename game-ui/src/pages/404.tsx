import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';

export default function Custom404() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>404 - Page Not Found | Eloquence.AI</title>
        <meta name="description" content="Page not found" />
      </Head>

      <div className="max-w-md w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-6xl font-bold text-blue-600 mb-4">404</h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h2>
          <p className="text-gray-600 mb-8">
            Sorry, the page you're looking for doesn't exist. 
            It might have been moved or deleted.
          </p>
          
          <div className="space-y-4">
            <Link 
              href="/"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Home className="w-5 h-5 mr-2" />
              Go to Homepage
            </Link>
            
            <div>
              <button 
                onClick={() => window.history.back()}
                className="inline-flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 