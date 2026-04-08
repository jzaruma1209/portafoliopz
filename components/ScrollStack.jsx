"use client";
import { useLayoutEffect, useRef, useCallback } from 'react';
import './ScrollStack.css';

export const ScrollStackItem = ({ children, itemClassName = '' }) => (
  <div className={`scroll-stack-card ${itemClassName}`.trim()}>{children}</div>
);

const ScrollStack = ({
  children,
  className = '',
  itemDistance = 100,
  itemScale = 0.03,
  itemStackDistance = 30,
  stackPosition = '20%',
  scaleEndPosition = '10%',
  baseScale = 0.85,
  rotationAmount = 0,
  blurAmount = 0,
  useWindowScroll = false,
  onStackComplete
}) => {
  const scrollerRef = useRef(null);
  const stackCompletedRef = useRef(false);
  const rafRef = useRef(null);
  const cardsRef = useRef([]);
  const lastTransformsRef = useRef(new Map());
  // Cache absolute offsets so we don't read layout every scroll event
  const cardOffsetsRef = useRef([]);
  const endOffsetRef = useRef(0);
  const containerHeightRef = useRef(0);

  const parsePercentage = useCallback((value, containerHeight) => {
    if (typeof value === 'string' && value.includes('%')) {
      return (parseFloat(value) / 100) * containerHeight;
    }
    return parseFloat(value);
  }, []);

  // Recalculate cached positions (only on mount and resize)
  const recalcOffsets = useCallback(() => {
    const cards = cardsRef.current;
    if (!cards.length) return;

    if (useWindowScroll) {
      containerHeightRef.current = window.innerHeight;
      cardOffsetsRef.current = cards.map(card => {
        const rect = card.getBoundingClientRect();
        return rect.top + window.scrollY;
      });
      const endEl = document.querySelector('.scroll-stack-end');
      if (endEl) {
        const r = endEl.getBoundingClientRect();
        endOffsetRef.current = r.top + window.scrollY;
      }
    } else {
      const scroller = scrollerRef.current;
      if (!scroller) return;
      containerHeightRef.current = scroller.clientHeight;
      cardOffsetsRef.current = cards.map(card => card.offsetTop);
      const endEl = scroller.querySelector('.scroll-stack-end');
      endOffsetRef.current = endEl ? endEl.offsetTop : 0;
    }
  }, [useWindowScroll]);

  const updateCardTransforms = useCallback(() => {
    const cards = cardsRef.current;
    if (!cards.length) return;

    const scrollTop = useWindowScroll
      ? window.scrollY
      : (scrollerRef.current?.scrollTop ?? 0);

    const containerHeight = containerHeightRef.current;
    const stackPositionPx = parsePercentage(stackPosition, containerHeight);
    const scaleEndPositionPx = parsePercentage(scaleEndPosition, containerHeight);
    const endElementTop = endOffsetRef.current;

    cards.forEach((card, i) => {
      if (!card) return;

      const cardTop = cardOffsetsRef.current[i] ?? 0;
      const triggerStart = cardTop - stackPositionPx - itemStackDistance * i;
      const triggerEnd = cardTop - scaleEndPositionPx;
      const pinStart = triggerStart;
      const pinEnd = endElementTop - containerHeight / 2;

      // Scale progress: 0 → 1 as scroll goes from triggerStart to triggerEnd
      let scaleProgress = 0;
      if (scrollTop >= triggerEnd) scaleProgress = 1;
      else if (scrollTop > triggerStart) scaleProgress = (scrollTop - triggerStart) / (triggerEnd - triggerStart);

      const targetScale = baseScale + i * itemScale;
      const scale = 1 - scaleProgress * (1 - targetScale);
      const rotation = rotationAmount ? i * rotationAmount * scaleProgress : 0;

      // Blur: cards deeper in stack get more blur
      let blur = 0;
      if (blurAmount) {
        let topCardIndex = 0;
        for (let j = 0; j < cards.length; j++) {
          const jCardTop = cardOffsetsRef.current[j] ?? 0;
          const jTriggerStart = jCardTop - stackPositionPx - itemStackDistance * j;
          if (scrollTop >= jTriggerStart) topCardIndex = j;
        }
        if (i < topCardIndex) {
          blur = Math.max(0, (topCardIndex - i) * blurAmount);
        }
      }

      // Pin/translate
      let translateY = 0;
      const isPinned = scrollTop >= pinStart && scrollTop <= pinEnd;
      if (isPinned) {
        translateY = scrollTop - cardTop + stackPositionPx + itemStackDistance * i;
      } else if (scrollTop > pinEnd) {
        translateY = pinEnd - cardTop + stackPositionPx + itemStackDistance * i;
      }

      // Round to avoid sub-pixel jitter
      const ty = Math.round(translateY * 10) / 10;
      const sc = Math.round(scale * 1000) / 1000;
      const ro = Math.round(rotation * 10) / 10;
      const bl = Math.round(blur * 10) / 10;

      const last = lastTransformsRef.current.get(i);
      const changed =
        !last ||
        Math.abs(last.ty - ty) > 0.05 ||
        Math.abs(last.sc - sc) > 0.0005 ||
        Math.abs(last.ro - ro) > 0.05 ||
        Math.abs(last.bl - bl) > 0.05;

      if (changed) {
        card.style.transform = `translate3d(0, ${ty}px, 0) scale(${sc}) rotate(${ro}deg)`;
        card.style.filter = bl > 0 ? `blur(${bl}px)` : '';
        card.style.zIndex = String(i + 1);
        lastTransformsRef.current.set(i, { ty, sc, ro, bl });
      }

      // Fire onStackComplete callback
      if (i === cards.length - 1) {
        const isInView = scrollTop >= pinStart && scrollTop <= pinEnd;
        if (isInView && !stackCompletedRef.current) {
          stackCompletedRef.current = true;
          onStackComplete?.();
        } else if (!isInView && stackCompletedRef.current) {
          stackCompletedRef.current = false;
        }
      }
    });
  }, [
    itemScale,
    itemStackDistance,
    stackPosition,
    scaleEndPosition,
    baseScale,
    rotationAmount,
    blurAmount,
    useWindowScroll,
    onStackComplete,
    parsePercentage,
  ]);

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    // Gather card elements
    const cards = Array.from(
      useWindowScroll
        ? document.querySelectorAll('.scroll-stack-card')
        : scroller.querySelectorAll('.scroll-stack-card')
    );
    cardsRef.current = cards;

    // Apply GPU-acceleration hints once, not every frame
    cards.forEach((card, i) => {
      if (i < cards.length - 1) card.style.marginBottom = `${itemDistance}px`;
      card.style.willChange = 'transform';
      card.style.transformOrigin = 'top center';
      card.style.backfaceVisibility = 'hidden';
    });

    // Cache positions once on mount
    recalcOffsets();

    // Initial render
    updateCardTransforms();

    // Scroll handler: one RAF per scroll event (not a permanent loop)
    const onScroll = () => {
      if (rafRef.current) return; // already scheduled
      rafRef.current = requestAnimationFrame(() => {
        updateCardTransforms();
        rafRef.current = null;
      });
    };

    // Resize handler: recache positions then re-render
    const onResize = () => {
      recalcOffsets();
      updateCardTransforms();
    };

    const scrollTarget = useWindowScroll ? window : scroller;
    scrollTarget.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });

    return () => {
      scrollTarget.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      stackCompletedRef.current = false;
      cardsRef.current = [];
      cardOffsetsRef.current = [];
      lastTransformsRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemDistance, useWindowScroll]);

  return (
    <div className={`scroll-stack-scroller ${className}`.trim()} ref={scrollerRef}>
      <div className="scroll-stack-inner">
        {children}
        <div className="scroll-stack-end" />
      </div>
    </div>
  );
};

export default ScrollStack;
