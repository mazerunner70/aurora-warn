import { apiClient } from './ApiClient';

export const fetchAuroraData = async (token: string) => {
  return apiClient.post(
    `
    query {
      auroraEntries(days: 1) {
        epochtime
        statusId
        value
      }
    }
    `,
    token
  );
}; 