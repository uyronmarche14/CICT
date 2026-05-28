export interface CacheEntry<T> {
  data: T
  expiresAt: number
}

export interface CacheBackend {
  get<T>(key: string): Promise<T | undefined>
  set<T>(key: string, value: T, ttlMs: number): Promise<void>
  del(key: string): Promise<void>
  delPattern(pattern: string): Promise<void>
  clear(): Promise<void>
}

export class InMemoryBackend implements CacheBackend {
  private store = new Map<string, CacheEntry<unknown>>()
  private hits = 0
  private misses = 0

  async get<T>(key: string): Promise<T | undefined> {
    const entry = this.store.get(key)
    if (!entry) {
      this.misses++
      return undefined
    }
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key)
      this.misses++
      return undefined
    }
    this.hits++
    return entry.data as T
  }

  async set<T>(key: string, value: T, ttlMs: number): Promise<void> {
    this.store.set(key, { data: value, expiresAt: Date.now() + ttlMs })
  }

  async del(key: string): Promise<void> {
    this.store.delete(key)
  }

  async delPattern(pattern: string): Promise<void> {
    const regex = new RegExp(pattern)
    for (const key of this.store.keys()) {
      if (regex.test(key)) {this.store.delete(key)}
    }
  }

  async clear(): Promise<void> {
    this.store.clear()
    this.hits = 0
    this.misses = 0
  }

  getStats(): { size: number; hits: number; misses: number } {
    return { size: this.store.size, hits: this.hits, misses: this.misses }
  }
}

export interface TypedCacheOptions {
  ttlMs?: number
  namespace?: string
  maxSize?: number
  backend?: CacheBackend
}

export class TypedCache<T> {
  private backend: CacheBackend
  private defaultTtlMs: number
  private namespace: string

  constructor(opts?: TypedCacheOptions) {
    this.backend = opts?.backend ?? new InMemoryBackend()
    this.defaultTtlMs = opts?.ttlMs ?? 300_000
    this.namespace = opts?.namespace ?? ''
  }

  private qualifyKey(key: string): string {
    return this.namespace ? `${this.namespace}:${key}` : key
  }

  async get(key: string): Promise<T | undefined> {
    return this.backend.get<T>(this.qualifyKey(key))
  }

  async set(key: string, value: T, ttlMs?: number): Promise<void> {
    return this.backend.set(this.qualifyKey(key), value, ttlMs ?? this.defaultTtlMs)
  }

  async invalidate(key: string): Promise<void> {
    return this.backend.del(this.qualifyKey(key))
  }

  async invalidatePattern(regex: RegExp): Promise<void> {
    const namespacePrefix = this.namespace ? `${this.namespace}:` : ''
    await this.backend.delPattern(`^${namespacePrefix}${regex.source}`)
  }

  async clear(): Promise<void> {
    if (this.namespace) {
      await this.backend.delPattern(`^${this.namespace}:`)
    } else {
      await this.backend.clear()
    }
  }

  async stats(): Promise<{ size: number; hits: number; misses: number }> {
    if (this.backend instanceof InMemoryBackend) {
      return this.backend.getStats()
    }
    return { size: 0, hits: 0, misses: 0 }
  }
}
