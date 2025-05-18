import request, { SuperTest, Test } from 'supertest';
import { app } from '../../../infrastructure/server';
import { TestConfig } from '../config/test.config';

export class ApiTestClient {
  private static instance: ApiTestClient;
  private client: SuperTest<Test>;
  private authToken: string | null = null;

  private constructor() {
    this.client = request(app);
  }

  public static getInstance(): ApiTestClient {
    if (!ApiTestClient.instance) {
      ApiTestClient.instance = new ApiTestClient();
    }
    return ApiTestClient.instance;
  }

  public setAuthToken(token: string): void {
    this.authToken = token;
  }

  public clearAuthToken(): void {
    this.authToken = null;
  }

  private getAuthHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  public async get(endpoint: string, query: Record<string, any> = {}) {
    return this.client
      .get(`${TestConfig.API_PREFIX}${endpoint}`)
      .query(query)
      .set(this.getAuthHeaders());
  }

  public async post(endpoint: string, data: any = {}) {
    return this.client
      .post(`${TestConfig.API_PREFIX}${endpoint}`)
      .send(data)
      .set(this.getAuthHeaders());
  }

  public async put(endpoint: string, data: any = {}) {
    return this.client
      .put(`${TestConfig.API_PREFIX}${endpoint}`)
      .send(data)
      .set(this.getAuthHeaders());
  }

  public async delete(endpoint: string, data: any = {}) {
    return this.client
      .delete(`${TestConfig.API_PREFIX}${endpoint}`)
      .send(data)
      .set(this.getAuthHeaders());
  }

  public async login(credentials: { email: string; password: string }) {
    const response = await this.post('/auth/login', credentials);
    if (response.status === 200) {
      this.authToken = response.body.token;
    }
    return response;
  }

  public async logout() {
    this.clearAuthToken();
  }
}

export const apiClient = ApiTestClient.getInstance();
