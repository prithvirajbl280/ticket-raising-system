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
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    initializePage();
  }, []);

  useEffect(() => {
    if (user) {
      fetchTickets();
    }
  }, [search, statusFilter, user]);

  const initializePage = async () => {
    try {
      // Check if running in browser
      if (typeof window === "undefined") return;
      
      // Check for token
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/');
        return;
      }
      
      // Get user data
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        console.error('No user data found');
        localStorage.clear();
        router.push('/');
        return;
      }
      
      // Parse user data
      let parsedUser;
      try {
        parsedUser = JSON.parse(storedUser);
      } catch (e) {
        console.error('Failed to parse user data:', e);
        localStorage.clear();
        router.push('/');
        return;
      }
      
      // Validate user data structure
      if (!parsedUser || !parsedUser.email) {
        console.error('Invalid user data structure:', parsedUser);
        localStorage.clear();
        router.push('/');
        return;
      }
      
      // Ensure roles is an array
      if (!Array.isArray(parsedUser.roles)) {
        parsedUser.roles = [];
      }
      
      console.log('User initialized:', parsedUser);
      setUser(parsedUser);
      setLoading(false);
      
    } catch (error) {
      console.error('Error initializing page:', error);
      localStorage.clear();
      router.push('/');
    }
  };

  const fetchTickets = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      
      const res = await API.get(`/tickets?${params.toString()}`);
      setTickets(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Unable to fetch tickets:", err);
      if (err.response?.status === 401) {
        localStorage.clear();
        router.push('/');
      }
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await API.put(`/tickets/${id}/status?status=${newStatus}`);
      fetchTickets();
    } catch (err) {
      console.error("Failed to update status:", err);
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
      console.error("Failed to assign ticket:", err);
      alert("Failed to assign ticket");
    }
  };

  const createTicket = async (e) => {
    e.preventDefault();
    try {
      await API.post('/tickets', { subject, description, priority, category });
      setSubject(""); 
      setDescription(""); 
      setPriority("MEDIUM"); 
      setCategory("OTHER");
      fetchTickets();
    } catch (err) {
      console.error("Failed to create ticket:", err);
      alert("Failed to create ticket");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  // Safe role checks
  const userRoles = Array.isArray(user?.roles) ? user.roles : [];
  const isAdmin = userRoles.includes('ROLE_ADMIN');
  const isAgent = userRoles.includes('ROLE_AGENT');

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // Show error state if no user
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">Error loading user data. Redirecting...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl">My Tickets</h1>
          <p className="text-sm text-gray-600">Logged in as: {user.email}</p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <button 
              className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700" 
              onClick={() => router.push('/admin/users')}
            >
              Manage Users
            </button>
          )}
          <button 
            className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300" 
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
          onChange={e => setSearch(e.target.value)} 
          className="p-2 border rounded flex-grow" 
        />
        <select 
          value={statusFilter} 
          onChange={e => setStatusFilter(e.target.value)} 
          className="p-2 border rounded"
        >
          <option value="">All Status</option>
          <option value="OPEN">OPEN</option>
          <option value="IN_PROGRESS">IN PROGRESS</option>
          <option value="RESOLVED">RESOLVED</option>
          <option value="CLOSED">CLOSED</option>
        </select>
      </div>

      <form onSubmit={createTicket} className="mb-6 p-4 border rounded bg-gray-50">
        <h2 className="font-semibold mb-2">Create New Ticket</h2>
        <input 
          required 
          placeholder="Subject" 
          value={subject} 
          onChange={e => setSubject(e.target.value)} 
          className="w-full p-2 mb-2 border rounded" 
        />
        <textarea 
          required 
          placeholder="Description" 
          value={description} 
          onChange={e => setDescription(e.target.value)} 
          className="w-full p-2 mb-2 border rounded" 
          rows="3"
        />
        <div className="flex gap-2 mb-2">
          <select 
            value={priority} 
            onChange={e => setPriority(e.target.value)} 
            className="p-2 border rounded"
          >
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="URGENT">URGENT</option>
          </select>
          <select 
            value={category} 
            onChange={e => setCategory(e.target.value)} 
            className="p-2 border rounded"
          >
            <option value="HARDWARE">HARDWARE</option>
            <option value="SOFTWARE">SOFTWARE</option>
            <option value="NETWORK">NETWORK</option>
            <option value="OTHER">OTHER</option>
          </select>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Create Ticket
        </button>
      </form>

      <div className="mb-2 text-gray-600">
        Showing {tickets.length} ticket{tickets.length !== 1 ? 's' : ''}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tickets.length === 0 ? (
          <div className="col-span-2 text-center py-8 text-gray-500">
            No tickets found. Create one above to get started!
          </div>
        ) : (
          tickets.map(t => (
            <div key={t.id} className="p-4 border rounded hover:shadow-lg transition-shadow">
              <a 
                href={`/ticket/${t.id}`} 
                className="text-lg font-semibold hover:text-blue-600 cursor-pointer"
              >
                {t.subject}
              </a>
              <div className="text-sm text-gray-600 mt-1">
                Status: <span className={`font-bold ${
                  t.status === 'OPEN' ? 'text-green-600' : 
                  t.status === 'IN_PROGRESS' ? 'text-blue-600' :
                  t.status === 'RESOLVED' ? 'text-purple-600' :
                  'text-gray-600'
                }`}>{t.status}</span>
                {' • '}Priority: <span className={`font-bold ${
                  t.priority === 'URGENT' ? 'text-red-600' :
                  t.priority === 'HIGH' ? 'text-orange-600' :
                  'text-gray-600'
                }`}>{t.priority}</span>
                {' • '}Category: {t.category}
              </div>
              <div className="mt-2 text-sm text-gray-700">
                {t.description?.slice(0, 150)}{t.description?.length > 150 ? '...' : ''}
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Owner: {t.owner?.email || 'Unknown'} • Assignee: {t.assignee?.email || "Unassigned"}
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
                    className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200"
                  >
                    Assign
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
