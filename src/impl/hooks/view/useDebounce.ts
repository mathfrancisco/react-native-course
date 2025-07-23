/**
 * 🪝 useDebounce - Hook para Debounce de Valores
 * 
 * Hook utilitário para debounce de valores, ideal para busca,
 * validação em tempo real e otimização de performance.
 * 
 * @author RecipeApp Team
 * @since Fase 3 - Implementation Layer
 */

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * 🎯 Configurações do debounce
 */
interface DebounceConfig {
  leading?: boolean;  // Executa na primeira chamada
  trailing?: boolean; // Executa após o delay (padrão)
  maxWait?: number;   // Tempo máximo de espera
}

/**
 * 📊 Estado do debounce
 */
interface DebounceState {
  isDebouncing: boolean;
  callCount: number;
  lastCallTime: number;
  lastValueTime: number;
}

/**
 * 🪝 Hook useDebounce básico
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * 🪝 Hook useDebounceCallback - Versão avançada para callbacks
 */
export function useDebounceCallback<TArgs extends any[]>(
  callback: (...args: TArgs) => void,
  delay: number,
  config: DebounceConfig = {}
): [(...args: TArgs) => void, DebounceState, () => void] {
  const {
    leading = false,
    trailing = true,
    maxWait = delay * 10,
  } = config;

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);
  const argsRef = useRef<TArgs>();
  
  const [state, setState] = useState<DebounceState>({
    isDebouncing: false,
    callCount: 0,
    lastCallTime: 0,
    lastValueTime: 0,
  });

  // Atualiza callback ref
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Executa o callback
  const executeCallback = useCallback(() => {
    if (argsRef.current) {
      callbackRef.current(...argsRef.current);
      setState(prev => ({
        ...prev,
        isDebouncing: false,
        lastValueTime: Date.now(),
      }));
    }
  }, []);

  // Cancela timers
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
      timeoutRef.current = null;
    }
    if (maxTimeoutRef.current) {
      clearTimeout(maxTimeoutRef.current);
      maxTimeoutRef.current = undefined;
      maxTimeoutRef.current = null;
    }
    setState(prev => ({ ...prev, isDebouncing: false }));
  }, []);

  // Função debouncificada
  const debouncedCallback = useCallback((...args: TArgs) => {
    argsRef.current = args;
    const now = Date.now();
    
    setState(prev => ({
      ...prev,
      callCount: prev.callCount + 1,
      lastCallTime: now,
      isDebouncing: true,
    }));

    // Execução imediata (leading)
    if (leading && !timeoutRef.current) {
      executeCallback();
      setState(prev => ({ ...prev, isDebouncing: false }));
    }

    // Cancela timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Execução após delay (trailing)
    if (trailing) {
      timeoutRef.current = setTimeout(() => {
        executeCallback();
        timeoutRef.current = undefined;
        timeoutRef.current = null;
        if (maxTimeoutRef.current) {
          clearTimeout(maxTimeoutRef.current);
          maxTimeoutRef.current = undefined;
          maxTimeoutRef.current = null;
        }
      }, delay);
    }

    // MaxWait timeout
    if (maxWait && !maxTimeoutRef.current) {
      maxTimeoutRef.current = setTimeout(() => {
        executeCallback();
        cancel();
      }, maxWait);
    }
  }, [delay, leading, trailing, maxWait, executeCallback, cancel]);

  // Cleanup
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return [debouncedCallback, state, cancel];
}

/**
 * 🪝 Hook useDebounceValue - Versão avançada para valores
 */
export function useDebounceValue<T>(
  value: T,
  delay: number,
  config: DebounceConfig & {
    equalityFn?: (prev: T, next: T) => boolean;
    immediate?: boolean;
  } = {}
): [T, DebounceState, () => void] {
  const {
    leading = false,
    trailing = true,
    maxWait = delay * 10,
    equalityFn = (a, b) => a === b,
    immediate = false,
  } = config;

  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const valueRef = useRef(value);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [state, setState] = useState<DebounceState>({
    isDebouncing: false,
    callCount: 0,
    lastCallTime: 0,
    lastValueTime: 0,
  });

  // Atualiza valor imediatamente se immediate = true
  useEffect(() => {
    if (immediate && !equalityFn(valueRef.current, value)) {
      setDebouncedValue(value);
      setState(prev => ({ ...prev, lastValueTime: Date.now() }));
    }
    valueRef.current = value;
  }, [value, immediate, equalityFn]);

  // Cancela timers
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
      timeoutRef.current = null;
    }
    if (maxTimeoutRef.current) {
      clearTimeout(maxTimeoutRef.current);
      maxTimeoutRef.current = undefined;
      maxTimeoutRef.current = null;
    }
    setState(prev => ({ ...prev, isDebouncing: false }));
  }, []);

  // Atualiza valor
  const updateValue = useCallback(() => {
    setDebouncedValue(valueRef.current);
    setState(prev => ({
      ...prev,
      isDebouncing: false,
      lastValueTime: Date.now(),
    }));
  }, []);

  useEffect(() => {
    // Ignora se valor não mudou
    if (equalityFn(debouncedValue, value)) {
      return;
    }

    const now = Date.now();
    setState(prev => ({
      ...prev,
      callCount: prev.callCount + 1,
      lastCallTime: now,
      isDebouncing: true,
    }));

    // Execução imediata (leading)
    if (leading && !timeoutRef.current) {
      updateValue();
      return;
    }

    // Cancela timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Execução após delay (trailing)
    if (trailing) {
      timeoutRef.current = setTimeout(() => {
        updateValue();
        timeoutRef.current = undefined;
        timeoutRef.current = null;
        if (maxTimeoutRef.current) {
          clearTimeout(maxTimeoutRef.current);
          maxTimeoutRef.current = undefined;
          maxTimeoutRef.current = null;
        }
      }, delay);
    }

    // MaxWait timeout
    if (maxWait && !maxTimeoutRef.current) {
      maxTimeoutRef.current = setTimeout(() => {
        updateValue();
        cancel();
      }, maxWait);
    }

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay, leading, trailing, maxWait, equalityFn, debouncedValue, updateValue, cancel]);

  // Cleanup final
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return [debouncedValue, state, cancel];
}

