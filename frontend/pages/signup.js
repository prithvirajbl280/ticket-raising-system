import { useState } from "react";
import API from "../lib/api";
import { useRouter } from "next/router";

export default function Signup(){
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [name,setName]=useState("");
  const router = useRouter();

  const register = async (e) => {
    e.preventDefault();
    try {
      await API.post('/auth/register',{email,password,name});
      alert("Registered. Login now.");
      router.push('/');
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={register} className="w-full max-w-md p-6 border rounded">
        <h1 className="text-xl mb-4">Sign up</h1>
        <input required value={name} onChange={e=>setName(e.target.value)} placeholder="Name" className="mb-2 w-full p-2 border rounded" />
        <input required value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="mb-2 w-full p-2 border rounded" />
        <input required value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="Password" className="mb-2 w-full p-2 border rounded" />
        <button className="bg-green-600 text-white px-4 py-2 rounded">Register</button>
      </form>
    </div>
  );
}
