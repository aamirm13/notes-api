import { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [formError, setFormError] = useState("");
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

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
      setNotes(res.data.data);
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

  return (
    <div className="min-h-screen rainbow-bg relative overflow-hidden">
      {/* NAVBAR */}
        <div className="relative z-10 bg-white/20 backdrop-blur-lg border-b border-white/20 px-6 py-4 flex justify-between items-center text-white">        <h1 className="text-xl font-semibold text-gray-800">
          Notes Dashboard
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
            Your Notes
          </h2>

          <button
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
>
            + New Note
          </button>
        </div>
        {/* SEARCH BAR */}
<div className="mb-6">
  <input
    type="text"
    placeholder="Search notes..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="w-full px-4 py-2 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40"
  />
</div>

        {/* LOADING */}
        {loading ? (
          <p className="text-white/70">Loading notes...</p>
        ) : notes.length === 0 ? (
          <p className="text-white/70">
            No notes yet. Create your first one!
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => (
              <div
                key={note._id}
                className="bg-white/20 backdrop-blur-lg border border-white/20 p-4 rounded-xl text-white hover:bg-white/30 transition"              >
                <h3 className="font-semibold text-gray-800 mb-2">
                  {note.title || "Untitled"}
                </h3>

                <p className="text-sm text-gray-600 line-clamp-3">
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
    </div>
  );
}

export default Dashboard;