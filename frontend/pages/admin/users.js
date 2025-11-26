import { useEffect, useState } from "react";
import API from "../../lib/api";
import { useRouter } from "next/router";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const router = useRouter();

  const AVAILABLE_ROLES = ["ROLE_USER", "ROLE_AGENT", "ROLE_ADMIN"];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user?.roles?.includes("ROLE_ADMIN")) {
      alert("Access Denied - Admin Only");
      router.push("/dashboard");
      return;
    }

    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await API.get("/admin/users");
      setUsers(res.data);
    } catch (err) {
      alert("Failed to fetch users");
    }
  };

  const deleteUser = async (id) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

    try {
      await API.delete(`/admin/users/${id}`);
      fetchUsers();
      alert("User deleted successfully!");
    } catch (err) {
      alert("Failed to delete user");
    }
  };

  const openRoleModal = (user) => {
    setEditingUser(user);
    setSelectedRoles(user.roles || []);
    setShowRoleModal(true);
  };

  const closeRoleModal = () => {
    setEditingUser(null);
    setSelectedRoles([]);
    setShowRoleModal(false);
  };

  const toggleRole = (role) => {
    setSelectedRoles([role]);
  };

  const saveRoles = async () => {
    if (!editingUser) return;
    try {
      await API.put(`/admin/users/${editingUser.id}/roles`, selectedRoles);
      closeRoleModal();
      fetchUsers();
    } catch (err) {
      console.error("Failed to update roles", err);
      alert("Failed to update roles");
    }
  };

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

      <div className="relative max-w-7xl mx-auto">
        {/* Back Button - Same style as ticket detail page */}
        <button
          onClick={() => router.push("/dashboard")}
          className="inline-flex items-center gap-2 text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 font-bold px-6 py-3 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 transition-all duration-200 mb-6"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </button>

        {/* Main Card */}
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border-2 border-white/50">
          {/* Colored Header Bar - Same as ticket page */}
          <div className="h-3 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600"></div>

          {/* Header Section */}
          <div className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-grow">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-4 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full text-sm font-bold shadow-lg">
                    Admin Panel
                  </span>
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">User Management</h1>
                <p className="text-gray-600">Manage all system users and their permissions</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-6 py-3 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border-2 border-indigo-200">
                  <div className="text-center">
                    <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {users.length}
                    </div>
                    <div className="text-xs text-gray-600 font-semibold">Total Users</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Users Info Card - Similar to ticket info */}
            <div className="mb-6 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border-2 border-indigo-200">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="font-bold text-gray-800 text-lg">User Overview</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <div>
                    <span className="font-bold text-gray-700">Users:</span>
                    <p className="text-gray-600">{users.filter(u => u.roles?.includes("ROLE_USER")).length}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <div>
                    <span className="font-bold text-gray-700">Agents:</span>
                    <p className="text-gray-600">{users.filter(u => u.roles?.includes("ROLE_AGENT")).length}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <div>
                    <span className="font-bold text-gray-700">Admins:</span>
                    <p className="text-gray-600">{users.filter(u => u.roles?.includes("ROLE_ADMIN")).length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Users Table Section */}
          <div className="px-8 pb-8">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-200 overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-blue-500 to-cyan-500">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  All Users
                </h2>
              </div>

              {/* Table */}
              <div className="overflow-x-auto bg-white">
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-slate-100 to-gray-100">
                    <tr>
                      <th className="py-4 px-6 text-left text-sm font-bold text-gray-800">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                          </svg>
                          ID
                        </div>
                      </th>
                      <th className="py-4 px-6 text-left text-sm font-bold text-gray-800">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Email
                        </div>
                      </th>
                      <th className="py-4 px-6 text-left text-sm font-bold text-gray-800">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Name
                        </div>
                      </th>
                      <th className="py-4 px-6 text-left text-sm font-bold text-gray-800">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          Roles
                        </div>
                      </th>
                      <th className="py-4 px-6 text-center text-sm font-bold text-gray-800">
                        <div className="flex items-center justify-center gap-2">
                          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                          </svg>
                          Actions
                        </div>
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {users.map((u, index) => (
                      <tr
                        key={u.id}
                        className={`${index % 2 === 0 ? "bg-white" : "bg-slate-50/50"} hover:bg-indigo-50 transition-all duration-200 border-b border-gray-200`}
                      >
                        <td className="py-4 px-6">
                          <span className="px-3 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 rounded-full text-xs font-bold">
                            {u.id}
                          </span>
                        </td>

                        <td className="py-4 px-6 font-semibold text-gray-900">
                          {u.email}
                        </td>

                        <td className="py-4 px-6 text-gray-700 font-medium">
                          {u.name || <span className="text-gray-400 italic">No name</span>}
                        </td>

                        <td className="py-4 px-6">
                          {Array.isArray(u.roles) && u.roles.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {u.roles.map((r) => (
                                <span
                                  key={r}
                                  className={`px-3 py-1 rounded-full text-xs font-bold shadow-md ${
                                    r === "ROLE_ADMIN"
                                      ? "bg-gradient-to-r from-red-400 to-rose-500 text-white"
                                      : r === "ROLE_AGENT"
                                      ? "bg-gradient-to-r from-blue-400 to-cyan-500 text-white"
                                      : "bg-gradient-to-r from-green-400 to-emerald-500 text-white"
                                  }`}
                                >
                                  {r.replace("ROLE_", "")}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm italic">No roles</span>
                          )}
                        </td>

                        <td className="py-4 px-6 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
                              onClick={() => openRoleModal(u)}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                              Edit
                            </button>
                            <button
                              className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
                              onClick={() => deleteUser(u.id)}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {users.length === 0 && (
                      <tr>
                        <td colSpan="5" className="py-16 text-center">
                          <div className="flex flex-col items-center gap-4">
                            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                            </div>
                            <p className="text-gray-500 font-medium text-lg">No users found</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Role Modal - Similar style to ticket page modals */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            <div className="h-3 bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500"></div>
            
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Edit User Roles</h2>
                <button onClick={closeRoleModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-6 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border-2 border-indigo-200">
                <p className="text-sm text-gray-700">
                  Editing roles for: <strong className="text-indigo-600">{editingUser?.email}</strong>
                </p>
              </div>

              <div className="space-y-3 mb-8">
                {AVAILABLE_ROLES.map((role) => (
                  <label
                    key={role}
                    className={`flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-all duration-200 ${
                      selectedRoles.includes(role)
                        ? "border-indigo-500 bg-indigo-50 shadow-md"
                        : "border-gray-200 hover:border-indigo-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 transition-colors ${
                      selectedRoles.includes(role)
                        ? "border-indigo-500 bg-indigo-500"
                        : "border-gray-300"
                    }`}>
                      {selectedRoles.includes(role) && (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedRoles.includes(role)}
                      onChange={() => toggleRole(role)}
                      className="hidden"
                    />
                    <span className={`font-bold ${selectedRoles.includes(role) ? "text-indigo-700" : "text-gray-600"}`}>
                      {role.replace("ROLE_", "")}
                    </span>
                  </label>
                ))}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={closeRoleModal}
                  className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveRoles}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
