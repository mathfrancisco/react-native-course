export interface RepositoryStatus {
  name: string;
  initialized: boolean;
  lastSync: Date | null;
  itemCount: number;
  cacheEnabled: boolean;
  errors: string[];
}

export class RepositoryStatusView {
  /**
   * Formata status de um repositório
   */
  static formatStatus(
    name: string,
    initialized: boolean,
    lastSync: Date | null,
    itemCount: number,
    cacheEnabled: boolean,
    errors: string[] = []
  ): RepositoryStatus {
    return {
      name,
      initialized,
      lastSync,
      itemCount,
      cacheEnabled,
      errors
    };
  }
  
  /**
   * Formata status para display
   */
  static formatForDisplay(status: RepositoryStatus): {
    title: string;
    subtitle: string;
    statusColor: string;
    details: string[];
  } {
    const statusColor = status.errors.length > 0 ? '#F44336' : 
                       status.initialized ? '#4CAF50' : '#FF9800';
    
    const subtitle = status.errors.length > 0 ? 'Com problemas' :
                    status.initialized ? 'Funcionando' : 'Inicializando';
    
    const details: string[] = [
      `${status.itemCount} itens carregados`,
      `Cache: ${status.cacheEnabled ? 'Ativo' : 'Desativo'}`,
    ];
    
    if (status.lastSync) {
      details.push(`Última sync: ${this.formatDate(status.lastSync)}`);
    }
    
    if (status.errors.length > 0) {
      details.push(...status.errors);
    }
    
    return {
      title: status.name,
      subtitle,
      statusColor,
      details
    };
  }
  
  /**
   * Formata múltiplos repositórios
   */
  static formatMultipleStatus(statuses: RepositoryStatus[]): {
    overall: 'healthy' | 'warning' | 'error';
    healthy: number;
    warning: number;
    error: number;
    details: string[];
  } {
    let healthy = 0;
    let warning = 0;
    let error = 0;
    const details: string[] = [];
    
    statuses.forEach(status => {
      if (status.errors.length > 0) {
        error++;
        details.push(`❌ ${status.name}: ${status.errors[0]}`);
      } else if (!status.initialized) {
        warning++;
        details.push(`⏳ ${status.name}: Inicializando`);
      } else {
        healthy++;
        details.push(`✅ ${status.name}: ${status.itemCount} itens`);
      }
    });
    
    const overall = error > 0 ? 'error' : warning > 0 ? 'warning' : 'healthy';
    
    return {
      overall,
      healthy,
      warning,
      error,
      details
    };
  }
  
  private static formatDate(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) { // Menos de 1 minuto
      return 'Agora há pouco';
    } else if (diff < 3600000) { // Menos de 1 hora
      const minutes = Math.floor(diff / 60000);
      return `${minutes} min atrás`;
    } else if (diff < 86400000) { // Menos de 1 dia
      const hours = Math.floor(diff / 3600000);
      return `${hours}h atrás`;
    } else {
      return date.toLocaleDateString();
    }
  }
}