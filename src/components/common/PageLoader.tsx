'use client';
import { useState, useEffect } from 'react';
import Lottie from 'lottie-react';

export function PageLoader() {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    fetch('https://lottie.host/a7042a5c-1934-4091-9878-185442539090/pQkK3j1VqN.json')
      .then(res => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then(data => setAnimationData(data))
      .catch(error => console.error("Failed to load Lottie animation:", error));
  }, []);

  if (!animationData) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="w-40 h-40">
        <Lottie animationData={animationData} loop={true} />
      </div>
    </div>
  );
}
