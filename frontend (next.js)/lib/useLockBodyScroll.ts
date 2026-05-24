'use client';
import { useLayoutEffect } from 'react';

let modalCount = 0;

export function useLockBodyScroll(shouldLock: boolean) {
  useLayoutEffect(() => {
    if (shouldLock) {
      modalCount++;
      if (modalCount === 1) {
        const main = document.querySelector('main') as HTMLElement | null;
        if (main) main.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
      }
      return () => {
        modalCount--;
        if (modalCount === 0) {
          const main = document.querySelector('main') as HTMLElement | null;
          if (main) main.style.overflow = '';
          document.body.style.overflow = '';
          document.documentElement.style.overflow = '';
        }
      };
    }
  }, [shouldLock]);
}
