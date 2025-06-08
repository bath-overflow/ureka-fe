
const hintApi = {
  async getHint(chatId) {
    const url = `/api/chat/${chatId}/hint`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        throw new Error(errorData.message || 'Failed to fetch hint');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Call failed:', error);
      throw error;
    }
  },
};

export default hintApi;