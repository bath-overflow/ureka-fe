const chatApi = {
  async getHint(chatId) {
    const url = `/api/chat/${chatId}/hint`;
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch hint');
      }

      return await response.json();
    } catch (error) {
      console.error('Hint API Call failed:', error);
      throw error;
    }
  },

  async getSuggestions(chatId) {
    const url = `/api/chat/${chatId}/suggestions`;
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch suggestions');
      }

      return await response.json();
    } catch (error) {
      console.error('Suggestions API Call failed:', error);
      throw error;
    }
  },
};

export default chatApi;