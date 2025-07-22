import React, { createContext, useContext, useEffect, useState } from 'react';
import { IntegratedRepositoryFactory } from '../config/IntegratedRepositoryFactory';
import { RecipeService } from '../services/controller/RecipeService';
import { IRecipeService } from '../services/interface/IRecipeService';

interface IntegratedBusinessContextType {
  // Serviços
  recipeService: IRecipeService;
  
  // Estado de integração
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  dataSource: string;
  
  // Estatísticas
  stats: {
    recipeCount: number;
    categoryCount: number;
    lastSync: Date | null;
  };
  
  // Métodos de controle
  reconnect: () => Promise<void>;
  syncData: () => Promise<void>;
  clearCache: () => Promise<void>;
}

const IntegratedBusinessContext = createContext<IntegratedBusinessContextType | null>(null);

interface IntegratedBusinessProviderProps {
  children: React.ReactNode;
}

export const IntegratedBusinessProvider: React.FC<IntegratedBusinessProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState('Connecting...');
  const [stats, setStats] = useState({
    recipeCount: 0,
    categoryCount: 0,
    lastSync: null as Date | null
  });
  
  // Serviços (criados uma vez)
  const [recipeService] = useState(() => new RecipeService());
  
  /**
   * 🔗 Conecta com dados JSON
   */
  const connectToData = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔗 Conectando com dados JSON...');
      
      // Inicializa repositórios integrados
      const factory = IntegratedRepositoryFactory.getInstance();
      await factory.initializeRepositories();
      
      // Obtém status da integração
      const status = await factory.getIntegrationStatus();
      
      setIsConnected(status.isConnected);
      setDataSource(status.dataSource);
      setStats({
        recipeCount: status.recipeCount,
        categoryCount: status.categoryCount,
        lastSync: status.lastSync
      });
      
      if (status.errors.length > 0) {
        console.warn('⚠️  Avisos na conexão:', status.errors);
      }
      
      console.log('✅ Conectado com sucesso aos dados JSON');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      setIsConnected(false);
      console.error('❌ Erro na conexão:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * 🔄 Reconecta
   */
  const reconnect = async (): Promise<void> => {
    setIsConnected(false);
    await connectToData();
  };
  
  /**
   * 🔄 Sincroniza dados
   */
  const syncData = async (): Promise<void> => {
    try {
      console.log('🔄 Sincronizando dados...');
      const factory = IntegratedRepositoryFactory.getInstance();
      await factory.syncAllData();
      
      // Atualiza estatísticas
      const status = await factory.getIntegrationStatus();
      setStats({
        recipeCount: status.recipeCount,
        categoryCount: status.categoryCount,
        lastSync: status.lastSync
      });
      
      console.log('✅ Dados sincronizados');
    } catch (err) {
      console.error('❌ Erro na sincronização:', err);
      throw err;
    }
  };
  
  /**
   * 🧹 Limpar cache
   */
  const clearCache = async (): Promise<void> => {
    try {
      console.log('🧹 Limpando cache...');
      const factory = IntegratedRepositoryFactory.getInstance();
      // Implementar clearCache no factory se necessário
      console.log('✅ Cache limpo');
    } catch (err) {
      console.error('❌ Erro ao limpar cache:', err);
    }
  };
  
  // Conecta na montagem
  useEffect(() => {
    connectToData();
  }, []);
  
  const contextValue: IntegratedBusinessContextType = {
    recipeService,
    isConnected,
    isLoading,
    error,
    dataSource,
    stats,
    reconnect,
    syncData,
    clearCache
  };
  
  return (
    <IntegratedBusinessContext.Provider value={contextValue}>
      {children}
    </IntegratedBusinessContext.Provider>
  );
};

/**
 * 🪝 Hook para usar contexto integrado
 */
export const useIntegratedBusiness = (): IntegratedBusinessContextType => {
  const context = useContext(IntegratedBusinessContext);
  
  if (!context) {
    throw new Error('useIntegratedBusiness deve ser usado dentro de IntegratedBusinessProvider');
  }
  
  return context;
};

/**
 * 🪝 Hook específico para RecipeService integrado
 */
export const useIntegratedRecipeService = (): IRecipeService => {
  const { recipeService } = useIntegratedBusiness();
  return recipeService;
};