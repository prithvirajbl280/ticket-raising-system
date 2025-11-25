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
  
  // Modal state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [agents, setAgents] = useState([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  
  const router = useRouter();

  // Load user from localStorage
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

  // Fetch tickets when user loads or filters change
  useEffect(() => {
    if (!user) return;
    fetchTickets();
  }, [user, search, statusFilter]);

  const fetchTickets = async () => {
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append("search", search.trim());
      if (statusFilter && statusFilter !== "ALL") params.append("status", statusFilter);

      const res = await API.get(`/tickets?${params.toString()}`);
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
      console.error("Failed to fetch agents:", err);
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
      alert("Ticket assigned successfully!");
      closeAssignModal();
      fetchTickets();
    } catch (err) {
      alert("Failed to assign ticket");
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await API.put(`/tickets/${id}/status?status=${newStatus}`);
      fetchTickets();
    } catch (err) {
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
      alert("Ticket created successfully!");
      fetchTickets();
    } catch (err) {
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
  const isUser = userRoles.includes("ROLE_USER");

  // Show loader until user is ready
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            {isAdmin ? "Admin Dashboard" : isAgent ? "Agent Dashboard" : "My Tickets"}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Logged in as: {user.email} ({userRoles.join(", ")})
          </p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <button
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              onClick={() => router.push("/admin/users")}
            >
              Manage Users
            </button>
          )}
          <button
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex gap-3 bg-gray-50 p-4 rounded-lg">
        <input
          placeholder="Search by subject or description..."
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
        <button
          onClick={fetchTickets}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {/* Create Ticket Form - ONLY FOR REGULAR USERS */}
      {isUser && !isAgent && !isAdmin && (
        <form onSubmit={createTicket} className="mb-6 p-6 border rounded-lg bg-white shadow">
          <h2 className="text-xl font-semibold mb-4">Create New Ticket</h2>
          <input
            required
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full p-3 mb-3 border rounded"
          />
          <textarea
            required
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 mb-3 border rounded h-24"
          />
          <div className="flex gap-3 mb-3">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="p-3 border rounded flex-1"
            >
              <option value="LOW">Low Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="HIGH">High Priority</option>
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
          <button className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 font-semibold">
            Create Ticket
          </button>
        </form>
      )}

      {/* Tickets List */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-3">
          {isAdmin ? "All Tickets" : isAgent ? "Assigned Tickets" : "Your Tickets"} 
          <span className="text-sm font-normal text-gray-600 ml-2">
            ({tickets.length} {tickets.length === 1 ? "ticket" : "tickets"})
          </span>
        </h2>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-lg">
            {search || statusFilter ? "No tickets match your search criteria" : "No tickets found"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tickets.map((t) => (
            <div key={t.id} className="p-5 border rounded-lg bg-white shadow hover:shadow-md transition">
              <a
                href={`/ticket/${t.id}`}
                className="text-lg font-semibold hover:text-blue-600 block mb-2"
              >
                #{t.id} - {t.subject}
              </a>
              
              <div className="text-sm mb-3">
                <span className={`inline-block px-2 py-1 rounded text-xs font-semibold mr-2 ${
                  t.status === "OPEN" ? "bg-green-100 text-green-800" :
                  t.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-800" :
                  t.status === "RESOLVED" ? "bg-yellow-100 text-yellow-800" :
                  "bg-gray-100 text-gray-800"
                }`}>
                  {t.status.replace("_", " ")}
                </span>
                <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                  t.priority === "URGENT" ? "bg-red-100 text-red-800" :
                  t.priority === "HIGH" ? "bg-orange-100 text-orange-800" :
                  t.priority === "MEDIUM" ? "bg-yellow-100 text-yellow-800" :
                  "bg-gray-100 text-gray-800"
                }`}>
                  {t.priority}
                </span>
                <span className="inline-block px-2 py-1 rounded text-xs font-semibold ml-2 bg-purple-100 text-purple-800">
                  {t.category}
                </span>
              </div>

              <div className="text-sm text-gray-700 mb-3 line-clamp-2">
                {t.description}
              </div>

              <div className="text-xs text-gray-500 mb-3 border-t pt-2">
                <div><strong>Owner:</strong> {t.owner?.email || "Unknown"}</div>
                <div><strong>Assignee:</strong> {t.assignee?.email || "Unassigned"}</div>
                <div><strong>Created:</strong> {new Date(t.createdAt).toLocaleDateString()}</div>
              </div>

              {/* Admin/Agent Actions */}
              <div className="flex gap-2 flex-wrap">
                {(isAdmin || isAgent) && (
                  <>
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
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Agent Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={closeAssignModal}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Assign Ticket #{selectedTicketId}</h2>
                <button onClick={closeAssignModal} className="text-gray-500 hover:text-gray-700 text-2xl">
                  &times;
                </button>
              </div>

              {loadingAgents ? (
                <div className="text-center py-8">Loading agents...</div>
              ) : agents.length === 0 ? (
                <div className="text-center py-8 text-gray-600">
                  No agents available. Please create agent users first.
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  <p className="text-sm text-gray-600 mb-3">
                    Select an agent to assign this ticket. Agents are sorted by current workload.
                  </p>
                  {agents.map((agent) => (
                    <button
                      key={agent.id}
                      onClick={() => assignTicketToAgent(agent.id)}
                      className="w-full p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-500 transition text-left"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold">{agent.name || agent.email}</div>
                          <div className="text-sm text-gray-600">{agent.email}</div>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${
                            agent.activeTickets === 0 ? "text-green-600" :
                            agent.activeTickets < 5 ? "text-yellow-600" :
                            "text-red-600"
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
                <button
                  onClick={closeAssignModal}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
