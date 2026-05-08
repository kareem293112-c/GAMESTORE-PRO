import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top immediately
    window.scrollTo(0, 0);
    document.documentElement.scrollTo(0, 0);
    
    // Safety fallback for some browsers/layouts
    const scrollTask = requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      document.body.scrollTo(0, 0);
    });

    return () => cancelAnimationFrame(scrollTask);
  }, [pathname]);

  return null;
};