/**
 * 🪝 Hook useThrottle - Para throttling em vez de debounce
 */
export function useThrottle<T>(value: T, interval: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastExecuted = useRef<number>(0);

  useEffect(() => {
    const now = Date.now();
    
    if (now - lastExecuted.current >= interval) {
      setThrottledValue(value);
      lastExecuted.current = now;
    } else {
      const timer = setTimeout(() => {
        setThrottledValue(value);
        lastExecuted.current = Date.now();
      }, interval - (now - lastExecuted.current));

      return () => clearTimeout(timer);
    }
  }, [value, interval]);

  return throttledValue;
}

/**
 * 🪝 Hook useSearchDebounce - Especializado para busca
 */
export function useSearchDebounce(
  searchTerm: string,
  delay: number = 300,
  minLength: number = 2
): {
  debouncedSearchTerm: string;
  isSearching: boolean;
  shouldSearch: boolean;
  searchCount: number;
  cancel: () => void;
} {
  const [debouncedValue, state, cancel] = useDebounceValue(searchTerm, delay, {
    leading: false,
    trailing: true,
  });

  const shouldSearch = debouncedValue.trim().length >= minLength;
  const isSearching = state.isDebouncing && searchTerm.trim().length >= minLength;

  return {
    debouncedSearchTerm: debouncedValue,
    isSearching,
    shouldSearch,
    searchCount: state.callCount,
    cancel,
  };
}

/**
 * 🪝 Hook useFormDebounce - Para validação de formulários
 */
export function useFormDebounce<T extends Record<string, any>>(
  formValues: T,
  delay: number = 500
): {
  debouncedValues: T;
  hasChanges: boolean;
  changeCount: number;
  validationState: 'idle' | 'validating' | 'valid' | 'invalid';
} {
  const [debouncedValues, state] = useDebounceValue(formValues, delay, {
    equalityFn: (a, b) => JSON.stringify(a) === JSON.stringify(b),
  });

  const hasChanges = JSON.stringify(formValues) !== JSON.stringify(debouncedValues);
  
  const validationState = state.isDebouncing 
    ? 'validating' 
    : hasChanges 
      ? 'idle' 
      : 'valid';

  return {
    debouncedValues,
    hasChanges,
    changeCount: state.callCount,
    validationState,
  };
}

/**
 * 🪝 Hook useAsyncDebounce - Para operações assíncronas
 */
export function useAsyncDebounce<TArgs extends any[], TReturn>(
  asyncFn: (...args: TArgs) => Promise<TReturn>,
  delay: number = 300
): {
  execute: (...args: TArgs) => Promise<TReturn | null>;
  isLoading: boolean;
  error: Error | null;
  lastResult: TReturn | null;
  cancel: () => void;
} {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastResult, setLastResult] = useState<TReturn | null>(null);
  
  const abortController = useRef<AbortController>();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const execute = useCallback(async (...args: TArgs): Promise<TReturn | null> => {
    // Cancela execução anterior
    if (abortController.current) {
      abortController.current.abort();
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Cria novo controller
    abortController.current = new AbortController();
    
    return new Promise((resolve) => {
      timeoutRef.current = setTimeout(async () => {
        try {
          setIsLoading(true);
          setError(null);
          
          const result = await asyncFn(...args);
          
          if (!abortController.current?.signal.aborted) {
            setLastResult(result);
            resolve(result);
          } else {
            resolve(null);
          }
        } catch (err) {
          if (!abortController.current?.signal.aborted) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
            resolve(null);
          }
        } finally {
          if (!abortController.current?.signal.aborted) {
            setIsLoading(false);
          }
        }
      }, delay);
    });
  }, [asyncFn, delay]);

  const cancel = useCallback(() => {
    if (abortController.current) {
      abortController.current.abort();
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsLoading(false);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return {
    execute,
    isLoading,
    error,
    lastResult,
    cancel,
  };
}