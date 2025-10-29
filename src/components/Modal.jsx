import React, { useState, useRef, useEffect } from "react";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import UndoOutlinedIcon from '@mui/icons-material/UndoOutlined';
import RedoOutlinedIcon from '@mui/icons-material/RedoOutlined';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';

export default function Modal({ note, onClose, onSave }) {
  const [title, setTitle] = useState(note.title || '');
  const [content, setContent] = useState(note.content || '');
  const modalRef = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        handleSave();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    titleRef.current?.focus();
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSave() {
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    
    // Only save if there are actual changes
    if (trimmedTitle !== note.title?.trim() || trimmedContent !== note.content?.trim()) {
      onSave({ 
        title: trimmedTitle,
        content: trimmedContent
      });
    } else {
      onClose();
    }
  }

  return (
    <div className="keep-modal-overlay">
      <div className="keep-modal" ref={modalRef}>
        <div className="keep-modal-content">
          <div className="keep-pin-button">
            <PushPinOutlinedIcon />
          </div>
          <input
            ref={titleRef}
            type="text"
            className="keep-modal-title"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="keep-modal-text"
            placeholder="Take a note..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="keep-modal-footer">
            <div className="keep-modal-actions">
              <button title="Remind me">
                <AccessTimeIcon />
              </button>
              <button title="Collaborator">
                <PersonAddAltIcon />
              </button>
              <button title="Background options">
                <PaletteOutlinedIcon />
              </button>
              <button title="Add image">
                <ImageOutlinedIcon />
              </button>
              <button title="Archive">
                <ArchiveOutlinedIcon />
              </button>
              <button title="More">
                <MoreVertIcon />
              </button>
              <button title="Undo">
                <UndoOutlinedIcon />
              </button>
              <button title="Redo">
                <RedoOutlinedIcon />
              </button>
            </div>
            <button className="keep-close-button" onClick={handleSave}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
