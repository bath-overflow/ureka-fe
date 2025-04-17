import React, { useState } from 'react';
import './NoteSelector.css';

const NoteSelector = ({ notes, onNoteSelect, onCreateNote }) => {
  const [newNoteName, setNewNoteName] = useState('');

  const handleCreateNote = () => {
    if (newNoteName.trim()) {
      onCreateNote(newNoteName);
      setNewNoteName('');
    }
  };

  return (
    <div className="note-selector">
      <div className="create-note-section">
        <h2>새 노트 만들기</h2>
        <div className="create-note-input">
          <input
            type="text"
            value={newNoteName}
            onChange={(e) => setNewNoteName(e.target.value)}
            placeholder="노트 이름을 입력하세요"
          />
          <button onClick={handleCreateNote}>생성</button>
        </div>
      </div>

      <div className="existing-notes-section">
        <h2>기존 노트</h2>
        <div className="notes-list">
          {notes.map((note) => (
            <div
              key={note.id}
              className="note-item"
              onClick={() => onNoteSelect(note)}
            >
              {note.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NoteSelector;