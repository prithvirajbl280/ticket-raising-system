import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import API from "../../lib/api";

export default function TicketDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [ticket, setTicket] = useState(null);
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
      await API.put(`/tickets/${id}/status`, null, { params: { status } });
      fetchTicket();
    } catch (err) {
      alert("Failed to change status");
    }
  };

  if (!ticket)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading ticket...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      {/* Back Button */}
      <button
        onClick={() => router.push("/dashboard")}
        className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mb-6"
      >
        ← Back to Dashboard
      </button>

      {/* Main Card */}
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-4xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-900">{ticket.subject}</h1>

        <div className="flex flex-wrap gap-4 mt-3 text-sm">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
            Status: {ticket.status}
          </span>
          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full">
            Priority: {ticket.priority}
          </span>
        </div>

        <p className="mt-6 text-gray-700 leading-relaxed border-l-4 border-green-500 pl-4">
          {ticket.description}
        </p>

        {/* Comments */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Comments
          </h2>

          <div className="space-y-4">
            {ticket.comments?.length === 0 && (
              <p className="text-gray-500 text-sm italic">No comments yet.</p>
            )}

            {ticket.comments?.map((c) => (
              <div
                key={c.id}
                className="bg-slate-50 border border-slate-200 p-4 rounded-xl shadow-sm"
              >
                <div className="flex justify-between mb-2 text-xs text-gray-500">
                  <span>{c.author?.name || c.author?.email}</span>
                  <span>{new Date(c.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-gray-700">{c.text}</p>
              </div>
            ))}
          </div>

          {/* Add Comment */}
          <div className="mt-6">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a comment..."
              className="w-full p-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 outline-none bg-white"
              rows="3"
            />
            <button
              onClick={addComment}
              className="mt-3 bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded-xl shadow-md transition"
            >
              Add Comment
            </button>
          </div>
        </div>

        {/* Status Update */}
        <div className="mt-10">
          <h3 className="text-xl font-semibold mb-3 text-gray-800">
            Update Status
          </h3>
          <div className="flex flex-wrap gap-3 items-center">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="p-3 border rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="OPEN">OPEN</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="CLOSED">CLOSED</option>
            </select>

            <button
              onClick={changeStatus}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-xl shadow-md transition"
            >
              Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
