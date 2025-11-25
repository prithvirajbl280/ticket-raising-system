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
    if (typeof window === "undefined") return;

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
      await API.post(`/tickets/${id}/comments`, { text: comment.trim() });
      setComment("");
      await fetchTicket();
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading ticket...</p>
        </div>
      </div>
    );
  }

  const userRoles = Array.isArray(user?.roles) ? user.roles : [];
  const isAdmin = userRoles.includes("ROLE_ADMIN");
  const isAgent = userRoles.includes("ROLE_AGENT");
  const canChangeStatus = isAdmin || isAgent;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-6">
      {/* Animated background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>

      <div className="relative max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push("/dashboard")}
          className="inline-flex items-center gap-2 text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 font-bold px-6 py-3 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 transition-all duration-200 mb-6"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </button>

        {/* Main Ticket Card */}
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border-2 border-white/50 mb-6">
          {/* Colored Header Bar */}
          <div className={`h-3 ${
            ticket.status === "OPEN" ? "bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500" :
            ticket.status === "IN_PROGRESS" ? "bg-gradient-to-r from-blue-400 via-cyan-500 to-sky-500" :
            ticket.status === "RESOLVED" ? "bg-gradient-to-r from-yellow-400 via-orange-500 to-amber-500" :
            "bg-gradient-to-r from-gray-400 via-slate-500 to-gray-600"
          }`}></div>

          <div className="p-8">
            {/* Title Section */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex-grow">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-4 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full text-sm font-bold shadow-lg">
                    Ticket #{ticket.id}
                  </span>
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">{ticket.subject}</h1>
              </div>
            </div>

            {/* Status Badges */}
            <div className="flex flex-wrap gap-3 mb-6">
              <span className={`px-4 py-2 rounded-2xl text-sm font-bold shadow-lg ${
                ticket.status === "OPEN" ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white" :
                ticket.status === "IN_PROGRESS" ? "bg-gradient-to-r from-blue-400 to-cyan-500 text-white" :
                ticket.status === "RESOLVED" ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white" :
                "bg-gradient-to-r from-gray-400 to-gray-500 text-white"
              }`}>
                Status: {ticket.status.replace("_", " ")}
              </span>
              
              <span className={`px-4 py-2 rounded-2xl text-sm font-bold shadow-lg ${
                ticket.priority === "URGENT" ? "bg-gradient-to-r from-red-500 to-rose-600 text-white" :
                ticket.priority === "HIGH" ? "bg-gradient-to-r from-orange-400 to-red-500 text-white" :
                ticket.priority === "MEDIUM" ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white" :
                "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800"
              }`}>
                Priority: {ticket.priority}
              </span>

              <span className="px-4 py-2 rounded-2xl text-sm font-bold shadow-lg bg-gradient-to-r from-purple-400 to-pink-500 text-white">
                Category: {ticket.category}
              </span>
            </div>

            {/* Ticket Info Card */}
            <div className="mb-6 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border-2 border-indigo-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <div>
                    <span className="font-bold text-gray-700">Owner:</span>
                    <p className="text-gray-600">{ticket.owner?.name || ticket.owner?.email || "Unknown"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <div>
                    <span className="font-bold text-gray-700">Assignee:</span>
                    <p className="text-gray-600">{ticket.assignee?.name || ticket.assignee?.email || "Unassigned"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <span className="font-bold text-gray-700">Created:</span>
                    <p className="text-gray-600">{new Date(ticket.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description Card */}
            <div className="mb-6 p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border-l-4 border-blue-500">
              <h3 className="font-bold text-gray-800 mb-3 text-lg flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Description
              </h3>
              <p className="text-gray-700 leading-relaxed">{ticket.description}</p>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border-2 border-white/50 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            Comments ({ticket.comments?.length || 0})
          </h2>

          <div className="space-y-4 mb-6">
            {ticket.comments?.length === 0 && (
              <div className="text-center py-8 bg-gray-50 rounded-2xl">
                <p className="text-gray-500 italic">No comments yet. Be the first to comment!</p>
              </div>
            )}

            {ticket.comments?.map((c) => (
              <div
                key={c.id}
                className="bg-gradient-to-br from-slate-50 to-gray-100 border-2 border-gray-200 p-5 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200"
              >
                <div className="flex justify-between mb-3 text-xs">
                  <span className="font-bold text-indigo-600 px-3 py-1 bg-indigo-100 rounded-full">
                    {c.author?.name || c.author?.email || "Anonymous"}
                  </span>
                  <span className="text-gray-500 px-3 py-1 bg-gray-200 rounded-full">
                    {new Date(c.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-800 leading-relaxed">{c.text}</p>
              </div>
            ))}
          </div>

          {/* Add Comment Form */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-2xl border-2 border-emerald-200">
            <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Add a comment
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write your comment here..."
              className="w-full p-4 border-2 border-emerald-300 rounded-2xl shadow-sm focus:ring-4 focus:ring-emerald-300 focus:border-emerald-500 outline-none bg-white transition-all duration-200 font-medium"
              rows="4"
            />
            <button
              onClick={addComment}
              disabled={!comment.trim()}
              className="mt-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-bold px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Add Comment
            </button>
          </div>
        </div>

        {/* Status Update Section (Admin/Agent Only) */}
        {canChangeStatus && (
          <div className="bg-gradient-to-br from-orange-100 via-amber-50 to-yellow-100 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border-2 border-orange-200">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              Update Status
            </h3>
            <div className="flex flex-wrap gap-4 items-center">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="p-4 pr-10 border-2 border-orange-300 rounded-2xl bg-white shadow-md focus:ring-4 focus:ring-orange-300 focus:border-orange-500 outline-none font-bold cursor-pointer flex-grow"
              >
                <option value="OPEN">🟢 OPEN</option>
                <option value="IN_PROGRESS">🔵 IN_PROGRESS</option>
                <option value="RESOLVED">🟡 RESOLVED</option>
                <option value="CLOSED">⚫ CLOSED</option>
              </select>

              <button
                onClick={changeStatus}
                className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Update Status
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
