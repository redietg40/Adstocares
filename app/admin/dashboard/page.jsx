"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

export default function AdminDashboard() {
  const router = useRouter();
  const [companies, setCompanies] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("promotions");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchCompanies();
    fetchPromotions();
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await fetch("/api/admin/companies");
      const data = await res.json();
      setCompanies(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchPromotions = async () => {
    try {
      const res = await fetch("/api/admin/promotions");
      const data = await res.json();
      console.log("Promotions received:", data);
      setPromotions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error:", error);
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePromotionAction = async (id, action) => {
    try {
      const res = await fetch("/api/admin/promotions/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      
      if (res.ok) {
        setMessage(`Promotion ${action === "approve" ? "approved" : "rejected"}!`);
        fetchPromotions();
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // ✅ ADD THIS FUNCTION - handleVerify for approving companies
  const handleVerify = async (companyId, action) => {
    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, action }),
      });
      
      if (res.ok) {
        setMessage(`Company ${action === "approve" ? "approved" : "rejected"}!`);
        fetchCompanies();
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleViewProfile = (company) => {
    setSelectedCompany(company);
    setShowModal(true);
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/admin/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const pendingPromotions = promotions.filter(p => p.status === "pending");
  const approvedPromotions = promotions.filter(p => p.status === "approved");

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-700 to-pink-600 text-white shadow-xl sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Ad2Care Admin</h1>
            <p className="text-purple-100 text-sm">Manage Companies & Promotions</p>
          </div>
          <button onClick={handleLogout} className="bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30">
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {message && (
          <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4">
            {message}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <p className="text-gray-500 text-sm">Total Promotions</p>
            <p className="text-2xl font-bold text-purple-600">{promotions.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <p className="text-gray-500 text-sm">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{pendingPromotions.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <p className="text-gray-500 text-sm">Approved</p>
            <p className="text-2xl font-bold text-green-600">{approvedPromotions.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <p className="text-gray-500 text-sm">Companies</p>
            <p className="text-2xl font-bold text-blue-600">{companies.length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          <button onClick={() => setActiveTab("promotions")} className={`px-6 py-3 font-semibold transition ${activeTab === "promotions" ? "text-purple-600 border-b-2 border-purple-600" : "text-gray-500"}`}>
            Promotions ({promotions.length})
          </button>
          <button onClick={() => setActiveTab("companies")} className={`px-6 py-3 font-semibold transition ${activeTab === "companies" ? "text-purple-600 border-b-2 border-purple-600" : "text-gray-500"}`}>
            Companies ({companies.length})
          </button>
        </div>

        {/* Promotions Tab */}
        {activeTab === "promotions" && (
          <div className="space-y-6">
            {pendingPromotions.length > 0 && (
              <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b bg-yellow-50">
                  <h2 className="text-xl font-semibold text-yellow-800">Pending Approvals ({pendingPromotions.length})</h2>
                </div>
                <div className="divide-y divide-gray-100">
                  {pendingPromotions.map((promo) => (
                    <div key={promo.id} className="p-6 hover:bg-gray-50 transition">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-800">{promo.title}</h3>
                          <p className="text-gray-600 text-sm mt-1">{promo.description}</p>
                          <div className="flex gap-4 mt-2 text-sm text-gray-500">
                            <span>🏢 {promo.company?.companyName}</span>
                            {promo.link && <span>🔗 <a href={promo.link} target="_blank" className="text-purple-600 hover:underline">{promo.link}</a></span>}
                          </div>
                          <div className="flex gap-3 mt-3">
                            <span className="text-xs text-gray-400">👁️ {promo.views || 0} views</span>
                            <span className="text-xs text-gray-400">🖱️ {promo.clicks || 0} clicks</span>
                            <span className="text-xs text-gray-400">📅 {new Date(promo.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button onClick={() => handlePromotionAction(promo.id, "approve")} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm">
                            ✅ Approve
                          </button>
                          <button onClick={() => handlePromotionAction(promo.id, "reject")} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm">
                            ❌ Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {approvedPromotions.length > 0 && (
              <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b bg-green-50">
                  <h2 className="text-xl font-semibold text-green-800">Approved Promotions ({approvedPromotions.length})</h2>
                </div>
                <div className="divide-y divide-gray-100">
                  {approvedPromotions.map((promo) => (
                    <div key={promo.id} className="p-6 hover:bg-gray-50 transition">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-800">{promo.title}</h3>
                          <p className="text-gray-600 text-sm mt-1">{promo.description}</p>
                          <p className="text-sm text-gray-500 mt-1">🏢 {promo.company?.companyName}</p>
                          <div className="flex gap-3 mt-2">
                            <span className="text-xs text-gray-400">👁️ {promo.views || 0} views</span>
                            <span className="text-xs text-gray-400">🖱️ {promo.clicks || 0} clicks</span>
                          </div>
                        </div>
                        <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700">Approved</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {promotions.length === 0 && (
              <div className="bg-white rounded-2xl shadow-md p-12 text-center">
                <div className="text-6xl mb-4">📢</div>
                <p className="text-gray-500 text-lg">No promotions found</p>
                <p className="text-gray-400 text-sm mt-1">Companies will create promotions here</p>
              </div>
            )}
          </div>
        )}

        {/* Companies Tab with View Profile Button */}
        {activeTab === "companies" && (
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h2 className="text-xl font-semibold">Registered Companies</h2>
            </div>
            {companies.length === 0 ? (
              <div className="p-12 text-center text-gray-500">No companies found</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {companies.map((company) => (
                  <div key={company.id} className="p-6 hover:bg-gray-50 transition">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{company.companyName || "N/A"}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${company.isVerified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                            {company.isVerified ? "Verified" : "Pending"}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm">{company.email}</p>
                        <p className="text-sm text-gray-500">License: {company.companyLicenseNumber || "N/A"}</p>
                        <p className="text-xs text-gray-400 mt-1">Registered: {new Date(company.registrationDate).toLocaleDateString()}</p>
                      </div>
                      <button
                        onClick={() => handleViewProfile(company)}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition text-sm flex items-center gap-1"
                      >
                        👁️ View Profile
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Company Profile Modal with Uploaded Files */}
      {showModal && selectedCompany && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-5 rounded-t-2xl sticky top-0">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Company Profile</h3>
                <button onClick={() => setShowModal(false)} className="text-white text-2xl hover:text-gray-200">×</button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="border-b pb-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Basic Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Company Name</label>
                    <p className="text-gray-900 font-medium">{selectedCompany.companyName || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Email</label>
                    <p className="text-gray-900">{selectedCompany.email}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">License Number</label>
                    <p className="text-gray-900">{selectedCompany.companyLicenseNumber || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Registration Date</label>
                    <p className="text-gray-900">{new Date(selectedCompany.registrationDate).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Verification Status</label>
                    <p className={`font-semibold ${selectedCompany.isVerified ? "text-green-600" : "text-yellow-600"}`}>
                      {selectedCompany.isVerified ? "✓ Verified" : "⏳ Pending Approval"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Uploaded Documents */}
              {selectedCompany.verifications && selectedCompany.verifications.length > 0 && (
                <div className="border-b pb-4">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Uploaded Documents</h4>
                  <div className="space-y-3">
                    {selectedCompany.verifications[0].businessLicenseFileUrl && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-xs font-semibold text-purple-600 uppercase">📄 Business License</label>
                            <p className="text-sm text-gray-600 mt-1">License Document</p>
                          </div>
                          <a 
                            href={selectedCompany.verifications[0].businessLicenseFileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition flex items-center gap-2"
                          >
                            📎 View Document
                          </a>
                        </div>
                      </div>
                    )}
                    {selectedCompany.verifications[0].taxIdFileUrl && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-xs font-semibold text-purple-600 uppercase">📑 Tax ID Certificate</label>
                            <p className="text-sm text-gray-600 mt-1">Tax Document</p>
                          </div>
                          <a 
                            href={selectedCompany.verifications[0].taxIdFileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition flex items-center gap-2"
                          >
                            📎 View Document
                          </a>
                        </div>
                      </div>
                    )}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <label className="text-xs font-semibold text-gray-500 uppercase">Verification Status</label>
                      <div className="mt-2">
                        <span className={`px-3 py-1 text-xs rounded-full ${
                          selectedCompany.verifications[0].status === "approved" ? "bg-green-100 text-green-800" :
                          selectedCompany.verifications[0].status === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"
                        }`}>
                          {selectedCompany.verifications[0].status === "approved" ? "✓ Approved" : 
                           selectedCompany.verifications[0].status === "pending" ? "⏳ Pending" : "❌ Rejected"}
                        </span>
                        <p className="text-xs text-gray-500 mt-2">
                          Submitted: {new Date(selectedCompany.verifications[0].submittedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* No Documents Message */}
              {(!selectedCompany.verifications || selectedCompany.verifications.length === 0) && (
                <div className="bg-yellow-50 rounded-xl p-4 text-center">
                  <p className="text-sm text-yellow-800">No documents uploaded yet</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 font-medium transition"
                >
                  Close
                </button>
                {!selectedCompany.isVerified && (
                  <button
                    onClick={() => {
                      handleVerify(selectedCompany.id, "approve");
                      setShowModal(false);
                    }}
                    className="px-5 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium transition shadow-md"
                  >
                    ✅ Approve Company
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}