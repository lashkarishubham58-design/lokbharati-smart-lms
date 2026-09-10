import React, { createContext, useContext, useState, useRef, useCallback, useEffect, ReactNode } from 'react';

export interface LoadingContextType {
  isLoading: boolean;
  isVisible: boolean;
  isFadingOut: boolean;
  loadingMessage: string;
  startLoading: (id?: string, message?: string) => string;
  stopLoading: (id: string) => void;
  withLoading: <T>(
    promiseOrAsyncFn: Promise<T> | (() => Promise<T>),
    message?: string
  ) => Promise<T>;
  triggerPageTransition: (message?: string, minDurationMs?: number) => Promise<void>;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

const MINIMUM_LOADING_DURATION_MS = 1000;
const FADE_OUT_DURATION_MS = 350;
const FAILSAFE_TIMEOUT_MS = 12000; // Auto-clear after 12s if stuck

interface ActiveRequest {
  id: string;
  startTime: number;
  message?: string;
}

export const LoadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeRequests, setActiveRequests] = useState<Map<string, ActiveRequest>>(new Map());
  const [isVisible, setIsVisible] = useState<boolean>(true); // Initial startup load begins true
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('Initializing Lokbharti LMS...');

  const firstRequestStartTimeRef = useRef<number>(Date.now());
  const requestCounterRef = useRef<number>(0);
  const timeoutHandleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeHandleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const failsafeHandleRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Helper to clear existing timeouts
  const clearTimers = useCallback(() => {
    if (timeoutHandleRef.current) {
      clearTimeout(timeoutHandleRef.current);
      timeoutHandleRef.current = null;
    }
    if (fadeHandleRef.current) {
      clearTimeout(fadeHandleRef.current);
      fadeHandleRef.current = null;
    }
    if (failsafeHandleRef.current) {
      clearTimeout(failsafeHandleRef.current);
      failsafeHandleRef.current = null;
    }
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  // Evaluate and transition loading state whenever activeRequests changes
  const evaluateState = useCallback((currentRequests: Map<string, ActiveRequest>) => {
    if (currentRequests.size > 0) {
      // Active requests present - cancel any hide timers and make visible
      clearTimers();
      setIsFadingOut(false);
      setIsVisible(true);

      // Find the latest specified message
      const entries = Array.from(currentRequests.values());
      const lastMessageEntry = [...entries].reverse().find((e) => !!e.message);
      if (lastMessageEntry?.message) {
        setLoadingMessage(lastMessageEntry.message);
      }

      // Start failsafe timer in case an unhandled network error leaves a dangling request
      failsafeHandleRef.current = setTimeout(() => {
        console.warn('Loading safety timer expired. Auto-dismissing hanging loader.');
        setActiveRequests(new Map());
      }, FAILSAFE_TIMEOUT_MS);
    } else {
      // All requests finished - enforce minimum 1 second duration
      const now = Date.now();
      const elapsed = now - firstRequestStartTimeRef.current;
      const remainingMinTime = Math.max(0, MINIMUM_LOADING_DURATION_MS - elapsed);

      clearTimers();

      timeoutHandleRef.current = setTimeout(() => {
        setIsFadingOut(true);

        fadeHandleRef.current = setTimeout(() => {
          setIsVisible(false);
          setIsFadingOut(false);
          setLoadingMessage('Loading...');
        }, FADE_OUT_DURATION_MS);
      }, remainingMinTime);
    }
  }, [clearTimers]);

  // Initial startup load
  useEffect(() => {
    const initialId = 'initial_app_startup';
    const initialReq: ActiveRequest = {
      id: initialId,
      startTime: Date.now(),
      message: 'Loading University Portal & Academic Data...',
    };
    firstRequestStartTimeRef.current = Date.now();
    setActiveRequests(new Map([[initialId, initialReq]]));

    // Release initial app load after initial boot cycle
    const timer = setTimeout(() => {
      stopLoading(initialId);
    }, 450);

    return () => clearTimeout(timer);
  }, []);

  const startLoading = useCallback((id?: string, message?: string): string => {
    const reqId = id || `req_${Date.now()}_${++requestCounterRef.current}`;
    setActiveRequests((prev) => {
      const next = new Map(prev);
      if (next.size === 0) {
        firstRequestStartTimeRef.current = Date.now();
      }
      next.set(reqId, {
        id: reqId,
        startTime: Date.now(),
        message: message || 'Loading...',
      });
      evaluateState(next);
      return next;
    });
    return reqId;
  }, [evaluateState]);

  const stopLoading = useCallback((id: string) => {
    setActiveRequests((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Map(prev);
      next.delete(id);
      evaluateState(next);
      return next;
    });
  }, [evaluateState]);

  const withLoading = useCallback(async <T,>(
    promiseOrAsyncFn: Promise<T> | (() => Promise<T>),
    message?: string
  ): Promise<T> => {
    const reqId = startLoading(undefined, message);
    try {
      if (typeof promiseOrAsyncFn === 'function') {
        return await (promiseOrAsyncFn as () => Promise<T>)();
      }
      return await promiseOrAsyncFn;
    } finally {
      stopLoading(reqId);
    }
  }, [startLoading, stopLoading]);

  const triggerPageTransition = useCallback(async (message = 'Loading...', minDurationMs = MINIMUM_LOADING_DURATION_MS): Promise<void> => {
    const reqId = startLoading(undefined, message);
    await new Promise((resolve) => setTimeout(resolve, Math.min(minDurationMs, 400)));
    stopLoading(reqId);
  }, [startLoading, stopLoading]);

  const isLoading = activeRequests.size > 0;

  return (
    <LoadingContext.Provider
      value={{
        isLoading,
        isVisible,
        isFadingOut,
        loadingMessage,
        startLoading,
        stopLoading,
        withLoading,
        triggerPageTransition,
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};
