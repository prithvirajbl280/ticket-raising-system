import { useEffect, useState } from "react";
import API from "../lib/api";
import { useRouter } from "next/router";

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [activeTab, setActiveTab] = useState("users");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    if (!token) {
      router.push("/");
      return;
    }
    
    if (userData) {
      const user = JSON.parse(userData);
      if (!user.roles?.includes("ROLE_ADMIN")) {
        alert("Access denied");
        router.push("/dashboard");
        return;
      }
    }
    
    fetchUsers();
    fetchAllTickets();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await API.get("/admin/users");
      setUsers(res.data);
    } catch (err) {
      alert("Failed to fetch users");
    }
  };

  const fetchAllTickets = async () => {
    try {
      const res = await API.get("/admin/tickets");
      setTickets(res.data);
    } catch (err) {
      alert("Failed to fetch tickets");
    }
  };

  const assignRole = async (userId, role) => {
    try {
      await API.post(`/admin/users/${userId}/role`, { role });
      fetchUsers();
      alert("Role assigned successfully");
    } catch (err) {
      alert("Failed to assign role");
    }
  };

  const removeRole = async (userId, role) => {
    try {
      await API.delete(`/admin/users/${userId}/role`, { data: { role } });
      fetchUsers();
      alert("Role removed successfully");
    } catch (err) {
      alert("Failed to remove role");
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await API.delete(`/admin/users/${userId}`);
      fetchUsers();
      alert("User deleted successfully");
    } catch (err) {
      alert("Failed to delete user");
    }
  };

  const deleteTicket = async (ticketId) => {
    if (!confirm("Are you sure you want to delete this ticket?")) return;
    try {
      await API.delete(`/admin/tickets/${ticketId}`);
      fetchAllTickets();
      alert("Ticket deleted successfully");
    } catch (err) {
      alert("Failed to delete ticket");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm mb-6">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4">
        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-6 py-2 rounded ${
              activeTab === "users"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            User Management ({users.length})
          </button>
          <button
            onClick={() => setActiveTab("tickets")}
            className={`px-6 py-2 rounded ${
              activeTab === "tickets"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            All Tickets ({tickets.length})
          </button>
        </div>

        {/* User Management */}
        {activeTab === "users" && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Users</h2>
              <div className="
