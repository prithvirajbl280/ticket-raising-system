import { useState } from "react";
import API from "../lib/api";
import { useRouter } from "next/router";

export default function ResetPassword() {
    const [token, setToken] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [message, setMessage] = useState("");
    const router = useRouter();

    const submit = async (e) => {
        e.preventDefault();
        try {
            await API.post('/auth/reset-password', { token, newPassword });
            setMessage("Password updated successfully. Redirecting to login...");
            setTimeout(() => router.push('/'), 2000);
        } catch (err) {
            setMessage("Failed to reset password. Invalid or expired token.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <form onSubmit={submit} className="w-full max-w-md p-6 border rounded">
                <h1 className="text-xl mb-4">Reset Password</h1>
                {message && <div className="mb-4 text-sm text-blue-600">{message}</div>}
                <input required value={token} onChange={e => setToken(e.target.value)} placeholder="Paste your token here" className="mb-2 w-full p-2 border rounded" />
                <input required value={newPassword} onChange={e => setNewPassword(e.target.value)} type="password" placeholder="New Password" className="mb-2 w-full p-2 border rounded" />
                <button className="bg-blue-600 text-white px-4 py-2 rounded w-full">Update Password</button>
            </form>
        </div>
    );
}
