/**
 * ⏳ Loading Manager - Gerenciador de Estados de Loading
 * 
 * Centraliza e coordena todos os estados de loading da aplicação,
 * implementando estratégias de preload, lazy loading e otimização de performance.
 * 
 * @author RecipeApp Team
 * @since Fase 3 - Implementation Layer
 */

import { EventEmitter } from 'events';

/**
 * 🎯 Estados de loading
 */
export enum LoadingState {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
  CANCELLED = 'cancelled'
}

/**
 * 🏷️ Prioridades de loading
 */
export enum LoadingPriority {
  CRITICAL = 'critical',  // Dados essenciais - carrega imediatamente
  HIGH = 'high',         // Dados importantes - carrega em seguida
  MEDIUM = 'medium',     // Dados normais - carrega quando possível
  LOW = 'low',          // Dados opcionais - carrega sob demanda
  BACKGROUND = 'background' // Dados de fundo - carrega quando idle
}

/**
 * 📊 Informações de uma operação de loading
 */
export interface LoadingOperation {
  id: string;
  name: string;
  state: LoadingState;
  priority: LoadingPriority;
  startTime: number;
  endTime?: number;
  duration?: number;
  progress: number; // 0-100
  error?: string;
  retryCount: number;
  maxRetries: number;
  abortController?: AbortController;
  metadata?: Record<string, any>;
}

/**
 * ⚙️ Configurações de loading
 */
export interface LoadingConfig {
  maxConcurrentOperations: number;
  defaultRetries: number;
  retryDelay: number;
  operationTimeout: number;
  enableProgressTracking: boolean;
  enableAnalytics: boolean;
  debugMode: boolean;
}

/**
 * 📈 Estratégias de loading
 */
export interface LoadingStrategy {
  name: string;
  priority: LoadingPriority;
  concurrent: boolean;
  retryable: boolean;
  timeout: number;
  dependencies?: string[];
  condition?: () => boolean;
}

/**
 * 📊 Analytics de loading
 */
export interface LoadingAnalytics {
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  averageLoadTime: number;
  slowestOperation: LoadingOperation | null;
  fastestOperation: LoadingOperation | null;
  operationsByPriority: Record<LoadingPriority, number>;
  performanceTrend: 'improving' | 'stable' | 'degrading';
}

/**
 * ⏳ Loading Manager Principal
 */
export class LoadingManager extends EventEmitter {
  private static instance: LoadingManager;
  private operations: Map<string, LoadingOperation> = new Map();
  private queue: LoadingOperation[] = [];
  private activeOperations: Map<string, LoadingOperation> = new Map();
  private completedOperations: LoadingOperation[] = [];
  private config: LoadingConfig;
  private isInitialized: boolean = false;
  private globalState: LoadingState = LoadingState.IDLE;

  private constructor(config: Partial<LoadingConfig> = {}) {
    super();
    this.config = {
      maxConcurrentOperations: 5,
      defaultRetries: 3,
      retryDelay: 1000,
      operationTimeout: 30000,
      enableProgressTracking: true,
      enableAnalytics: true,
      debugMode: __DEV__,
      ...config
    };
  }

  /**
   * 🏭 Singleton Pattern
   */
  static getInstance(config?: Partial<LoadingConfig>): LoadingManager {
    if (!LoadingManager.instance) {
      LoadingManager.instance = new LoadingManager(config);
    }
    return LoadingManager.instance;
  }

  /**
   * 🚀 Inicialização
   */
  async initialize(): Promise<void> {
    try {
      console.log('🔄 Inicializando LoadingManager...');
      
      // Setup de event listeners
      this.setupEventListeners();
      
      // Inicia o processador de queue
      this.startQueueProcessor();
      
      this.isInitialized = true;
      console.log('✅ LoadingManager inicializado com sucesso');
      
      this.emit('initialized');
      
    } catch (error) {
      console.error('❌ Erro ao inicializar LoadingManager:', error);
      throw error;
    }
  }

  /**
   * 🎬 Inicia uma operação de loading
   */
  async startOperation(
    id: string,
    name: string,
    operation: () => Promise<any>,
    options: {
      priority?: LoadingPriority;
      retries?: number;
      timeout?: number;
      dependencies?: string[];
      metadata?: Record<string, any>;
    } = {}
  ): Promise<any> {
    const {
      priority = LoadingPriority.MEDIUM,
      retries = this.config.defaultRetries,
      timeout = this.config.operationTimeout,
      dependencies = [],
      metadata = {}
    } = options;

    // Cria operação
    const loadingOperation: LoadingOperation = {
      id,
      name,
      state: LoadingState.LOADING,
      priority,
      startTime: Date.now(),
      progress: 0,
      retryCount: 0,
      maxRetries: retries,
      abortController: new AbortController(),
      metadata
    };

    // Adiciona à lista de operações
    this.operations.set(id, loadingOperation);

    // Verifica dependências
    if (dependencies.length > 0) {
      const pendingDependencies = dependencies.filter(dep => 
        !this.isOperationCompleted(dep)
      );
      
      if (pendingDependencies.length > 0) {
        console.log(`⏳ Operação ${id} aguardando dependências: ${pendingDependencies.join(', ')}`);
        this.queue.push(loadingOperation);
        return this.waitForOperation(id);
      }
    }

    // Executa imediatamente se possível
    return this.executeOperation(loadingOperation, operation, timeout);
  }

