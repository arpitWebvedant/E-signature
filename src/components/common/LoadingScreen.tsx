'use client';

import { useEffect, useState } from 'react';
import Image from "next/image"

export function LoadingScreen({
  message = 'Verifying your login credentials...',
  subMessage = "Just a moment please...",
}) {
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => (prev >= 100 ? 100 : prev + 2));
    }, 100);

    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => {
      clearInterval(progressInterval);
      clearInterval(dotsInterval);
    };
  }, []);

  return (
    <div className="flex flex-col justify-center items-center p-8 h-screen text-center">
    <Image
      src="/pngImages/IconContainer.png"
      alt="Authenticating"
      width={100}
      height={100}
      // className="mb-4"
    />
    <h2 className="text-2xl font-semibold text-[#3353F8] mb-4">Authenticating</h2>
    <div className="overflow-hidden w-64 h-2 bg-gray-100 rounded-full">
      <div 
        className="h-full bg-[#3353F8] rounded-full animate-[loading_2s_ease-in-out_infinite]"
        style={{ width: `${progress}%` }}
      />
    </div>
    <p className="mt-4 text-sm text-gray-500">{message}</p>
  </div>
  );
}