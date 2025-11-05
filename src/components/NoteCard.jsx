import React from "react";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { LoadingSpinner } from './LoadingSpinner';

export default function NoteCard({ note, onDelete, onEdit, isLoading }) {
  return (
    <div className="keep-note" onClick={onEdit}>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="keep-note-content">
            {note.title?.trim() && <div className="keep-note-title">{note.title}</div>}
            <div className="keep-note-text">{note.content || ''}</div>
          </div>
          
          <div className="keep-note-actions">
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
            <button title="Delete" onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}>
              <DeleteOutlineOutlinedIcon />
            </button>
            <button title="More">
              <MoreVertIcon />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
