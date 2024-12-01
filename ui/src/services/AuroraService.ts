import { apiClient } from './ApiClient';

export const fetchAuroraData = async (token: string) => {
  return apiClient.post(
    `
    query {
      auroraEntries(days: 7) {
        epochtime
        statusId
        value
      }
    }
    `,
    token
  );
}; 