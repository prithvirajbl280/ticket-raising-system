import { useEffect, useState } from "react";
import API from "../lib/api";
import { useRouter } from "next/router";

export default function Dashboard() {
  const [tickets, setTickets] = useState([]);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [category, setCategory] = useState("OTHER");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [user, setUser] = useState(null);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [agents, setAgents] = useState([]);
  const [loadingAgents, setLoadingAgents] = useState(false);

  const router = useRouter();

  // Load user
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        parsed.roles = Array.isArray(parsed.roles) ? parsed.roles : [];
        setUser(parsed);
      }
    } catch (err) {
      localStorage.clear();
      router.push("/");
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchTickets();
  }, [user, search, statusFilter]);

  const buildTicketsUrl = () => {
    const params = new URLSearchParams();
    if (search.trim()) params.append("search", search.trim());
    if (statusFilter && statusFilter !== "ALL")
      params.append("status", statusFilter);

    const q = params.toString();
    return `/tickets${q ? "?" + q : ""}`;
  };

  const fetchTickets = async () => {
    try {
      const url = buildTicketsUrl();
      const res = await API.get(url);
      setTickets(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAgents = async () => {
    setLoadingAgents(true);
    try {
      const res = await API.get("/admin/agents");
      setAgents(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAgents(false);
    }
  };

  const openAssignModal = (id) => {
    setSelectedTicketId(id);
    setShowAssignModal(true);
    fetchAgents();
  };

  const closeAssignModal = () => {
    setShowAssignModal(false);
    setSelectedTicketId(null);
  };

  const assignTicketToAgent = async (agentId) => {
    try {
      await API.put(`/tickets/${selectedTicketId}/assign?assigneeId=${agentId}`);
      closeAssignModal();
      fetchTickets();
    } catch (e) {
      alert("Failed assigning");
    }
  };

  const updateStatus = async (id, st) => {
    try {
      await API.put(`/tickets/${id}/status?status=${st}`);
      fetchTickets();
    } catch (e) {
      alert("Failed status update");
    }
  };

  const createTicket = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    await API.post("/tickets", { subject, description, priority, category });
    setSubject("");
    setDescription("");
    setPriority("MEDIUM");
    setCategory("OTHER");
    fetchTickets();
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/");
  };

  const userRoles = Array.isArray(user?.roles) ? user.roles : [];
  const isAdmin = userRoles.includes("ROLE_ADMIN");
  const isAgent = userRoles.includes("ROLE_AGENT");
  const isUserOnly = userRoles.includes("ROLE_USER") && !isAgent && !isAdmin;

  if (!user) return <div className="p-10 text-center">Loading...</div>;

  const displayPerson = (p) => (p ? p.name || p.email : "Unknown");

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-100 via-white to-pink-100 p-8">

      {/* 🔮 Floating Blobs */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="blob blob1"></div>
        <div className="blob blob2"></div>
        <div className="blob blob3"></div>
      </div>

      <style jsx>{`
        .blob {
          position: absolute;
          width: 350px;
          height: 350px;
          background: radial-gradient(circle, #7c3aed55, #c084fc33);
          border-radius: 50%;
          filter: blur(80px);
          animation: float 9s infinite ease-in-out;
        }
        .blob1 { top: -80px; left: -80px; animation-delay: 0s; }
        .blob2 { bottom: -100px; right: -120px; animation-delay: 3s; }
        .blob3 { top: 40%; left: 40%; animation-delay: 6s; }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(40px, -30px) scale(1.2); }
        }
      `}</style>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {isAdmin ? "Admin Dashboard" : isAgent ? "Agent Dashboard" : "My Tickets"}
          </h1>
          <p className="text-gray-600 mt-1">
            Logged in as:{" "}
            <span className="font-semibold">{user.name || user.email}</span>{" "}
            <span className="text-xs px-2 py-1 bg-indigo-200 text-indigo-800 rounded-lg ml-2">
              {userRoles.join(", ")}
            </span>
          </p>
        </div>

        <div className="flex gap-3">
          {isAdmin && (
            <button
              onClick={() => router.push("/admin/users")}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl shadow-xl transition"
            >
              Manage Users
            </button>
          )}

          <button
            onClick={handleLogout}
            className="bg-gray-800 hover:bg-black text-white px-5 py-2 rounded-xl shadow-xl transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg p-5 mb-8 border border-white">
        <div className="flex gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tickets by subject or description..."
            className="flex-1 p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-4 rounded-xl border border-gray-300"
          >
            <option value="">All Status</option>
            <option value="OPEN">🟢 Open</option>
            <option value="IN_PROGRESS">🔵 In Progress</option>
            <option value="RESOLVED">🟡 Resolved</option>
            <option value="CLOSED">⚫ Closed</option>
          </select>
        </div>
      </div>

      {/* USER TICKET CREATION */}
      {isUserOnly && (
        <form
          onSubmit={createTicket}
          className="bg-gradient-to-br from-white to-indigo-50 rounded-3xl shadow-xl p-8 mb-10 border border-indigo-200"
        >
          <h2 className="text-2xl font-bold mb-4">Create Ticket</h2>

          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
            className="w-full p-4 rounded-xl border mb-4"
            required
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="w-full p-4 rounded-xl border mb-4 h-32"
            required
          />

          <div className="grid grid-cols-2 gap-3 mb-4">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="p-4 rounded-xl border"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="p-4 rounded-xl border"
            >
              <option value="HARDWARE">Hardware</option>
              <option value="SOFTWARE">Software</option>
              <option value="NETWORK">Network</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl shadow-xl">
            Create Ticket
          </button>
        </form>
      )}

      {/* TICKETS */}
      <h2 className="text-2xl font-bold mb-4">
        {isAdmin ? "All Tickets" : isAgent ? "Assigned Tickets" : "Your Tickets"}
      </h2>

      {tickets.length === 0 ? (
        <div className="bg-white/60 backdrop-blur-xl p-10 rounded-2xl shadow text-center text-gray-600">
          No tickets found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map((t) => (
            <div
              key={t.id}
              className="rounded-2xl shadow-xl p-6 border bg-white/80 backdrop-blur-lg hover:-translate-y-1 hover:shadow-2xl transition"
            >
              {/* color bar */}
              <div
                className={`h-1.5 rounded-full mb-4 ${
                  t.status === "OPEN"
                    ? "bg-green-500"
                    : t.status === "IN_PROGRESS"
                    ? "bg-blue-500"
                    : t.status === "RESOLVED"
                    ? "bg-yellow-500"
                    : "bg-gray-500"
                }`}
              ></div>

              <button
                onClick={() => router.push(`/ticket/${t.id}`)}
                className="text-left text-lg font-semibold mb-3 hover:text-indigo-600"
              >
                #{t.id} — {t.subject}
              </button>

              <div className="flex gap-2 mb-3">
                <span className="px-2 py-1 text-xs rounded-lg bg-indigo-100 text-indigo-700">
                  {t.status}
                </span>
                <span className="px-2 py-1 text-xs rounded-lg bg-purple-100 text-purple-700">
                  {t.priority}
                </span>
                <span className="px-2 py-1 text-xs rounded-lg bg-pink-100 text-pink-700">
                  {t.category}
                </span>
              </div>

              <p className="text-gray-600 text-sm mb-3">{t.description}</p>

              <div className="text-xs text-gray-500 mb-4">
                <p>
                  <b>Owner:</b> {displayPerson(t.owner)}
                </p>
                <p>
                  <b>Assignee:</b> {displayPerson(t.assignee)}
                </p>
              </div>

              {(isAdmin || isAgent) && (
                <div className="flex gap-2">
                  <select
                    value={t.status}
                    onChange={(e) => updateStatus(t.id, e.target.value)}
                    className="p-2 text-xs rounded-lg border"
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>

                  {isAdmin && (
                    <button
                      onClick={() => openAssignModal(t.id)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 text-xs rounded-lg"
                    >
                      {t.assignee ? "Reassign" : "Assign"}
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ASSIGN MODAL */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Assign Ticket #{selectedTicketId}</h2>

            {loadingAgents ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <>
                <div className="max-h-80 overflow-y-auto space-y-3">
                  {agents.map((agent) => (
                    <button
                      key={agent.id}
                      onClick={() => assignTicketToAgent(agent.id)}
                      className="w-full p-4 border rounded-xl hover:bg-indigo-50 transition text-left"
                    >
                      <div className="flex justify-between">
                        <div>
                          <div className="font-semibold">
                            {agent.name || agent.email}
                          </div>
                          <div className="text-xs text-gray-500">{agent.email}</div>
                        </div>

                        <div className="text-right">
                          <div
                            className={`font-bold ${
                              agent.activeTickets < 3
                                ? "text-green-600"
                                : agent.activeTickets < 6
                                ? "text-yellow-600"
                                : "text-red-600"
                            }`}
                          >
                            {agent.activeTickets}
                          </div>
                          <div className="text-xs text-gray-500">active</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="text-right mt-5">
                  <button
                    onClick={closeAssignModal}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
