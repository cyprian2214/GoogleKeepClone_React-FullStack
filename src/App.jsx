import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import NoteInput from "./components/NoteInput";
import NoteCard from "./components/NoteCard";
import Modal from "./components/Modal";
import Copyright from "./components/Copyright";
import { auth, db, onAuthStateChanged, collection, query, where, orderBy, onSnapshot, addDoc, doc, setDoc, deleteDoc, serverTimestamp } from "./firebase";

export default function App() {
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribeAuth && unsubscribeAuth();
  }, []);

  useEffect(() => {
    let unsubNotes = null;
    if (user) {
      const q = query(collection(db, "notes"), where("userId", "==", user.uid), orderBy("updatedAt", "desc"));
      unsubNotes = onSnapshot(q, (snapshot) => {
        const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setNotes(docs);
      });
    } else {
      setNotes([]);
    }
    return () => unsubNotes && unsubNotes();
  }, [user]);

  async function addNote({ title, content }) {
    if (!user) {
      alert("Please sign in to create notes.");
      return;
    }
    await addDoc(collection(db, "notes"), {
      userId: user.uid,
      title,
      content,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
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

  return (
    <div className="keep-app">
      <Navbar user={user} />
      <div className="keep-content">
        <Sidebar />
        <main className="keep-main">
          <NoteInput onAdd={addNote} />
          <div className="keep-notes-grid">
            {notes.map((note) => (
              <div key={note.id} onDoubleClick={() => setActiveNote(note)}>
                <NoteCard
                  note={note}
                  onDelete={() => deleteNoteById(note.id)}
                  onEdit={() => setActiveNote(note)}
                />
              </div>
            ))}
          </div>
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
