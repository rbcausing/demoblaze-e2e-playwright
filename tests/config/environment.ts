/**
 * Environment configuration for e-commerce testing
 */

export interface EnvironmentConfig {
  baseUrl: string;
  apiBaseUrl: string;
  timeout: number;
  retries: number;
  workers: number;
  headless: boolean;
  slowMo: number;
  screenshotOnFailure: boolean;
  videoOnFailure: boolean;
  traceOnFirstRetry: boolean;
}

export class Environment {
  private static instance: Environment;
  private config: EnvironmentConfig;

  private constructor() {
    this.config = {
      baseUrl: process.env.BASE_URL || 'http://localhost:3000',
      apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3000/api',
      timeout: parseInt(process.env.TIMEOUT || '30000'),
      retries: parseInt(process.env.RETRIES || '2'),
      workers: parseInt(process.env.WORKERS || '4'),
      headless: process.env.HEADLESS !== 'false',
      slowMo: parseInt(process.env.SLOW_MO || '0'),
      screenshotOnFailure: process.env.SCREENSHOT_ON_FAILURE !== 'false',
      videoOnFailure: process.env.VIDEO_ON_FAILURE !== 'false',
      traceOnFirstRetry: process.env.TRACE_ON_FIRST_RETRY !== 'false',
    };
  }

  public static getInstance(): Environment {
    if (!Environment.instance) {
      Environment.instance = new Environment();
    }
    return Environment.instance;
  }

  public getConfig(): EnvironmentConfig {
    return this.config;
  }

  public getBaseUrl(): string {
    return this.config.baseUrl;
  }

  public getApiBaseUrl(): string {
    return this.config.apiBaseUrl;
  }

  public isHeadless(): boolean {
    return this.config.headless;
  }

  public getTimeout(): number {
    return this.config.timeout;
  }

  public getRetries(): number {
    return this.config.retries;
  }

  public getWorkers(): number {
    return this.config.workers;
  }

  public getSlowMo(): number {
    return this.config.slowMo;
  }

  // Environment-specific configurations
  public isProduction(): boolean {
    return this.config.baseUrl.includes('production') || this.config.baseUrl.includes('prod');
  }

  public isStaging(): boolean {
    return this.config.baseUrl.includes('staging');
  }

  public isLocal(): boolean {
    return this.config.baseUrl.includes('localhost') || this.config.baseUrl.includes('127.0.0.1');
  }

  // Test data environment
  public getTestUserEmail(): string {
    return process.env.TEST_USER_EMAIL || 'testuser@example.com';
  }

  public getTestUserPassword(): string {
    return process.env.TEST_USER_PASSWORD || 'TestPassword123!';
  }
}
