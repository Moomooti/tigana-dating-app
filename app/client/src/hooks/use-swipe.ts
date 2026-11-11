import { useState, useCallback } from "react";

export interface SwipeState {
  isDragging: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  deltaX: number;
  deltaY: number;
}

const initialState: SwipeState = {
  isDragging: false,
  startX: 0,
  startY: 0,
  currentX: 0,
  currentY: 0,
  deltaX: 0,
  deltaY: 0,
};

export interface UseSwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  threshold?: number;
}

export function useSwipe({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  threshold = 100,
}: UseSwipeOptions = {}) {
  const [swipeState, setSwipeState] = useState<SwipeState>(initialState);

  const handleStart = useCallback((clientX: number, clientY: number) => {
    setSwipeState({
      ...initialState,
      isDragging: true,
      startX: clientX,
      startY: clientY,
      currentX: clientX,
      currentY: clientY,
    });
  }, []);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    setSwipeState((prev) => {
      if (!prev.isDragging) return prev;
      
      return {
        ...prev,
        currentX: clientX,
        currentY: clientY,
        deltaX: clientX - prev.startX,
        deltaY: clientY - prev.startY,
      };
    });
  }, []);

  const handleEnd = useCallback(() => {
    setSwipeState((prev) => {
      if (!prev.isDragging) return prev;

      const { deltaX, deltaY } = prev;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      // Determine swipe direction based on dominant axis and threshold
      if (absY > absX && absY > threshold) {
        // Vertical swipe
        if (deltaY < 0) {
          onSwipeUp?.();
        }
      } else if (absX > threshold) {
        // Horizontal swipe
        if (deltaX > 0) {
          onSwipeRight?.();
        } else {
          onSwipeLeft?.();
        }
      }

      return initialState;
    });
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, threshold]);

  const swipeHandlers = {
    onMouseDown: (e: React.MouseEvent) => {
      e.preventDefault();
      handleStart(e.clientX, e.clientY);
    },
    onMouseMove: (e: React.MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    },
    onMouseUp: handleEnd,
    onMouseLeave: handleEnd,
    
    onTouchStart: (e: React.TouchEvent) => {
      const touch = e.touches[0];
      handleStart(touch.clientX, touch.clientY);
    },
    onTouchMove: (e: React.TouchEvent) => {
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    },
    onTouchEnd: handleEnd,
  };

  return {
    swipeState,
    swipeHandlers,
  };
}
