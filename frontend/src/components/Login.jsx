import React from "react";
import { loginAnon, loginGoogle } from "../firebase";

export default function Login() {
    const handleAnon = async () => {
        try {
            await loginAnon();
        } catch (err) {
            console.error("Anonymous login failed", err);
        }
    };

    const handleGoogle = async () => {
        try {
            await loginGoogle();
        } catch (err) {
            console.error("Google login failed", err);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md text-center space-y-4 w-80">
                <h1 className="text-2xl font-bold mb-4 text-sky-600">Welcome to Quad Quest</h1>
                <button
                    onClick={handleGoogle}
                    className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
                >
                    Continue with Google
                </button>
                <button
                    onClick={handleAnon}
                    className="w-full bg-gray-300 text-black py-2 rounded hover:bg-gray-400"
                >
                    Continue as Guest
                </button>
            </div>
        </div>
    );
}