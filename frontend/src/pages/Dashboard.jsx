import { useEffect } from "react";
import API from "../services/api";

function Dashboard() {
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await API.get("/notes");
        console.log(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchNotes();
  }, []);

  return <h2>Dashboard</h2>;
}

export default Dashboard;