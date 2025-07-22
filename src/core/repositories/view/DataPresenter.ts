export interface DataLoadingState {
  isLoading: boolean;
  progress: number;
  message: string;
  error?: string;
}

export class DataPresenter {
  /**
   * Formata estado de carregamento
   */
  static formatLoadingState(
    isLoading: boolean,
    progress: number = 0,
    message: string = ''
  ): DataLoadingState {
    return {
      isLoading,
      progress: Math.max(0, Math.min(100, progress)),
      message: message || (isLoading ? 'Carregando...' : 'Concluído'),
    };
  }
  
  /**
   * Formata erro de carregamento
   */
  static formatError(error: Error | string): DataLoadingState {
    return {
      isLoading: false,
      progress: 0,
      message: 'Erro ao carregar dados',
      error: typeof error === 'string' ? error : error.message
    };
  }
  
  /**
   * Formata sucesso de carregamento
   */
  static formatSuccess(message: string = 'Dados carregados com sucesso'): DataLoadingState {
    return {
      isLoading: false,
      progress: 100,
      message
    };
  }
  
  /**
   * Formata progresso de sincronização
   */
  static formatSyncProgress(
    current: number,
    total: number,
    operation: string = 'Sincronizando'
  ): DataLoadingState {
    const progress = total > 0 ? (current / total) * 100 : 0;
    const message = `${operation}... ${current}/${total}`;
    
    return {
      isLoading: current < total,
      progress,
      message
    };
  }
}