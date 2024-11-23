import { config } from '../config';

export const fetchAuroraData = async (token: string) => {
  const response = await fetch(config.apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `
        query {
          auroraEntries(days: 7) {
            epochtime
            statusId
            value
          }
        }
      `
    }),
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  return response.json();
}; 