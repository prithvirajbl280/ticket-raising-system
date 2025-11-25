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
  const router = useRouter();

  // -------------------------
  // LOAD USER FIRST (NO FETCH)
  // -------------------------
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

  // -------------------------
  // FETCH TICKETS ONLY AFTER USER EXISTS
  // -------------------------
  useEffect(() => {
    if (!user) return; // wait for user
    fetchTickets();
  }, [user, search, statusFilter]);

  const fetchTickets = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter) params.append("status", statusFilter);

      const res = await API.get(`/tickets?${params.toString()}`);

      // Ensure tickets is always an array
      setTickets(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Unable to fetch tickets:", err);
      setTickets([]); // prevent map crash
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

  const assignTicket = async (id) => {
    const assigneeId = prompt("Enter Assignee User ID:");
    if (!assigneeId) return;
    try {
      await API.put(`/tickets/${id}/assign?assigneeId=${assigneeId}`);
      fetchTickets();
    } catch (err) {
      alert("Failed to assign ticket");
    }
  };

  const createTicket = async (e) => {
    e.preventDefault();
    try {
      await API.post("/tickets", { subject, description, priority, category });
      setSubject("");
      setDescription("");
      setPriority("MEDIUM");
      setCategory("OTHER");
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

  // Show loader until user is ready
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl">My Tickets</h1>
        <div className="flex gap-2">
          {isAdmin && (
            <button
              className="bg-green-600 text-white px-3 py-1 rounded"
              onClick={() => router.push("/admin/users")}
            >
              Manage Users
            </button>
          )}
          <button
            className="bg-gray-200 px-3 py-1 rounded"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>

      <div className="mb-4 flex gap-2">
        <input
          placeholder="Search tickets..."
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
          <option value="OPEN">OPEN</option>
          <option value="IN_PROGRESS">IN PROGRESS</option>
          <option value="RESOLVED">RESOLVED</option>
          <option value="CLOSED">CLOSED</option>
        </select>
      </div>

      <form onSubmit={createTicket} className="mb-6 p-4 border rounded">
        <h2 className="font-semibold mb-2">Create Ticket</h2>
        <input
          required
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full p-2 mb-2 border rounded"
        />
        <textarea
          required
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 mb-2 border rounded"
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="p-2 mb-2 border rounded"
        >
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
          <option value="URGENT">URGENT</option>
        </select>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="p-2 mb-2 border rounded ml-2"
        >
          <option value="HARDWARE">HARDWARE</option>
          <option value="SOFTWARE">SOFTWARE</option>
          <option value="NETWORK">NETWORK</option>
          <option value="OTHER">OTHER</option>
        </select>
        <div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded">
            Create
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.isArray(tickets) &&
          tickets.map((t) => (
            <div key={t.id} className="p-4 border rounded">
              <a
                href={`/ticket/${t.id}`}
                className="text-lg font-semibold hover:text-blue-600"
              >
                {t.subject}
              </a>
              <div className="text-sm text-gray-600">
                Status:{" "}
                <span
                  className={`font-bold ${
                    t.status === "OPEN" ? "text-green-600" : "text-gray-600"
                  }`}
                >
                  {t.status}
                </span>
                {" • "}Priority: {t.priority}
                {" • "}Category: {t.category}
              </div>

              <div className="mt-2 text-sm">
                {t.description?.slice(0, 200)}
              </div>

              <div className="mt-2 text-xs text-gray-500">
                Owner: {t.owner?.email} • Assignee: {t.assignee?.email || "Unassigned"}
              </div>

              <div className="mt-3 flex gap-2">
                {(isAdmin || isAgent) && (
                  <select
                    value={t.status}
                    onChange={(e) => updateStatus(t.id, e.target.value)}
                    className="text-xs border rounded p-1"
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                )}
                {isAdmin && (
                  <button
                    onClick={() => assignTicket(t.id)}
                    className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded"
                  >
                    Assign
                  </button>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
