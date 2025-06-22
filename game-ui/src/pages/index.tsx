import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../stores/authStore';

export default function Index() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/home');
    }
  }, [isAuthenticated, router]);

  return null; // This page will redirect immediately
} 