  /**
   * ⚡ Executa operação
   */
  private async executeOperation(
    operation: LoadingOperation,
    operationFn: () => Promise<any>,
    timeout: number
  ): Promise<any> {
    try {
      // Verifica se pode executar
      if (this.activeOperations.size >= this.config.maxConcurrentOperations) {
        console.log(`⏳ Fila de espera: ${operation.name}`);
        this.queue.push(operation);
        return this.waitForOperation(operation.id);
      }

      // Adiciona às operações ativas
      this.activeOperations.set(operation.id, operation);
      
      console.log(`🚀 Iniciando operação: ${operation.name} (${operation.priority})`);
      
      // Atualiza estado global
      this.updateGlobalState();
      
      // Emite evento de início
      this.emit('operationStarted', operation);
      
      // Executa com timeout
      const result = await Promise.race([
        operationFn(),
        this.createTimeoutPromise(timeout, operation.abortController!)
      ]);

      // Sucesso
      operation.state = LoadingState.SUCCESS;
      operation.endTime = Date.now();
      operation.duration = operation.endTime - operation.startTime;
      operation.progress = 100;

      console.log(`✅ Operação concluída: ${operation.name} (${operation.duration}ms)`);
      
      this.completeOperation(operation, result);
      return result;

    } catch (error) {
      // Erro ou cancelamento
      if (error.name === 'AbortError') {
        operation.state = LoadingState.CANCELLED;
        console.log(`⏹️ Operação cancelada: ${operation.name}`);
      } else {
        operation.state = LoadingState.ERROR;
        operation.error = error instanceof Error ? error.message : String(error);
        console.error(`❌ Erro na operação ${operation.name}:`, error);
        
        // Tenta retry se configurado
        if (operation.retryCount < operation.maxRetries) {
          return this.retryOperation(operation, operationFn, timeout);
        }
      }

      this.completeOperation(operation, null, error);
      throw error;
    }
  }

  /**
   * 🔄 Retry de operação
   */
  private async retryOperation(
    operation: LoadingOperation,
    operationFn: () => Promise<any>,
    timeout: number
  ): Promise<any> {
    operation.retryCount++;
    operation.state = LoadingState.LOADING;
    
    console.log(`🔄 Retry ${operation.retryCount}/${operation.maxRetries}: ${operation.name}`);
    
    // Delay antes do retry
    await this.delay(this.config.retryDelay * operation.retryCount);
    
    return this.executeOperation(operation, operationFn, timeout);
  }

  /**
   * ✅ Completa operação
   */
  private completeOperation(operation: LoadingOperation, result?: any, error?: any): void {
    // Remove das operações ativas
    this.activeOperations.delete(operation.id);
    
    // Adiciona às completadas
    this.completedOperations.push(operation);
    
    // Limita histórico
    if (this.completedOperations.length > 100) {
      this.completedOperations = this.completedOperations.slice(-50);
    }
    
    // Atualiza estado global
    this.updateGlobalState();
    
    // Emite eventos
    if (operation.state === LoadingState.SUCCESS) {
      this.emit('operationCompleted', operation, result);
    } else {
      this.emit('operationFailed', operation, error);
    }
    
    // Processa próxima operação da fila
    this.processQueue();
  }

  /**
   * 📋 Processa fila de operações
   */
  private processQueue(): void {
    if (this.queue.length === 0) return;
    if (this.activeOperations.size >= this.config.maxConcurrentOperations) return;

    // Ordena por prioridade
    this.queue.sort((a, b) => this.getPriorityWeight(b.priority) - this.getPriorityWeight(a.priority));
    
    const nextOperation = this.queue.shift();
    if (nextOperation) {
      // Verifica dependências novamente
      const dependencies = nextOperation.metadata?.dependencies || [];
      const pendingDependencies = dependencies.filter(dep => !this.isOperationCompleted(dep));
      
      if (pendingDependencies.length === 0) {
        // Executa se não há dependências pendentes
        this.executeOperation(nextOperation, 
          () => this.resolveWaitingOperation(nextOperation.id), 
          this.config.operationTimeout
        ).catch(() => {});
      } else {
        // Volta para a fila
        this.queue.unshift(nextOperation);
      }
    }
  }

  /**
   * ⏱️ Cria promise de timeout
   */
  private createTimeoutPromise(timeout: number, abortController: AbortController): Promise<never> {
    return new Promise((_, reject) => {
      const timeoutId = setTimeout(() => {
        abortController.abort();
        reject(new Error(`Operation timeout after ${timeout}ms`));
      }, timeout);
      
      abortController.signal.addEventListener('abort', () => {
        clearTimeout(timeoutId);
        reject(new Error('Operation aborted'));
      });
    });
  }

