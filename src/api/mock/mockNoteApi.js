import { mockNotes, mockFiles, mockMessages } from './mockData';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const mockNoteApi = {
  async getNotes() {
    await delay(500);
    return mockNotes;
  },

  async createNote(noteData) {
    await delay(500);
    const newNote = {
      id: mockNotes.length + 1,
      name: noteData.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockNotes.push(newNote);
    return newNote;
  },

  async getNote(noteId) {
    await delay(500);
    const note = mockNotes.find(n => n.id === noteId);
    if (!note) {
      throw new Error('Note not found');
    }
    return note;
  },

  async updateNote(noteId, noteData) {
    await delay(500);
    const noteIndex = mockNotes.findIndex(n => n.id === noteId);
    if (noteIndex !== -1) {
      const updatedNote = {
        ...mockNotes[noteIndex],
        ...noteData,
        updatedAt: new Date().toISOString(),
      };
      mockNotes[noteIndex] = updatedNote;
      return updatedNote;
    }
    throw new Error('Note not found');
  },

  async deleteNote(noteId) {
    await delay(500);
    const noteIndex = mockNotes.findIndex(n => n.id === noteId);
    if (noteIndex !== -1) {
      mockNotes.splice(noteIndex, 1);
      return { success: true };
    }
    throw new Error('Note not found');
  },

  async getFiles(noteId) {
    await delay(500);
    return mockFiles[noteId] || [];
  },

  async uploadFile(noteId, file) {
    await delay(1000);
    const newFile = {
      id: Date.now(),
      name: file.name,
      size: file.size,
      uploadedAt: new Date().toISOString(),
    };
    
    if (!mockFiles[noteId]) {
      mockFiles[noteId] = [];
    }
    mockFiles[noteId].push(newFile);
    return newFile;
  },

  async deleteFile(noteId, fileId) {
    await delay(500);
    if (!mockFiles[noteId]) {
      throw new Error('Note not found');
    }
    const fileIndex = mockFiles[noteId].findIndex(f => f.id === fileId);
    if (fileIndex === -1) {
      throw new Error('File not found');
    }
    mockFiles[noteId].splice(fileIndex, 1);
    return { success: true };
  },

  async getMessages(noteId) {
    await delay(500);
    return mockMessages[noteId] || [];
  },

  async sendMessage(noteId, message) {
    await delay(500);
    if (!mockMessages[noteId]) {
      mockMessages[noteId] = [];
    }
    const newMessage = {
      id: Date.now(),
      text: message,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };
    mockMessages[noteId].push(newMessage);
    return newMessage;
  },
};

export default mockNoteApi; 