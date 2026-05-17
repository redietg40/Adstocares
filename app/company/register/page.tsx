"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CompanyRegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        companyName: "",
        licenseNumber: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [licenseFile, setLicenseFile] = useState<File | null>(null);
    const [taxFile, setTaxFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        if (!licenseFile || !taxFile) {
            setError("Please upload both license and tax files");
            setLoading(false);
            return;
        }

        const formDataToSend = new FormData();
        formDataToSend.append("companyName", formData.companyName);
        formDataToSend.append("licenseNumber", formData.licenseNumber);
        formDataToSend.append("email", formData.email);
        formDataToSend.append("password", formData.password);
        formDataToSend.append("licenseFile", licenseFile);
        formDataToSend.append("taxFile", taxFile);

        try {
            const res = await fetch("/api/company/register", {
                method: "POST",
                body: formDataToSend,
            });

            const data = await res.json();

            if (res.ok) {
                router.push("/company/login?registered=true");
            } else {
                setError(data.error || "Registration failed");
            }
        } catch (err) {
            setError("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center py-12 px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Register Your Company</h2>
                    <p className="mt-2 text-gray-600">Join Ad2Care to promote your products</p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Company Name</label>
                        <input
                            type="text"
                            required
                            value={formData.companyName}
                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">License Number</label>
                        <input
                            type="text"
                            required
                            value={formData.licenseNumber}
                            onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                        <input
                            type="password"
                            required
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Business License</label>
                        <input
                            type="file"
                            required
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => setLicenseFile(e.target.files?.[0] || null)}
                            className="mt-1 w-full text-sm text-gray-500 file:mr-2 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tax ID Certificate</label>
                        <input
                            type="file"
                            required
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => setTaxFile(e.target.files?.[0] || null)}
                            className="mt-1 w-full text-sm text-gray-500 file:mr-2 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition"
                    >
                        {loading ? "Registering..." : "Register Company"}
                    </button>
                </form>

                <div className="text-center mt-4">
                    <Link href="/login" className="text-purple-600 hover:text-purple-500">
                        Already have an account? Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
}

