import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export interface GithubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      email: string;
      date: string;
    };
  };
  author: {
    login: string;
    id: number;
    avatar_url: string;
  } | null;
  stats?: {
    additions: number;
    deletions: number;
    total: number;
  };
  files?: Array<{
    filename: string;
    additions: number;
    deletions: number;
    changes: number;
  }>;
}

export interface GithubRepository {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
  };
  html_url: string;
  language: string | null;
  updated_at: string;
}

@Injectable()
export class GithubService {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor(private configService: ConfigService) {
    this.client = axios.create({
      baseURL: 'https://api.github.com',
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    });

    // Get token from settings or environment
    this.token = this.configService.get<string>('GITHUB_TOKEN') || null;
    if (this.token) {
      this.setToken(this.token);
    }
  }

  setToken(token: string) {
    this.token = token;
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  clearToken() {
    this.token = null;
    delete this.client.defaults.headers.common['Authorization'];
  }

  async verifyToken(): Promise<{ valid: boolean; user?: any }> {
    if (!this.token) {
      return { valid: false };
    }

    try {
      const response = await this.client.get('/user');
      return { valid: true, user: response.data };
    } catch (error) {
      return { valid: false };
    }
  }

  async getAuthenticatedUser() {
    const response = await this.client.get('/user');
    return response.data;
  }

  async getUserRepositories(page: number = 1, perPage: number = 30): Promise<GithubRepository[]> {
    const response = await this.client.get('/user/repos', {
      params: {
        page,
        per_page: perPage,
        sort: 'updated',
      },
    });
    return response.data;
  }

  async getOrganizationRepositories(
    org: string,
    page: number = 1,
    perPage: number = 30,
  ): Promise<GithubRepository[]> {
    const response = await this.client.get(`/orgs/${org}/repos`, {
      params: {
        page,
        per_page: perPage,
        sort: 'updated',
      },
    });
    return response.data;
  }

  async getCommits(
    owner: string,
    repo: string,
    branch?: string,
    page: number = 1,
    perPage: number = 100,
  ): Promise<GithubCommit[]> {
    const response = await this.client.get(`/repos/${owner}/${repo}/commits`, {
      params: {
        page,
        per_page: perPage,
        sha: branch,
      },
    });

    // For each commit, get detailed stats
    const commitsWithStats: GithubCommit[] = await Promise.all(
      response.data.map(async (commit: GithubCommit) => {
        try {
          const detailResponse = await this.client.get(
            `/repos/${owner}/${repo}/commits/${commit.sha}`,
          );
          return detailResponse.data;
        } catch {
          return commit;
        }
      }),
    );

    return commitsWithStats;
  }

  async getCommit(
    owner: string,
    repo: string,
    sha: string,
  ): Promise<GithubCommit> {
    const response = await this.client.get(`/repos/${owner}/${repo}/commits/${sha}`);
    return response.data;
  }

  async getContributors(owner: string, repo: string) {
    const response = await this.client.get(`/repos/${owner}/${repo}/contributors`, {
      params: {
        per_page: 100,
      },
    });
    return response.data;
  }

  async getRepository(owner: string, repo: string) {
    const response = await this.client.get(`/repos/${owner}/${repo}`);
    return response.data;
  }

  async getBranches(owner: string, repo: string) {
    const response = await this.client.get(`/repos/${owner}/${repo}/branches`);
    return response.data;
  }

  async searchUsers(query: string) {
    const response = await this.client.get('/search/users', {
      params: {
        q: query,
      },
    });
    return response.data;
  }

  async getRateLimit() {
    const response = await this.client.get('/rate_limit');
    return response.data;
  }
}
