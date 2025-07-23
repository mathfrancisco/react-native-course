/**
 * 🪝 useLoading - Hook para Gerenciamento de Estados de Loading
 * 
 * Hook customizado que simplifica o gerenciamento de estados de loading
 * na interface, integrando com o LoadingManager para coordenação global.
 * 
 * @author RecipeApp Team
 * @since Fase 3 - Implementation Layer
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { LoadingManager, LoadingPriority, LoadingState } from '../../storage/controller/LoadingManager';


/**
 * 🎯 Configurações do hook useLoading
 */
interface UseLoadingConfig {
  initialLoading?: boolean;
  enableTimeout?: boolean;
  timeoutMs?: number;
  enableRetry?: boolean;
  maxRetries?: number;
  priority?: LoadingPriority;
  trackProgress?: boolean;
  autoCleanup?: boolean;
  debugMode?: boolean;
}

/**
 * 📊 Estado detalhado de loading
 */
interface LoadingDetails {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  isCancelled: boolean;
  isTimeout: boolean;
  
  progress: number; // 0-100
  duration: number; // em ms
  error: string | null;
  retryCount: number;
  
  startTime: Date | null;
  endTime: Date | null;
  
  canRetry: boolean;
  canCancel: boolean;
}

/**
 * 🎛️ Controles de loading
 */
interface LoadingControls {
  start: (operationName?: string) => Promise<void>;
  stop: (success?: boolean, result?: any) => void;
  retry: () => Promise<void>;
  cancel: () => void;
  reset: () => void;
  
  setProgress: (progress: number) => void;
  setError: (error: string | Error) => void;
  
  // Controles para múltiplas operações
  startOperation: <T>(
    operation: () => Promise<T>,
    operationName?: string,
    options?: { 
      timeout?: number; 
      retries?: number; 
      priority?: LoadingPriority;
    }
  ) => Promise<T>;
}

/**
 * 📈 Estatísticas de loading
 */
interface LoadingStats {
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  averageDuration: number;
  longestOperation: number;
  shortestOperation: number;
  totalRetries: number;
}

/**
 * 🪝 Retorno do hook useLoading
 */
interface UseLoadingReturn {
  // Estado principal
  loading: LoadingDetails;
  
  // Controles
  controls: LoadingControls;
  
  // Estados simplificados (para compatibilidade)
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  error: string | null;
  
  // Estatísticas
  stats: LoadingStats;
  
  // Utilitários
  getOperationStatus: (operationId: string) => LoadingState | null;
  getAllActiveOperations: () => string[];
}

/**
 * 🏭 Estado inicial
 */
const createInitialLoadingDetails = (initialLoading = false): LoadingDetails => ({
  isLoading: initialLoading,
  isSuccess: false,
  isError: false,
  isCancelled: false,
  isTimeout: false,
  
  progress: 0,
  duration: 0,
  error: null,
  retryCount: 0,
  
  startTime: null,
  endTime: null,
  
  canRetry: false,
  canCancel: false,
});

const createInitialStats = (): LoadingStats => ({
  totalOperations: 0,
  successfulOperations: 0,
  failedOperations: 0,
  averageDuration: 0,
  longestOperation: 0,
  shortestOperation: 0,
  totalRetries: 0,
});

/**
 * 🪝 Hook useLoading
 */
