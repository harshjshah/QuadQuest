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
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 bg-cover" style={{ backgroundImage: "url('images/bg1.jpg')" }}>
            <div className="p-8 text-center space-y-4 w-100">
                <h1 className="text-3xl font-bold mb-2 text-white">Welcome to Quad Quest!</h1>
                <button
                    onClick={handleGoogle}
                    className="w-50 bg-red-500 text-white py-2 px-4 mx-2 rounded hover:bg-red-600"
                >
                    Login with Google
                </button>
                <button
                    onClick={handleAnon}
                    className="w-50 bg-gray-100 text-black py-2 px-4 mx-2 rounded hover:bg-gray-300"
                >
                    Login as Guest
                </button>
            </div>
        </div>
    );
}