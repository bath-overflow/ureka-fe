import { useState, useCallback } from 'react';
import mockNoteApi from '../api/mock/mockNoteApi';
import fileApi from '../api/rest/fileApi';

const useNoteApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getNotes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      return await mockNoteApi.getNotes();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createNote = useCallback(async (noteData) => {
    try {
      setLoading(true);
      setError(null);
      return await mockNoteApi.createNote(noteData);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadFile = useCallback(async (noteId, file) => {
    try {
      setLoading(true);
      setError(null);
      return await fileApi.uploadFile(noteId, file);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getFiles = useCallback(async (noteId) => {
    try {
      setLoading(true);
      setError(null);
      return await fileApi.getFiles(noteId);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getNotes,
    createNote,
    uploadFile,
    getFiles,
  };
};

export default useNoteApi; 