import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import API from "../../lib/api";

export default function TicketDetail(){
  const router = useRouter();
  const { id } = router.query;
  const [ticket,setTicket] = useState(null);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!id) return;
    fetchTicket();
  }, [id]);

  const fetchTicket = async () => {
    try {
      const res = await API.get(`/tickets/${id}`);
      setTicket(res.data);
      setStatus(res.data.status);
    } catch (err) {
      alert("Cannot load ticket");
    }
  };

  const addComment = async () => {
    if (!comment) return;
    try {
      await API.post(`/tickets/${id}/comments`, { text: comment });
      setComment("");
      fetchTicket();
    } catch (err) {
      alert("Failed to add comment");
    }
  };

  const changeStatus = async () => {
    try {
      await API.put(`/tickets/${id}/status`, null, { params: { status }});
      fetchTicket();
    } catch (err) {
      alert("Failed to change status");
    }
  };

  if(!ticket) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <button onClick={()=>router.push('/dashboard')} className="mb-4 text-blue-600">← Back</button>
      <h1 className="text-2xl mb-2">{ticket.subject}</h1>
      <div className="text-sm text-gray-600 mb-2">Status: {ticket.status} • Priority: {ticket.priority}</div>
      <p className="mb-4">{ticket.description}</p>

      <div className="mb-4">
        <h2 className="font-semibold">Comments</h2>
        {ticket.comments?.map(c => (
          <div key={c.id} className="p-2 border rounded my-2">
            <div className="text-xs text-gray-500">{c.author?.email} • {new Date(c.createdAt).toLocaleString()}</div>
            <div>{c.text}</div>
          </div>
        ))}
      </div>

      <div className="mb-4">
        <textarea value={comment} onChange={e=>setComment(e.target.value)} className="w-full p-2 border rounded mb-2" placeholder="Add comment..."/>
        <button onClick={addComment} className="bg-gray-700 text-white px-3 py-1 rounded">Add Comment</button>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold">Change Status</h3>
        <select value={status} onChange={e=>setStatus(e.target.value)} className="p-2 border rounded mb-2">
          <option value="OPEN">OPEN</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="RESOLVED">RESOLVED</option>
          <option value="CLOSED">CLOSED</option>
        </select>
        <button onClick={changeStatus} className="bg-blue-600 text-white px-3 py-1 rounded">Update Status</button>
      </div>
    </div>
  );
}
