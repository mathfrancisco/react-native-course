export interface ErrorDetails {
  type: ErrorType;
  message: string;
  code?: string;
  details?: string;
  retryable: boolean;
  timestamp: Date;
}

export type ErrorType = 
  | 'network'
  | 'validation'
  | 'not_found'
  | 'permission'
  | 'server'
  | 'unknown';

export class ErrorPresenter {
  /**
   * Formata erro de rede
   */
  static formatNetworkError(error: any): ErrorDetails {
    return {
      type: 'network',
      message: 'Problema de conexão. Verifique sua internet.',
      details: error.message,
      retryable: true,
      timestamp: new Date()
    };
  }
  
  /**
   * Formata erro de validação
   */
  static formatValidationError(errors: string[]): ErrorDetails {
    return {
      type: 'validation',
      message: 'Dados inválidos',
      details: errors.join(', '),
      retryable: false,
      timestamp: new Date()
    };
  }
  
  /**
   * Formata erro de item não encontrado
   */
  static formatNotFoundError(resource: string, id: string): ErrorDetails {
    return {
      type: 'not_found',
      message: `${resource} não encontrado`,
      details: `ID: ${id}`,
      retryable: false,
      timestamp: new Date()
    };
  }
  
  /**
   * Formata erro genérico
   */
  static formatGenericError(error: any): ErrorDetails {
    return {
      type: 'unknown',
      message: 'Ocorreu um erro inesperado',
      details: error.message || 'Erro desconhecido',
      retryable: true,
      timestamp: new Date()
    };
  }
  
  /**
   * Formata erro para display
   */
  static formatForDisplay(error: ErrorDetails): {
    title: string;
    message: string;
    action?: string;
  } {
    const actions = {
      network: 'Tentar novamente',
      validation: 'Corrigir dados',
      not_found: 'Voltar',
      permission: 'Fazer login',
      server: 'Tentar novamente',
      unknown: 'Tentar novamente'
    };
    
    return {
      title: 'Ops! Algo deu errado',
      message: error.message,
      action: error.retryable ? actions[error.type] : undefined
    };
  }
}