import { useState } from "react";
import API from "../lib/api";
import { useRouter } from "next/router";

export default function ResetPassword() {
    const [token, setToken] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const submit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        try {
            await API.post('/auth/reset-password', { token, newPassword });
            setMessage("Password updated successfully! Redirecting to login...");
            setTimeout(() => router.push('/'), 2000);
        } catch (err) {
            setError("Invalid or expired token. Please try again.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
            <div className="w-full max-w-md">
                <div className="bg-white p-8 rounded-2xl shadow-xl">
                    
                    {/* Icon */}
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                            <svg className="w-8 h-8 text-purple-600" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                <path 
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 11c1.657 0 3-1.567 3-3.5S13.657 4 12 4s-3 1.567-3 3.5S10.343 11 12 11zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                                />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">Reset Password</h1>
                        <p className="text-gray-600 mt-1">Enter reset token and new password</p>
                    </div>

                    {/* Success message */}
                    {message && (
                        <div className="mb-4 bg-green-50 text-green-700 border border-green-200 px-4 py-2 rounded-lg text-sm">
                            {message}
                        </div>
                    )}

                    {/* Error message */}
                    {error && (
                        <div className="mb-4 bg-red-50 text-red-700 border border-red-200 px-4 py-2 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-4">
                        <input
                            required
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            placeholder="Paste your reset token"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition outline-none"
                        />

                        <input
                            required
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="New password"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition outline-none"
                        />

                        <button
                            type="submit"
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            Update Password
                        </button>
                    </form>
                    // hehe
                    <div className="mt-6 text-center">
                        <a 
                            href="/" 
                            className="text-purple-600 hover:text-purple-700 font-semibold hover:underline"
                        >
                            Back to Login
                        </a>
                    </div>
                </div>

                <p className="text-center text-gray-500 text-sm mt-6">
                    Secure ticketing system for your organization
                </p>
            </div>
        </div>
    );
}
