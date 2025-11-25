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

  // Load user from localStorage on mount
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
        parsedUser.roles = Array.isArray(parsedUser.roles) ? parsedUser.roles : [];
        setUser(parsedUser);
      }
    } catch (e) {
      console.error("Error loading user", e);
      localStorage.clear();
      router.push("/");
    }
  }, []);

  // Fetch tickets when user or filters change
  useEffect(() => {
    if (!user) return;
    fetchTickets();
  }, [user, search, statusFilter]);

  // Build query only if filter values are meaningful
  const buildTicketsUrl = () => {
    const params = new URLSearchParams();
    if (search && search.trim().length > 0) params.append("search", search.trim());
    if (statusFilter && statusFilter !== "" && statusFilter !== "ALL")
      params.append("status", statusFilter);
    const query = params.toString();
    return `/tickets${query ? "?" + query : ""}`;
  };

  const fetchTickets = async () => {
    try {
      const url = buildTicketsUrl();
      const res = await API.get(url);
      setTickets(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Unable to fetch tickets:", err);
      alert("Failed to load tickets. Please try again.");
      setTickets([]);
    }
  };

  const fetchAgents = async () => {
    setLoadingAgents(true);
    try {
      const res = await API.get("/admin/agents");
      setAgents(res.data || []);
    } catch (err) {
      console.error("Failed to load agents", err);
      alert("Failed to load agents");
      setAgents([]);
    } finally {
      setLoadingAgents(false);
    }
  };

  const openAssignModal = (ticketId) => {
    setSelectedTicketId(ticketId);
    setShowAssignModal(true);
    fetchAgents();
  };

  const closeAssignModal = () => {
    setShowAssignModal(false);
    setSelectedTicketId(null);
    setAgents([]);
  };

  const assignTicketToAgent = async (agentId) => {
    try {
      await API.put(`/tickets/${selectedTicketId}/assign?assigneeId=${agentId}`);
      closeAssignModal();
      fetchTickets();
    } catch (err) {
      console.error("Assign error:", err);
      alert("Failed to assign ticket");
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await API.put(`/tickets/${id}/status?status=${newStatus}`);
      fetchTickets();
    } catch (err) {
      console.error("Status update error:", err);
      alert("Failed to update status");
    }
  };

  const createTicket = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      alert("Subject and description are required");
      return;
    }
    try {
      await API.post("/tickets", { subject, description, priority, category });
      setSubject("");
      setDescription("");
      setPriority("MEDIUM");
      setCategory("OTHER");
      // refresh so the user's new ticket appears immediately
      await fetchTickets();
      alert("Ticket created!");
    } catch (err) {
      console.error("Create ticket error:", err);
      alert("Failed to create ticket");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  const userRoles = Array.isArray(user?.roles) ? user.roles : [];
  const isAdmin = userRoles.includes("ROLE_ADMIN");
  const isAgent = userRoles.includes("ROLE_AGENT");
  const isUserOnly = userRoles.includes("ROLE_USER") && !isAgent && !isAdmin;

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );

  // Helper to display name or fallback to email
  const displayPerson = (person) => {
    if (!person) return null;
    return person.name || person.email || null;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            {isAdmin ? "Admin Dashboard" : isAgent ? "Agent Dashboard" : "My Tickets"}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Logged in as: {user.name || user.email} ({userRoles.join(", ")})
          </p>
        </div>

        <div className="flex gap-2">
          {isAdmin && (
            <button
              onClick={() => router.push("/admin/users")}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Manage Users
            </button>
          )}

          <button
            onClick={handleLogout}
            className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="mb-6 flex gap-3 bg-gray-50 p-4 rounded-lg shadow-sm">
        <input
          placeholder="Search tickets by subject or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border rounded flex-grow"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">All Status</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>

      {/* Create Ticket (Users Only) */}
      {isUserOnly && (
        <form onSubmit={createTicket} className="mb-6 p-6 border rounded-lg bg-white shadow">
          <h2 className="text-xl font-semibold mb-4">Create Ticket</h2>

          <input
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
            className="w-full p-3 mb-3 border rounded"
          />

          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="w-full p-3 mb-3 border rounded h-24"
          />

          <div className="flex gap-3 mb-3">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="p-3 border rounded flex-1"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="p-3 border rounded flex-1"
            >
              <option value="HARDWARE">Hardware</option>
              <option value="SOFTWARE">Software</option>
              <option value="NETWORK">Network</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <button className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700">
            Create Ticket
          </button>
        </form>
      )}

      {/* Ticket List header */}
      <h2 className="text-xl font-semibold mb-3">
        {isAdmin ? "All Tickets" : isAgent ? "Assigned Tickets" : "Your Tickets"}
      </h2>

      {/* Ticket list */}
      {tickets.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No tickets found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tickets.map((t) => (
            <div
              key={t.id}
              className={`p-5 border rounded-lg shadow transition hover:shadow-lg ${t.status === "OPEN"
                  ? "bg-green-50 border-green-200"
                  : t.status === "IN_PROGRESS"
                    ? "bg-blue-50 border-blue-200"
                    : t.status === "RESOLVED"
                      ? "bg-yellow-50 border-yellow-200"
                      : "bg-gray-100 border-gray-300"
                }`}
            >
              <button
                onClick={() => router.push(`/ticket/${t.id}`)}
                className="text-left w-full text-lg font-semibold block mb-2 hover:text-blue-600"
              >
                #{t.id} - {t.subject}
              </button>

              <div className="text-sm mb-3">
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-semibold mr-2 ${t.status === "OPEN"
                      ? "bg-green-200 text-green-900"
                      : t.status === "IN_PROGRESS"
                        ? "bg-blue-200 text-blue-900"
                        : t.status === "RESOLVED"
                          ? "bg-yellow-200 text-yellow-900"
                          : "bg-gray-300 text-gray-900"
                    }`}
                >
                  {t.status.replace("_", " ")}
                </span>

                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-semibold ${t.priority === "URGENT"
                      ? "bg-red-200 text-red-900"
                      : t.priority === "HIGH"
                        ? "bg-orange-200 text-orange-900"
                        : t.priority === "MEDIUM"
                          ? "bg-yellow-200 text-yellow-900"
                          : "bg-gray-200 text-gray-900"
                    }`}
                >
                  {t.priority}
                </span>

                <span className="inline-block ml-2 px-2 py-1 rounded text-xs font-semibold bg-purple-200 text-purple-900">
                  {t.category}
                </span>
              </div>

              <div className="text-sm text-gray-700 mb-3 line-clamp-2">{t.description}</div>

              <div className="text-xs text-gray-500 mb-3 border-t pt-2">
                <div>
                  <strong>Owner:</strong> {displayPerson(t.owner) || "Unknown"}
                </div>
                <div>
                  <strong>Assignee:</strong> {displayPerson(t.assignee) || "Unassigned"}
                </div>
                <div>
                  <strong>Created:</strong> {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "-"}
                </div>
              </div>

              {(isAdmin || isAgent) && (
                <div className="flex gap-2 flex-wrap">
                  <select
                    value={t.status}
                    onChange={(e) => updateStatus(t.id, e.target.value)}
                    className="text-xs border rounded p-1 flex-1"
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>

                  {isAdmin && (
                    <button
                      onClick={() => openAssignModal(t.id)}
                      className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
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

      {/* Assign Modal */}
      {showAssignModal && (
        <div onClick={closeAssignModal} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Assign Ticket #{selectedTicketId}</h2>
                <button onClick={closeAssignModal} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
              </div>

              {loadingAgents ? (
                <div className="text-center py-8">Loading agents...</div>
              ) : agents.length === 0 ? (
                <div className="text-center py-8 text-gray-600">No agents available.</div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {agents.map((agent) => (
                    <button
                      key={agent.id}
                      onClick={() => assignTicketToAgent(agent.id)}
                      className="w-full p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-500 transition text-left"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold">{displayPerson(agent) || agent.email}</div>
                          <div className="text-sm text-gray-600">{agent.email}</div>
                        </div>

                        <div className="text-right">
                          <div className={`text-lg font-bold ${agent.activeTickets === 0 ? "text-green-600" : agent.activeTickets < 5 ? "text-yellow-600" : "text-red-600"
                            }`}>
                            {agent.activeTickets}
                          </div>
                          <div className="text-xs text-gray-500">active tickets</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button onClick={closeAssignModal} className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
