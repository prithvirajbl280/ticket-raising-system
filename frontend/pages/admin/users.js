import { useEffect, useState } from "react";
import API from "../../lib/api";
import { useRouter } from "next/router";

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) router.push('/');
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user?.roles?.some(r => r.name === 'ROLE_ADMIN')) {
            alert("Access Denied");
            router.push('/dashboard');
            return;
        }
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await API.get('/admin/users');
            setUsers(res.data);
        } catch (err) {
            alert("Failed to fetch users");
        }
    };

    const deleteUser = async (id) => {
        if (!confirm("Are you sure?")) return;
        try {
            await API.delete(`/admin/users/${id}`);
            fetchUsers();
        } catch (err) {
            alert("Failed to delete user");
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl">User Management</h1>
                <button className="bg-gray-200 px-3 py-1 rounded" onClick={() => router.push('/dashboard')}>Back to Dashboard</button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 border-b">ID</th>
                            <th className="py-2 px-4 border-b">Email</th>
                            <th className="py-2 px-4 border-b">Name</th>
                            <th className="py-2 px-4 border-b">Roles</th>
                            <th className="py-2 px-4 border-b">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id}>
                                <td className="py-2 px-4 border-b text-center">{u.id}</td>
                                <td className="py-2 px-4 border-b">{u.email}</td>
                                <td className="py-2 px-4 border-b">{u.name || "-"}</td>
                                <td className="py-2 px-4 border-b">{u.roles.map(r => r.name).join(", ")}</td>
                                <td className="py-2 px-4 border-b text-center">
                                    <button className="bg-red-500 text-white px-2 py-1 rounded text-sm" onClick={() => deleteUser(u.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
