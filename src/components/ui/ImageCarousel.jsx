/* eslint-disable react/no-array-index-key */
/* eslint-disable consistent-return */

'use client';

import Image from 'next/image';
import React, { useEffect, useMemo, useState } from 'react';

export default function ImageCarousel({
  slidesData = [],
  autoPlay = true,
  interval = 2500,
  showArrows = true,
  showDots = true,
  className = '',
}) {
  const slides = useMemo(() => slidesData, [slidesData]);

  // add clone slide at end (only if more than 1 slide)
  const extendedSlides = useMemo(() => {
    if (slides.length <= 1) return slides;
    return [...slides, slides[0]];
  }, [slides]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [enableTransition, setEnableTransition] = useState(true);

  useEffect(() => {
    if (!autoPlay || slides.length <= 1) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => prev + 1);
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, slides.length]);

  // when reach last clone slide, jump to real first without animation
  useEffect(() => {
    if (slides.length <= 1) return;

    if (activeIndex === slides.length) {
      const timeout = setTimeout(() => {
        setEnableTransition(false); // disable animation
        setActiveIndex(0); // jump to first
      }, 500); // same as transition duration

      return () => clearTimeout(timeout);
    }

    // enable animation normally
    setEnableTransition(true);
  }, [activeIndex, slides.length]);

  const prevSlide = () => {
    if (slides.length <= 1) return;

    // If we are at first slide and user clicks prev
    if (activeIndex === 0) {
      setEnableTransition(false);
      setActiveIndex(slides.length - 1);

      setTimeout(() => {
        setEnableTransition(true);
      }, 50);
      return;
    }

    setActiveIndex((prev) => prev - 1);
  };

  const nextSlide = () => {
    if (slides.length <= 1) return;
    setActiveIndex((prev) => prev + 1);
  };

  if (!slides.length) return null;

  // for dots: real index only
  const realIndex = activeIndex === slides.length ? 0 : activeIndex;

  return (
    <div className={`${className} relative w-full`}>
      {/* Card */}
      <div className="mx-auto w-full max-w-[678px] overflow-hidden rounded-md bg-white p-3 shadow-sm">
        {/* Slider Wrapper */}
        <div className="w-full overflow-hidden rounded-md bg-white">
          <div className="relative aspect-[12/10] w-full overflow-hidden rounded-md">
            {/* Sliding Track */}
            <div
              className={`flex h-full w-full ${
                enableTransition
                  ? 'transition-transform duration-500 ease-in-out'
                  : ''
              }`}
              style={{
                transform: `translateX(-${activeIndex * 100}%)`,
              }}
            >
              {extendedSlides.map((slide, idx) => (
                <div
                  key={`${slide?.id || slide?.src}-${idx}`}
                  className="relative h-full w-full flex-shrink-0"
                >
                  <Image
                    src={slide?.src}
                    alt={slide?.alt || 'carousel-image'}
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Text Slider */}
        <div className="mt-3 w-full overflow-hidden">
          <div
            className={`flex w-full ${
              enableTransition
                ? 'transition-transform duration-500 ease-in-out'
                : ''
            }`}
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {extendedSlides.map((slide, idx) => (
              <div
                key={`${slide?.id || slide?.src}-text-${idx}`}
                className="w-full flex-shrink-0"
              >
                <h3 className="text-sm font-semibold text-gray-900 sm:text-base">
                  {slide?.title}
                </h3>

                <p className="mt-1 line-clamp-2 text-xs text-gray-600 sm:text-sm">
                  {slide?.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Arrows */}
      {showArrows && slides.length > 1 && (
        <div className="mx-auto mt-4 flex max-w-[678px] items-center justify-between">
          <button
            type="button"
            onClick={prevSlide}
            className="rounded-full bg-white/80 px-3 py-2 text-sm font-semibold shadow hover:bg-white"
          >
            ←
          </button>

          <button
            type="button"
            onClick={nextSlide}
            className="rounded-full bg-white/80 px-3 py-2 text-sm font-semibold shadow hover:bg-white"
          >
            →
          </button>
        </div>
      )}

      {/* Dots */}
      {showDots && slides.length > 1 && (
        <div className="mx-auto mt-4 flex max-w-[678px] items-center justify-center gap-2">
          {slides.map((slide, idx) => (
            <button
              key={slide?.id || idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`h-2 w-2 rounded-full transition-all duration-300 ${
                idx === realIndex ? 'w-5 bg-primary' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
