import { useEffect, useState } from "react";
import API from "../lib/api";
import { useRouter } from "next/router";

export default function Dashboard(){
  const [tickets,setTickets]=useState([]);
  const [subject,setSubject]=useState("");
  const [description,setDescription]=useState("");
  const [priority,setPriority]=useState("MEDIUM");
  const router = useRouter();

  useEffect(() => {
    if(typeof window === "undefined") return;
    const token = localStorage.getItem('token');
    if(!token) router.push('/');
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await API.get('/tickets');
      setTickets(res.data);
    } catch (err) {
      alert("Unable to fetch tickets");
    }
  };

  const createTicket = async (e) => {
    e.preventDefault();
    try {
      await API.post('/tickets',{subject,description,priority});
      setSubject(""); setDescription(""); setPriority("MEDIUM");
      fetchTickets();
    } catch (err) {
      alert("Failed to create ticket");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl">My Tickets</h1>
        <button className="bg-gray-200 px-3 py-1 rounded" onClick={() => { localStorage.removeItem('token'); router.push('/'); }}>Logout</button>
      </div>

      <form onSubmit={createTicket} className="mb-6 p-4 border rounded">
        <h2 className="font-semibold mb-2">Create Ticket</h2>
        <input required placeholder="Subject" value={subject} onChange={e=>setSubject(e.target.value)} className="w-full p-2 mb-2 border rounded"/>
        <textarea required placeholder="Description" value={description} onChange={e=>setDescription(e.target.value)} className="w-full p-2 mb-2 border rounded"/>
        <select value={priority} onChange={e=>setPriority(e.target.value)} className="p-2 mb-2 border rounded">
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
          <option value="URGENT">URGENT</option>
        </select>
        <div><button className="bg-blue-600 text-white px-4 py-2 rounded">Create</button></div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tickets.map(t => (
          <div key={t.id} className="p-4 border rounded">
            <a href={`/ticket/${t.id}`} className="text-lg font-semibold">{t.subject}</a>
            <div className="text-sm text-gray-600">Status: {t.status} • Priority: {t.priority}</div>
            <div className="mt-2 text-sm">{t.description?.slice(0,200)}</div>
            <div className="mt-2 text-xs text-gray-500">Owner: {t.owner?.email} • Assignee: {t.assignee?.email || "Unassigned"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
