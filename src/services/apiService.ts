import axios from 'axios';
import { User, Contact } from '../types';

const API_BASE_URL = 'https://api.stook.app';

class ApiService {
  private api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  async registerUser(userData: Partial<User>): Promise<User> {
    const response = await this.api.post('/users', userData);
    return response.data;
  }

  async getUserById(userId: string): Promise<User> {
    const response = await this.api.get(`/users/${userId}`);
    return response.data;
  }

  async updateUser(userId: string, userData: Partial<User>): Promise<User> {
    const response = await this.api.put(`/users/${userId}`, userData);
    return response.data;
  }

  async syncContacts(userId: string, contacts: Contact[]): Promise<void> {
    await this.api.post(`/users/${userId}/contacts`, { contacts });
  }

  async getContactGraph(userId: string): Promise<string[]> {
    const response = await this.api.get(`/users/${userId}/graph`);
    return response.data;
  }
}

export default new ApiService();