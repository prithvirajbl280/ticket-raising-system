import { useState } from "react";
import API from "../lib/api";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const submit = async (e) => {
        e.preventDefault();
        try {
            await API.post('/auth/forgot-password', { email });
            setMessage("If an account exists with this email, a reset link has been sent.");
        } catch (err) {
            setMessage("Error sending request.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <form onSubmit={submit} className="w-full max-w-md p-6 border rounded">
                <h1 className="text-xl mb-4">Forgot Password</h1>
                {message && <div className="mb-4 text-sm text-blue-600">{message}</div>}
                <input required value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" className="mb-2 w-full p-2 border rounded" />
                <button className="bg-blue-600 text-white px-4 py-2 rounded w-full">Send Reset Link</button>
            </form>
        </div>
    );
}
