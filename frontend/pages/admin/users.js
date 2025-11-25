import { useEffect, useState } from "react";
import API from "../../lib/api";
import { useRouter } from "next/router";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user?.roles?.includes("ROLE_ADMIN")) {
      alert("Access Denied");
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
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      await API.delete(`/admin/users/${id}`);
      fetchUsers();
    } catch (err) {
      alert("Failed to delete user");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      {/* Header */}
      <div className="max-w-5xl mx-auto flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>

        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl shadow-md transition"
          onClick={() => router.push("/dashboard")}
        >
          Back to Dashboard
        </button>
      </div>

      {/* Table Card */}
      <div className="max-w-5xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden">
        <table className="min-w-full table-auto">
          <thead className="bg-slate-100 border-b">
            <tr>
              <th className="py-3 px-4 text-left text-gray-700 font-semibold">
                ID
              </th>
              <th className="py-3 px-4 text-left text-gray-700 font-semibold">
                Email
              </th>
              <th className="py-3 px-4 text-left text-gray-700 font-semibold">
                Name
              </th>
              <th className="py-3 px-4 text-left text-gray-700 font-semibold">
                Roles
              </th>
              <th className="py-3 px-4 text-center text-gray-700 font-semibold">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {users.map((u, index) => (
              <tr
                key={u.id}
                className={`${
                  index % 2 === 0 ? "bg-white" : "bg-slate-50"
                } hover:bg-slate-100 transition`}
              >
                <td className="py-3 px-4">{u.id}</td>

                <td className="py-3 px-4 font-medium text-gray-800">
                  {u.email}
                </td>

                <td className="py-3 px-4 text-gray-700">
                  {u.name || "—"}
                </td>

                <td className="py-3 px-4">
                  {Array.isArray(u.roles) && u.roles.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {u.roles.map((r) => (
                        <span
                          key={r}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-500 text-sm">No roles</span>
                  )}
                </td>

                <td className="py-3 px-4 text-center">
                  <button
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm shadow-md transition"
                    onClick={() => deleteUser(u.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {users.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  className="py-6 text-center text-gray-500 italic"
                >
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