export const useLoading = (config: UseLoadingConfig = {}): UseLoadingReturn => {
  const {
    initialLoading = false,
    enableTimeout = true,
    timeoutMs = 30000,
    enableRetry = true,
    maxRetries = 3,
    priority = LoadingPriority.MEDIUM,
    trackProgress = false,
    autoCleanup = true,
    debugMode = false,
  } = config;

  // Estado local
  const [loading, setLoading] = useState<LoadingDetails>(() => 
    createInitialLoadingDetails(initialLoading)
  );
  const [stats, setStats] = useState<LoadingStats>(createInitialStats);
  
  // Refs para controle
  const loadingManager = useRef(LoadingManager.getInstance());
  const currentOperationId = useRef<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastOperationRef = useRef<(() => Promise<any>) | null>(null);
  const operationHistory = useRef<Array<{ duration: number; success: boolean }>>([]);

  /**
   * 🚀 Inicia loading
   */
  const start = useCallback(async (operationName = 'Loading Operation'): Promise<void> => {
    if (debugMode) {
      console.log(`🚀 [useLoading] Iniciando: ${operationName}`);
    }

    // Cancela operação anterior se existir
    if (currentOperationId.current) {
      loadingManager.current.cancelOperation(currentOperationId.current);
    }

    // Limpa timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const startTime = new Date();
    currentOperationId.current = `${operationName}_${Date.now()}`;

    setLoading(prev => ({
      ...prev,
      isLoading: true,
      isSuccess: false,
      isError: false,
      isCancelled: false,
      isTimeout: false,
      error: null,
      progress: 0,
      startTime,
      endTime: null,
      canCancel: true,
    }));

    // Configura timeout se habilitado
    if (enableTimeout) {
      timeoutRef.current = setTimeout(() => {
        if (loading.isLoading) {
          stop(false);
          setLoading(prev => ({
            ...prev,
            isTimeout: true,
            error: `Operação expirou após ${timeoutMs}ms`,
          }));
        }
      }, timeoutMs);
    }

  }, [debugMode, enableTimeout, timeoutMs, loading.isLoading]);

  /**
   * ⏹️ Para loading
   */
  const stop = useCallback((success = true, result?: any): void => {
    const endTime = new Date();
    const duration = loading.startTime ? endTime.getTime() - loading.startTime.getTime() : 0;

    if (debugMode) {
      console.log(`⏹️ [useLoading] Parando: ${success ? 'sucesso' : 'erro'} (${duration}ms)`);
    }

    // Limpa timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setLoading(prev => ({
      ...prev,
      isLoading: false,
      isSuccess: success,
      isError: !success,
      duration,
      endTime,
      canCancel: false,
      canRetry: !success && enableRetry && prev.retryCount < maxRetries,
      progress: success ? 100 : prev.progress,
    }));

    // Atualiza estatísticas
    const newOperation = { duration, success };
    operationHistory.current.push(newOperation);
    
    // Limita histórico
    if (operationHistory.current.length > 100) {
      operationHistory.current = operationHistory.current.slice(-50);
    }

    updateStats();

    currentOperationId.current = null;
  }, [loading.startTime, debugMode, enableRetry, maxRetries]);

  /**
   * 🔄 Retry de operação
   */
  const retry = useCallback(async (): Promise<void> => {
    if (!loading.canRetry || !lastOperationRef.current) {
      if (debugMode) {
        console.warn('⚠️ [useLoading] Retry não disponível');
      }
      return;
    }

    setLoading(prev => ({
      ...prev,
      retryCount: prev.retryCount + 1,
    }));

    setStats(prev => ({
      ...prev,
      totalRetries: prev.totalRetries + 1,
    }));

    if (debugMode) {
      console.log(`🔄 [useLoading] Retry ${loading.retryCount + 1}/${maxRetries}`);
    }

    // Aguarda um pouco antes do retry
    await new Promise(resolve => setTimeout(resolve, 1000 * (loading.retryCount + 1)));

    try {
      await start(`Retry ${loading.retryCount + 1}`);
      const result = await lastOperationRef.current();
      stop(true, result);
    } catch (error) {
      setError(error as Error);
      stop(false);
    }
  }, [loading.canRetry, loading.retryCount, maxRetries, debugMode, start, stop]);

  /**
   * ❌ Cancela operação
   */
  const cancel = useCallback((): void => {
    if (debugMode) {
      console.log('❌ [useLoading] Cancelando operação');
    }

    if (currentOperationId.current) {
      loadingManager.current.cancelOperation(currentOperationId.current);
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setLoading(prev => ({
      ...prev,
      isLoading: false,
      isCancelled: true,
      canCancel: false,
      endTime: new Date(),
      duration: prev.startTime ? Date.now() - prev.startTime.getTime() : 0,
    }));

    currentOperationId.current = null;
  }, [debugMode]);

  /**
   * 🔄 Reset estado
   */
  const reset = useCallback((): void => {
    if (debugMode) {
      console.log('🔄 [useLoading] Resetando estado');
    }

    cancel(); // Cancela se estiver rodando
    setLoading(createInitialLoadingDetails());
  }, [debugMode, cancel]);

  /**
   * 📊 Define progresso
   */
  const setProgress = useCallback((progress: number): void => {
    const clampedProgress = Math.max(0, Math.min(100, progress));
    
    setLoading(prev => ({
      ...prev,
      progress: clampedProgress,
    }));

    if (trackProgress && debugMode) {
      console.log(`📊 [useLoading] Progresso: ${clampedProgress}%`);
    }
  }, [trackProgress, debugMode]);

  /**
   * ❌ Define erro
   */
  const setError = useCallback((error: string | Error): void => {
    const errorMessage = error instanceof Error ? error.message : error;
    
    if (debugMode) {
      console.error('❌ [useLoading] Erro:', errorMessage);
    }

    setLoading(prev => ({
      ...prev,
      error: errorMessage,
      isError: true,
      canRetry: enableRetry && prev.retryCount < maxRetries,
    }));
  }, [debugMode, enableRetry, maxRetries]);

  /**
   * ⚡ Executa operação completa
   */
  const startOperation = useCallback(async <T>(
    operation: () => Promise<T>,
    operationName = 'Operation',
    options: { 
      timeout?: number; 
      retries?: number; 
      priority?: LoadingPriority;
    } = {}
  ): Promise<T> => {
    lastOperationRef.current = operation;
    
    const operationId = `${operationName}_${Date.now()}`;
    
    try {
      await start(operationName);
      
      const result = await loadingManager.current.startOperation(
        operationId,
        operationName,
        async () => {
          // Callback para atualizar progresso se suportado
          const wrappedOperation = async () => {
            try {
              return await operation();
            } catch (error) {
              setError(error as Error);
              throw error;
            }
          };
          
          return wrappedOperation();
        },
        {
          priority: options.priority || priority,
          timeout: options.timeout || timeoutMs,
          retries: options.retries || (enableRetry ? maxRetries : 0),
        }
      );
      
      stop(true, result);
      return result;
      
    } catch (error) {
      setError(error as Error);
      stop(false);
      throw error;
    }
  }, [start, stop, setError, priority, timeoutMs, enableRetry, maxRetries]);

  /**
   * 📈 Atualiza estatísticas
   */
  const updateStats = useCallback((): void => {
    const history = operationHistory.current;
    
    if (history.length === 0) return;

    const successful = history.filter(op => op.success);
    const failed = history.filter(op => !op.success);
    const durations = history.map(op => op.duration);

    const averageDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const longestOperation = Math.max(...durations);
    const shortestOperation = Math.min(...durations);

    setStats(prev => ({
      ...prev,
      totalOperations: history.length,
      successfulOperations: successful.length,
      failedOperations: failed.length,
      averageDuration: Math.round(averageDuration),
      longestOperation,
      shortestOperation,
    }));
  }, []);

  /**
   * 🔍 Utilitários
   */
  const getOperationStatus = useCallback((operationId: string): LoadingState | null => {
    // TODO: Implementar consulta ao LoadingManager
    return null;
  }, []);

  const getAllActiveOperations = useCallback((): string[] => {
    // TODO: Implementar consulta ao LoadingManager
    return [];
  }, []);

  /**
   * 🧹 Cleanup automático
   */
  useEffect(() => {
    if (!autoCleanup) return;

    return () => {
      if (currentOperationId.current) {
        loadingManager.current.cancelOperation(currentOperationId.current);
      }
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [autoCleanup]);

  /**
   * 📊 Estados memoizados para performance
   */
  const controls: LoadingControls = useMemo(() => ({
    start,
    stop,
    retry,
    cancel,
    reset,
    setProgress,
    setError,
    startOperation,
  }), [start, stop, retry, cancel, reset, setProgress, setError, startOperation]);

  const simplifiedStates = useMemo(() => ({
    isLoading: loading.isLoading,
    isError: loading.isError,
    isSuccess: loading.isSuccess,
    error: loading.error,
  }), [loading.isLoading, loading.isError, loading.isSuccess, loading.error]);

  /**
   * 📋 Retorno do hook
   */
  return {
    // Estado completo
    loading,
    
    // Controles
    controls,
    
    // Estados simplificados
    ...simplifiedStates,
    
    // Estatísticas
    stats,
    
    // Utilitários
    getOperationStatus,
    getAllActiveOperations,
  };
};

/**
 * 🎯 Hook especializado para operações específicas
 */
export const useAsyncOperation = <T>(
  operation: () => Promise<T>,
  deps: React.DependencyList = [],
  config: UseLoadingConfig & { autoStart?: boolean } = {}
) => {
  const { autoStart = false, ...loadingConfig } = config;
  const { controls, loading, isLoading, isError, error } = useLoading(loadingConfig);
  
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(async (): Promise<T | null> => {
    try {
      const result = await controls.startOperation(operation, 'Async Operation');
      setData(result);
      return result;
    } catch (err) {
      setData(null);
      return null;
    }
  }, [controls, operation]);

  // Auto-start se configurado
  useEffect(() => {
    if (autoStart) {
      execute();
    }
  }, [autoStart, ...deps]);

  return {
    execute,
    data,
    isLoading,
    isError,
    error,
    loading,
    retry: controls.retry,
    cancel: controls.cancel,
  };
};

/**
 * 📊 Hook para múltiplas operações paralelas
 */
export const useParallelLoading = (
  operations: Record<string, () => Promise<any>>,
  config: UseLoadingConfig = {}
) => {
  const [operationStates, setOperationStates] = useState<Record<string, LoadingDetails>>({});
  const loadingManager = useRef(LoadingManager.getInstance());

  const executeAll = useCallback(async (): Promise<Record<string, any>> => {
    const results: Record<string, any> = {};
    const promises = Object.entries(operations).map(async ([key, operation]) => {
      try {
        setOperationStates(prev => ({
          ...prev,
          [key]: { ...createInitialLoadingDetails(true), startTime: new Date() },
        }));

        const result = await operation();
        
        setOperationStates(prev => ({
          ...prev,
          [key]: { 
            ...prev[key], 
            isLoading: false, 
            isSuccess: true, 
            endTime: new Date() 
          },
        }));

        results[key] = result;
      } catch (error) {
        setOperationStates(prev => ({
          ...prev,
          [key]: { 
            ...prev[key], 
            isLoading: false, 
            isError: true, 
            error: error instanceof Error ? error.message : String(error),
            endTime: new Date() 
          },
        }));
      }
    });

    await Promise.allSettled(promises);
    return results;
  }, [operations]);

  const isAnyLoading = Object.values(operationStates).some(state => state.isLoading);
  const allCompleted = Object.values(operationStates).every(state => !state.isLoading);
  const hasErrors = Object.values(operationStates).some(state => state.isError);

  return {
    executeAll,
    operationStates,
    isAnyLoading,
    allCompleted,
    hasErrors,
  };
};