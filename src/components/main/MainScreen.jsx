import React, { useState, useEffect } from 'react';
import NoteSelector from './NoteSelector';
import useNoteApi from '../../hooks/useNoteApi';
import './MainScreen.css';

const MainScreen = ({ onNoteSelect }) => {
  const [notes, setNotes] = useState([]);
  const { loading, error, getNotes, createNote } = useNoteApi();

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const fetchedNotes = await getNotes();
        setNotes(fetchedNotes);
      } catch (err) {
        console.error('Failed to fetch notes:', err);
      }
    };

    fetchNotes();
  }, [getNotes]);

  const handleCreateNote = async (noteName) => {
    try {
      const newNote = await createNote({ name: noteName });
      onNoteSelect(newNote);
    } catch (err) {
      console.error('Failed to create note:', err);
    }
  };

  return (
    <div className="main-screen">
      <div className="main-content">
        <h1>Welcome to Ureka</h1>
        {loading && <div className="loading">Loading...</div>}
        {error && <div className="error">{error}</div>}
        <NoteSelector 
          notes={notes} 
          onNoteSelect={onNoteSelect} 
          onCreateNote={handleCreateNote} 
        />
      </div>
    </div>
  );
};

export default MainScreen;