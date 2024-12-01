import config from '../aws-exports';

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${config.cloudfront_url}/example`;
    console.log('API Client initialized with URL:', this.baseUrl);
  }

  async post<T>(query: string, token: string): Promise<T> {
    console.log('Making API request:');
    console.log('URL:', this.baseUrl);
    console.log('Token (first 20 chars):', token.substring(0, 20));
    console.log('Headers:', {
      'Authorization': `Bearer ${token.substring(0, 20)}...`,
      'Content-Type': 'application/json',
      'Origin': config.cloudfront_url
    });
    console.log('Query:', query);

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Origin': config.cloudfront_url
        },
        body: JSON.stringify({ query })
      });

      console.log('Response status:', response.status);
      const headerObj: { [key: string]: string } = {};
      response.headers.forEach((value, key) => {
        headerObj[key] = value;
      });
      console.log('Response headers:', headerObj);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API request failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('API Response data:', data);
      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }
}

export const apiClient = new ApiClient(); 