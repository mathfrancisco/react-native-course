export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

export class CacheController {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutos
  
  /**
   * Obtém item do cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    // Verifica se expirou
    if (Date.now() - entry.timestamp > entry.expiresIn) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  /**
   * Define item no cache
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresIn: ttl || this.defaultTTL
    };
    
    this.cache.set(key, entry);
  }
  
  /**
   * Remove item do cache
   */
  delete(key: string): void {
    this.cache.delete(key);
  }
  
  /**
   * Limpa todo o cache
   */
  clear(): void {
    this.cache.clear();
  }
  
  /**
   * Remove itens expirados
   */
  cleanup(): void {
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.expiresIn) {
        this.cache.delete(key);
      }
    }
  }
  
  /**
   * Obtém estatísticas do cache
   */
  getStats(): {
    size: number;
    hits: number;
    misses: number;
  } {
    return {
      size: this.cache.size,
      hits: 0, // Implementar contador se necessário
      misses: 0 // Implementar contador se necessário
    };
  }
}