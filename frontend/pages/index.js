import { useState } from "react";
import API from "../lib/api";
import { useRouter } from "next/router";

export default function Login() {
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const router = useRouter();

  const login = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/login',{email,password});
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify({email: res.data.email, roles: res.data.roles}));
      router.push('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={login} className="w-full max-w-md p-6 border rounded">
        <h1 className="text-xl mb-4">Ticketing System — Login</h1>
        <input required value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="mb-2 w-full p-2 border rounded" />
        <input required value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="Password" className="mb-2 w-full p-2 border rounded" />
        <div className="flex justify-between items-center">
          <button className="bg-blue-600 text-white px-4 py-2 rounded">Login</button>
          <a className="text-sm text-blue-600" href="/signup">Sign up</a>
        </div>
      </form>
    </div>
  );
}
