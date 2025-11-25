import { useState } from "react";
import API from "../lib/api";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const submit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        try {
            await API.post('/auth/forgot-password', { email });
            setMessage("If an account exists with this email, a reset link has been sent.");
        } catch (err) {
            setError("Something went wrong. Please try again.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
            <div className="w-full max-w-md">
                <div className="bg-white p-8 rounded-2xl shadow-xl">
                    
                    {/* Icon */}
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
                                />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">Forgot Password</h1>
                        <p className="text-gray-600 mt-1">Enter your email to receive reset instructions</p>
                    </div>

                    {/* Success */}
                    {message && (
                        <div className="mb-4 bg-green-50 text-green-700 border border-green-200 px-4 py-2 rounded-lg text-sm">
                            {message}
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="mb-4 bg-red-50 text-red-700 border border-red-200 px-4 py-2 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-4">
                        <input
                            required
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition outline-none"
                        />

                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            Send Reset Link
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <a href="/" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
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
