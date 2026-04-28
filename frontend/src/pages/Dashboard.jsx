import { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [formError, setFormError] = useState("");
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOverBin, setIsOverBin] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [searchResults, setSearchResults] = useState([]);
  const [highlightedNote, setHighlightedNote] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [newNote, setNewNote] = useState({
  title: "",
  content: "",
  priority: "low",
  date: "",
  });

  const navigate = useNavigate();

  const fetchNotes = async () => {
    try {
      const res = await api.get("/notes");
      setNotes(
  res.data.data.map((note, i) => ({
    ...note,
    x: (i % 3) * 270,
    y: Math.floor(i / 3) * 180,
  }))
);
    } catch (err) {
      console.error(err);
      // If unauthorized, go back to login
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
  if (!searchTerm.trim()) {
    setSearchResults([]);
    return;
  }

  const results = notes.filter((note) =>
    note.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  setSearchResults(results);
}, [searchTerm, notes]);

  useEffect(() => {
  const handleMove = (e) => {
  if (!dragging) return;

  const searchEl = document.getElementById("search-bar-container");
  const notesArea = document.getElementById("notes-area");

let MIN_Y = 0;

if (searchEl && notesArea) {
  const searchBottom = searchEl.getBoundingClientRect().bottom;
  const containerTop = notesArea.getBoundingClientRect().top;

  MIN_Y = searchBottom - containerTop + 10;
}
  const MAX_X = window.innerWidth - 260;
  const MAX_Y = window.innerHeight - 120;

  let newX = e.clientX - offset.x;
  let newY = e.clientY - offset.y;

  // Clamp boundaries
  newX = Math.min(newX, MAX_X);
  newY = Math.max(MIN_Y, Math.min(newY, MAX_Y));

  setNotes((prev) =>
    prev.map((note) =>
      note._id === dragging
        ? { ...note, x: newX, y: newY }
        : note
    )
  );
};

  const handleUp = (e) => {
  if (!dragging) return;

  const bin = document.getElementById("trash-bin");
  const rect = bin.getBoundingClientRect();

  const isInsideBin =
    e.clientX >= rect.left &&
    e.clientX <= rect.right &&
    e.clientY >= rect.top &&
    e.clientY <= rect.bottom;

  if (isInsideBin) {
    const note = notes.find((n) => n._id === dragging);
    setNoteToDelete(note);
    setShowDeleteConfirm(true);
  }
  setNotes((prev) => {
  const updated = [...prev];
  const current = updated.find((n) => n._id === dragging);

  if (!current) return prev;

  const isColliding = (a, b) => {
    return (
      a.x < b.x + 250 &&
      a.x + 250 > b.x &&
      a.y < b.y + 150 &&
      a.y + 150 > b.y
    );
  };

  let collision = updated.find(
    (n) => n._id !== dragging && isColliding(current, n)
  );

  if (collision) {
    current.x += 260; // push right

    // if off screen → move down
    if (current.x > window.innerWidth - 260) {
      current.x = 0;
      current.y += 180;
    }
  }

  return updated;
});
  setDragging(null);
};

  window.addEventListener("mousemove", handleMove);
  window.addEventListener("mouseup", handleUp);

  return () => {
    window.removeEventListener("mousemove", handleMove);
    window.removeEventListener("mouseup", handleUp);
  };
}, [dragging, offset]);

  const handleLogout = async () => {
  try {
    await api.post("/auth/logout");

    // clear UI state
    setNotes([]);

    navigate("/");
  } catch (err) {
    console.error(err);
  }
};


const handleCreateNote = async () => {
  setFormError("");

  // Frontend validation
  if (newNote.title.length > 100) {
    setFormError("Title cannot exceed 100 characters");
    return;
  }

  if (newNote.content.length === 0) {
    setFormError("Content is required");
    return;
  }

  try {
    await api.post("/notes", newNote);

    setShowModal(false);

    setNewNote({
      title: "",
      content: "",
      priority: "low",
      date: "",
    });

    fetchNotes();
  } catch (err) {
    console.error("FULL ERROR:", err.response?.data || err);

    // Backend fallback error
    setFormError(
      err.response?.data?.error || "Failed to create note"
    );
  }
};

  const handleDeleteNote = async () => {
  try {
    await api.delete(`/notes/${noteToDelete._id}`);

    setShowDeleteConfirm(false);
    setNoteToDelete(null);

    fetchNotes();
  } catch (err) {
    console.error(err);
  }
};

const handleSearchClick = (note) => {
  const exists = notes.find((n) => n._id === note._id);

  if (!exists) return;

  // bring to center-ish
  setNotes((prev) =>
    prev.map((n) =>
      n._id === note._id
        ? {
            ...n,
            x: window.innerWidth / 2 - 150,
            y: 250,
          }
        : n
    )
  );

  // trigger jiggle
  setHighlightedNote(note._id);

  setTimeout(() => {
    setHighlightedNote(null);
  }, 600);

  // clear search
  setSearchTerm("");
  setSearchResults([]);
};

  return (
    <div className="min-h-screen rainbow-bg relative overflow-hidden">
      {/* NAVBAR */}
        <div className="relative z-10 bg-white/20 backdrop-blur-lg border-b border-white/20 px-6 py-4 flex justify-between items-center text-white">        <h1 className="text-xl font-semibold text-gray-800">
          Dashboard
        </h1>

        <button
          onClick={handleLogout}
          className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
        >
          Logout
        </button>
      </div>

      {/* CONTENT */}
        <div className="relative z-10 p-6 max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Notes
          </h2>

          <button
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
>
            + New Note
          </button>
        </div>
        {/* SEARCH BAR */}
<div id="search-bar-container" className="mb-6 relative">
  <input
    type="text"
    placeholder="Search notes..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="w-full px-4 py-2 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40"
  />

  {searchResults.length > 0 && (
    <div className="absolute w-full mt-2 bg-white/20 backdrop-blur-xl border border-white/30 rounded-xl overflow-hidden z-50">
      {searchResults.map((note) => (
        <div
          key={note._id}
          onClick={() => handleSearchClick(note)}
          className="px-4 py-2 cursor-pointer hover:bg-white/30 transition text-white"
        >
          <p className="font-semibold text-gray-800">
            {note.title || "Untitled"}
          </p>
          <p className="text-sm text-gray-600 truncate">
            {note.content}
          </p>
        </div>
      ))}
    </div>
  )}
</div>

        {/* LOADING */}
        {loading ? (
          <p className="text-white/70">Loading notes...</p>
        ) : notes.length === 0 ? (
          <p className="text-white/70">
            No notes yet. Create your first one!
          </p>
        ) : (
          <div id="notes-area" className="relative w-full h-[600px]">

  {notes.map((note) => (
    <div
      key={note._id}
      onMouseDown={(e) => {
        setDragging(note._id);
        setOffset({
          x: e.clientX - note.x,
          y: e.clientY - note.y,
        });
      }}
      className={`absolute bg-white/20 backdrop-blur-lg border border-white/20 p-4 rounded-xl text-white cursor-grab active:cursor-grabbing select-none
        ${highlightedNote === note._id ? "animate-bounce" : ""}
      `}      style={{
        left: note.x,
        top: note.y,
        width: "250px",
      }}
    >
      <h3 className="font-semibold text-gray-800 mb-2">
        {note.title || "Untitled"}
      </h3>

      <p className="text-sm text-gray-600">
        {note.content}
      </p>
    </div>
  ))}

</div>
        )}
      </div>

        {showModal && (
  <div className="fixed inset-0 flex items-center justify-center z-20">
    
    {/* overlay */}
    <div
      className="absolute inset-0 bg-black/40"
      onClick={() => setShowModal(false)}
    ></div>

    {/* modal */}
    <div className="relative z-30 w-full max-w-md bg-white/20 backdrop-blur-xl border border-white/30 p-6 rounded-2xl shadow-2xl flex flex-col gap-4 text-white">

      <h2 className="text-xl font-semibold">Create Note</h2>

      <input
  type="text"
  placeholder="Title"
  value={newNote.title}
  onChange={(e) =>
    setNewNote({ ...newNote, title: e.target.value })
  }
  className={`px-3 py-2 rounded-lg bg-white/30 border ${
    newNote.title.length > 100 ? "border-red-400" : "border-white/30"
  } focus:outline-none`}
/>

<p className="text-xs text-white/60 text-right">
  {newNote.title.length}/100
</p>

      <textarea
        placeholder="Write your note..."
        value={newNote.content}
        onChange={(e) =>
          setNewNote({ ...newNote, content: e.target.value })
        }
        className="px-3 py-2 rounded-lg bg-white/30 border border-white/30 focus:outline-none"
      />
      {/* date */}
      <input
        type="datetime-local"
       value={newNote.date}
       onChange={(e) =>
          setNewNote({ ...newNote, date: e.target.value })
       }
        className="px-3 py-2 rounded-lg bg-white/30 border border-white/30 focus:outline-none text-black"
      />
      {/* priority */}
      <select
        value={newNote.priority}
        onChange={(e) =>
          setNewNote({ ...newNote, priority: e.target.value })
        }
        className="px-3 py-2 rounded-lg bg-white/30 border border-white/30 text-black"
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>


      {formError && (
        <p className="text-red-300 text-sm text-center">
          {formError}
        </p>
      )}
      {/* actions */}
      <div className="flex justify-end gap-2">
        <button
          onClick={() => setShowModal(false)}
          className="px-4 py-2 bg-gray-300 text-black rounded-lg"
        >
          Cancel
        </button>

        <button
          onClick={handleCreateNote}
          className="px-4 py-2 bg-indigo-600 rounded-lg"
        >
          Save
        </button>
      </div>
    </div>
  </div>
)}

{/* ✅ ADD DELETE MODAL HERE */}
{showDeleteConfirm && (
  <div className="fixed inset-0 flex items-center justify-center z-40">

    {/* overlay */}
    <div
      className="absolute inset-0 bg-black/50"
      onClick={() => setShowDeleteConfirm(false)}
    ></div>

    {/* modal */}
    <div className="relative z-50 bg-white/20 backdrop-blur-xl border border-white/30 p-8 rounded-2xl shadow-2xl text-white max-w-md w-full text-center">

      <h2 className="text-xl font-semibold mb-4">
        Delete Note?
      </h2>

      <p className="mb-6 text-white/80">
        Do you really want to delete{" "}
        <span className="font-semibold">
          {noteToDelete?.title}
        </span>
        ?
      </p>

      <div className="flex justify-center gap-4">
        <button
          onClick={() => setShowDeleteConfirm(false)}
          className="px-5 py-2 bg-gray-300 text-black rounded-lg"
        >
          Cancel
        </button>

        <button
          onClick={handleDeleteNote}
          className="px-5 py-2 bg-red-500 rounded-lg"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}


{/* BIN ICON */}
<div
  id="trash-bin"
  onDragOver={(e) => {
    e.preventDefault();
    setIsOverBin(true);
  }}
  onDragLeave={() => setIsOverBin(false)}
  onDrop={() => {
    if (draggedNote) {
      setNoteToDelete(draggedNote);
      setShowDeleteConfirm(true);
    }
  }}
  className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center transition-all duration-300
    ${isOverBin ? "scale-110" : "scale-100"}
  `}
>
  <div className={`p-5 rounded-full backdrop-blur-xl border-2 
  ${isOverBin 
    ? "bg-red-600 border-red-800 animate-bounce shadow-lg shadow-red-500/50" 
    : "bg-red-500/40 border-red-600 shadow-md shadow-red-500/30"}
`}>
    <span className="text-2xl">🗑</span>
  </div>
</div>
    </div>
  );
}

export default Dashboard;