export interface IBaseRepository<T> {
  // Operações de cache
  enableCache: boolean;
  cacheTimeout: number;
  
  // Métodos de inicialização
  initialize(): Promise<void>;
  isInitialized(): boolean;
  
  // Métodos de sincronização
  sync(): Promise<void>;
  getLastSyncTime(): Date | null;
}

export interface RepositoryConfig {
  enableCache: boolean;
  cacheTimeout: number;
  dataPath: string;
  autoSync: boolean;
}