import { useEffect, useState } from "react";
import API from "../lib/api";
import { useRouter } from "next/router";

export default function Dashboard() {
  const [tickets, setTickets] = useState([]);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [user, setUser] = useState(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    if (!token) router.push("/");
    
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    fetchTickets();
  }, []);

  const fetchTickets = async (status = "", priority = "", search = "") => {
    try {
      const params = {};
      if (status) params.status = status;
      if (priority) params.priority = priority;
      if (search) params.search = search;
      
      const res = await API.get("/tickets", { params });
      setTickets(res.data);
    } catch (err) {
      alert("Unable to fetch tickets");
    }
  };

  const createTicket = async (e) => {
    e.preventDefault();
    try {
      await API.post("/tickets", { subject, description, priority });
      setSubject("");
      setDescription("");
      setPriority("MEDIUM");
      fetchTickets(filterStatus, filterPriority, searchQuery);
    } catch (err) {
      alert("Failed to create ticket");
    }
  };

  const handleFilter = () => {
    fetchTickets(filterStatus, filterPriority, searchQuery);
  };

  const clearFilters = () => {
    setFilterStatus("");
    setFilterPriority("");
    setSearchQuery("");
    fetchTickets();
  };

  const isAdmin = user?.roles?.includes("ROLE_ADMIN");

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm mb-6">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Ticketing System</h1>
          <div className="flex gap-4 items-center">
            <span className="text-sm text-gray-600">{user?.email}</span>
            {isAdmin && (
              <button
                onClick={() => router.push("/admin")}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              >
                Admin Panel
              </button>
            )}
            <button
              className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                router.push("/");
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4">
        {/* Create Ticket Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Create New Ticket</h2>
          <form onSubmit={createTicket}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Subject</label>
                <input
                  required
                  placeholder="Brief description of the issue"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                required
                placeholder="Detailed description of the issue"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border rounded h-24 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
              Create Ticket
            </button>
          </form>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Search & Filter</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Search</label>
              <input
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={handleFilter}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Apply
              </button>
              <button
                onClick={clearFilters}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Tickets List */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">My Tickets ({tickets.length})</h2>
          {tickets.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No tickets found</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tickets.map((t) => (
                <div
                  key={t.id}
                  className="border rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                  onClick={() => router.push(`/ticket/${t.id}`)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{t.subject}</h3>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        t.priority === "URGENT"
                          ? "bg-red-100 text-red-700"
                          : t.priority === "HIGH"
                          ? "bg-orange-100 text-orange-700"
                          : t.priority === "MEDIUM"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {t.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {t.description}
                  </p>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span
                      className={`px-2 py-1 rounded ${
                        t.status === "OPEN"
                          ? "bg-blue-100 text-blue-700"
                          : t.status === "IN_PROGRESS"
                          ? "bg-purple-100 text-purple-700"
                          : t.status === "RESOLVED"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {t.status}
                    </span>
                    <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    <div>Owner: {t.owner?.email}</div>
                    <div>
                      Assignee: {t.assignee?.email || "Unassigned"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
