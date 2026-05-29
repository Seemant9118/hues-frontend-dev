'use client';

import React, { useEffect, useRef, useState } from 'react';

export default function ScrollReveal({
  children,
  className = '',
  animation = 'slide-up', // 'fade-in' | 'slide-up' | 'slide-left' | 'slide-right' | 'scale-up'
  delay = 0, // delay in ms
  duration = 700, // duration in ms
  threshold = 0.1, // trigger when 10% visible
}) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -50px 0px', // trigger slightly before entering view
      },
    );

    const currentElement = elementRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [threshold]);

  // Base transitions
  const baseClasses = 'transition-all ease-out';

  // Animation-specific styles
  const getAnimationStyles = () => {
    if (isVisible) {
      return 'opacity-100 translate-y-0 translate-x-0 scale-100';
    }

    switch (animation) {
      case 'fade-in':
        return 'opacity-0';
      case 'slide-left':
        return 'opacity-0 -translate-x-8';
      case 'slide-right':
        return 'opacity-0 translate-x-8';
      case 'scale-up':
        return 'opacity-0 scale-95';
      case 'slide-up':
      default:
        return 'opacity-0 translate-y-8';
    }
  };

  const style = {
    transitionDuration: `${duration}ms`,
    transitionDelay: `${delay}ms`,
  };

  return (
    <div
      ref={elementRef}
      className={`${baseClasses} ${getAnimationStyles()} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
