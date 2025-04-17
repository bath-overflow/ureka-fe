const API_BASE_URL = window.env?.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';

const fileApi = {
  async uploadFile(noteId, file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/notes/${noteId}/files`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      throw new Error('Failed to upload file');
    }
    return response.json();
  },

  async getFiles(noteId) {
    const response = await fetch(`${API_BASE_URL}/notes/${noteId}/files`);
    if (!response.ok) {
      throw new Error('Failed to fetch files');
    }
    return response.json();
  },

  async deleteFile(noteId, fileId) {
    const response = await fetch(`${API_BASE_URL}/notes/${noteId}/files/${fileId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete file');
    }
    return response.json();
  },
};

export default fileApi; 