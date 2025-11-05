import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import NoteInput from "./components/NoteInput";
import NoteCard from "./components/NoteCard";
import Modal from "./components/Modal";
import Copyright from "./components/Copyright";
import { auth, db, onAuthStateChanged, collection, query, where, orderBy, onSnapshot, addDoc, doc, setDoc, deleteDoc, serverTimestamp } from "./firebase";
import { api } from './services/api';
import { LoadingSpinner } from './components/LoadingSpinner';

export default function App() {
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [loadingActions, setLoadingActions] = useState({});

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribeAuth && unsubscribeAuth();
  }, []);

  useEffect(() => {
    let unsubNotes = null;
    if (user) {
      setLoadingNotes(true);
      fetchNotes();
    } else {
      setNotes([]);
    }
    return () => unsubNotes && unsubNotes();
  }, [user]);

  const fetchNotes = async () => {
    if (!user) return;
    setLoading(true);
    try {
      if (useBackend) {
        const notes = await api.getNotes(user.uid);
        setNotes(notes);
      } else {
        const q = query(collection(db, "notes"), where("userId", "==", user.uid), orderBy("updatedAt", "desc"));
        unsubNotes = onSnapshot(q, (snapshot) => {
          const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
          setNotes(docs);
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingNotes(false);
    }
  };

  async function addNote({ title, content }) {
    if (!user) {
      alert("Please sign in to create notes.");
      return;
    }
    setLoading(true);
    try {
      if (useBackend) {
        const newNote = await api.createNote({
          ...{ title, content },
          userId: user.uid
        });
        setNotes(prev => [newNote, ...prev]);
      } else {
        await addDoc(collection(db, "notes"), {
          userId: user.uid,
          title,
          content,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingActions(prev => ({
        ...prev,
        ['new']: false
      }));
    }
  }

  async function updateNote(id, { title, content }) {
    try {
      const ref = doc(db, "notes", id);
      await setDoc(ref, {
        title: title || "",
        content: content || "",
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error("Error updating note:", error);
      alert("Failed to update note. Please try again.");
    }
  }

  async function deleteNoteById(id) {
    const ref = doc(db, "notes", id);
    await deleteDoc(ref);
  }

  const setNoteLoading = (noteId, isLoading) => {
    setLoadingActions(prev => ({
      ...prev,
      [noteId]: isLoading
    }));
  };

  return (
    <div className="keep-app">
      <Navbar user={user} />
      <div className="keep-content">
        <Sidebar />
        <main className="keep-main">
          <NoteInput onSubmit={addNote} isLoading={loadingActions['new']} />
          {loadingNotes ? (
            <LoadingSpinner />
          ) : (
            <div className="keep-notes-grid">
              {notes.map((note) => (
                <div key={note.id} onDoubleClick={() => setActiveNote(note)}>
                  <NoteCard
                    note={note}
                    onDelete={() => deleteNoteById(note.id)}
                    onEdit={() => setActiveNote(note)}
                    isLoading={loadingActions[note.id]}
                  />
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {activeNote && (
        <Modal
          note={activeNote}
          onClose={() => setActiveNote(null)}
          onSave={(updated) => {
            updateNote(activeNote.id, updated);
            setActiveNote(null);
          }}
        />
      )}
      <Copyright />
    </div>
  );
}

const useBackend = import.meta.env.VITE_USE_BACKEND === 'rest';