  /**
   * ⏳ Aguarda operação completar
   */
  private waitForOperation(operationId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const checkOperation = () => {
        const operation = this.operations.get(operationId);
        if (!operation) {
          reject(new Error(`Operation ${operationId} not found`));
          return;
        }

        if (operation.state === LoadingState.SUCCESS) {
          resolve(operation.metadata?.result);
        } else if (operation.state === LoadingState.ERROR) {
          reject(new Error(operation.error || 'Operation failed'));
        } else if (operation.state === LoadingState.CANCELLED) {
          reject(new Error('Operation cancelled'));
        } else {
          // Ainda está executando, aguarda
          setTimeout(checkOperation, 100);
        }
      };

      checkOperation();
    });
  }

  /**
   * 🔍 Utilitários
   */
  private getPriorityWeight(priority: LoadingPriority): number {
    const weights = {
      [LoadingPriority.CRITICAL]: 5,
      [LoadingPriority.HIGH]: 4,
      [LoadingPriority.MEDIUM]: 3,
      [LoadingPriority.LOW]: 2,
      [LoadingPriority.BACKGROUND]: 1
    };
    return weights[priority];
  }

  private isOperationCompleted(operationId: string): boolean {
    const operation = this.operations.get(operationId);
    return operation?.state === LoadingState.SUCCESS;
  }

  private updateGlobalState(): void {
    if (this.activeOperations.size > 0) {
      this.globalState = LoadingState.LOADING;
    } else {
      this.globalState = LoadingState.IDLE;
    }
    
    this.emit('globalStateChanged', this.globalState);
  }

  private resolveWaitingOperation(operationId: string): Promise<any> {
    const operation = this.operations.get(operationId);
    return Promise.resolve(operation?.metadata?.result);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private setupEventListeners(): void {
    this.on('operationStarted', (operation) => {
      if (this.config.debugMode) {
        console.log(`🚀 [${operation.priority}] ${operation.name} iniciada`);
      }
    });

    this.on('operationCompleted', (operation) => {
      if (this.config.debugMode) {
        console.log(`✅ [${operation.priority}] ${operation.name} concluída em ${operation.duration}ms`);
      }
    });
  }

  private startQueueProcessor(): void {
    setInterval(() => {
      if (this.queue.length > 0 && this.activeOperations.size < this.config.maxConcurrentOperations) {
        this.processQueue();
      }
    }, 100);
  }

  /**
   * 📊 Métodos públicos de informação
   */

  /**
   * 📈 Obtém analytics
   */
  getAnalytics(): LoadingAnalytics {
    const successful = this.completedOperations.filter(op => op.state === LoadingState.SUCCESS);
    const failed = this.completedOperations.filter(op => op.state === LoadingState.ERROR);
    
    const avgLoadTime = successful.length > 0 
      ? successful.reduce((sum, op) => sum + (op.duration || 0), 0) / successful.length 
      : 0;

    const operationsByPriority = this.completedOperations.reduce((acc, op) => {
      acc[op.priority] = (acc[op.priority] || 0) + 1;
      return acc;
    }, {} as Record<LoadingPriority, number>);

    return {
      totalOperations: this.completedOperations.length,
      successfulOperations: successful.length,
      failedOperations: failed.length,
      averageLoadTime: Math.round(avgLoadTime),
      slowestOperation: successful.sort((a, b) => (b.duration || 0) - (a.duration || 0))[0] || null,
      fastestOperation: successful.sort((a, b) => (a.duration || 0) - (b.duration || 0))[0] || null,
      operationsByPriority,
      performanceTrend: this.calculatePerformanceTrend()
    };
  }

  /**
   * 📊 Status atual
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      globalState: this.globalState,
      activeOperations: this.activeOperations.size,
      queuedOperations: this.queue.length,
      completedOperations: this.completedOperations.length,
      isIdle: this.globalState === LoadingState.IDLE,
      isLoading: this.globalState === LoadingState.LOADING,
    };
  }

  /**
   * ⏹️ Cancela operação
   */
  cancelOperation(operationId: string): boolean {
    const operation = this.activeOperations.get(operationId);
    if (operation?.abortController) {
      operation.abortController.abort();
      return true;
    }
    return false;
  }

  /**
   * 🧹 Limpa operações completadas
   */
  clearCompleted(): void {
    this.completedOperations = [];
    console.log('🧹 Histórico de operações limpo');
  }

  private calculatePerformanceTrend(): 'improving' | 'stable' | 'degrading' {
    // Análise simples baseada nas últimas 10 operações
    const recent = this.completedOperations.slice(-10);
    if (recent.length < 5) return 'stable';
    
    const firstHalf = recent.slice(0, Math.floor(recent.length / 2));
    const secondHalf = recent.slice(Math.floor(recent.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, op) => sum + (op.duration || 0), 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, op) => sum + (op.duration || 0), 0) / secondHalf.length;
    
    const improvement = (firstAvg - secondAvg) / firstAvg;
    
    if (improvement > 0.1) return 'improving';
    if (improvement < -0.1) return 'degrading';
    return 'stable';
  }
}