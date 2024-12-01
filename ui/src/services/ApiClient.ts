import config from '../aws-exports';

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${config.cloudfront_url}/example`;
  }

  async post<T>(query: string, token: string): Promise<T> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Origin': config.cloudfront_url
      },
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }
}

export const apiClient = new ApiClient(); 