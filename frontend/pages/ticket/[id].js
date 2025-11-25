import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import API from "../../lib/api";

export default function TicketDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [ticket, setTicket] = useState(null);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Load user from localStorage
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/");
        return;
      }
      
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        }
      } catch (e) {
        console.error("Error loading user", e);
        router.push("/");
      }
    }
  }, []);

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
      console.error("Fetch ticket error:", err);
      alert("Cannot load ticket");
    }
  };

  const addComment = async () => {
    if (!comment || !comment.trim()) {
      alert("Please enter a comment");
      return;
    }
    
    try {
      console.log("Sending comment:", { text: comment.trim() });
      await API.post(`/tickets/${id}/comments`, { text: comment.trim() });
      setComment("");
      await fetchTicket(); // Refresh ticket to show new comment
      alert("Comment added successfully!");
    } catch (err) {
      console.error("Add comment error:", err.response || err);
      alert(err.response?.data?.message || "Failed to add comment. Please try again.");
    }
  };

  const changeStatus = async () => {
    try {
      await API.put(`/tickets/${id}/status?status=${status}`);
      await fetchTicket();
      alert("Status updated successfully!");
    } catch (err) {
      console.error("Change status error:", err);
      alert("Failed to change status");
    }
  };

  if (!ticket || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading ticket...
      </div>
    );
  }

  const userRoles = Array.isArray(user?.roles) ? user.roles : [];
  const isAdmin = userRoles.includes("ROLE_ADMIN");
  const isAgent = userRoles.includes("ROLE_AGENT");
  const canChangeStatus = isAdmin || isAgent;

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
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{ticket.subject}</h1>
            <p className="text-sm text-gray-500 mt-2">Ticket #{ticket.id}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mt-3 text-sm">
          <span className={`px-3 py-1 rounded-full font-semibold ${
            ticket.status === "OPEN" 
              ? "bg-green-100 text-green-700" 
              : ticket.status === "IN_PROGRESS"
              ? "bg-blue-100 text-blue-700"
              : ticket.status === "RESOLVED"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-gray-100 text-gray-700"
          }`}>
            Status: {ticket.status}
          </span>
          <span className={`px-3 py-1 rounded-full font-semibold ${
            ticket.priority === "URGENT"
              ? "bg-red-100 text-red-700"
              : ticket.priority === "HIGH"
              ? "bg-orange-100 text-orange-700"
              : ticket.priority === "MEDIUM"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-gray-100 text-gray-700"
          }`}>
            Priority: {ticket.priority}
          </span>
          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-semibold">
            Category: {ticket.category}
          </span>
        </div>

        {/* Ticket Info */}
        <div className="mt-6 p-4 bg-slate-50 rounded-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold text-gray-700">Owner:</span>{" "}
              <span className="text-gray-600">{ticket.owner?.name || ticket.owner?.email || "Unknown"}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Assignee:</span>{" "}
              <span className="text-gray-600">{ticket.assignee?.name || ticket.assignee?.email || "Unassigned"}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Created:</span>{" "}
              <span className="text-gray-600">{new Date(ticket.createdAt).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
          <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
          <p className="text-gray-700 leading-relaxed">{ticket.description}</p>
        </div>

        {/* Comments */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Comments ({ticket.comments?.length || 0})
          </h2>

          <div className="space-y-4">
            {ticket.comments?.length === 0 && (
              <p className="text-gray-500 text-sm italic">No comments yet. Be the first to comment!</p>
            )}

            {ticket.comments?.map((c) => (
              <div
                key={c.id}
                className="bg-slate-50 border border-slate-200 p-4 rounded-xl shadow-sm"
              >
                <div className="flex justify-between mb-2 text-xs text-gray-500">
                  <span className="font-semibold text-gray-700">
                    {c.author?.name || c.author?.email || "Anonymous"}
                  </span>
                  <span>{new Date(c.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-gray-700">{c.text}</p>
              </div>
            ))}
          </div>

          {/* Add Comment */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add a comment
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write your comment here..."
              className="w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white"
              rows="3"
            />
            <button
              onClick={addComment}
              disabled={!comment.trim()}
              className="mt-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold px-5 py-2 rounded-xl shadow-md transition"
            >
              Add Comment
            </button>
          </div>
        </div>

        {/* Status Update - Only for Admin/Agent */}
        {canChangeStatus && (
          <div className="mt-10 p-6 bg-gray-50 rounded-xl border border-gray-200">
            <h3 className="text-xl font-semibold mb-3 text-gray-800">
              Update Status
            </h3>
            <div className="flex flex-wrap gap-3 items-center">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="p-3 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
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
                Update Status
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
