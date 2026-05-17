"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CompanyDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [companyData, setCompanyData] = useState(null);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("promotions");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPromotion, setNewPromotion] = useState({ title: "", description: "", link: "" });
  const [submitting, setSubmitting] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/company/login");
    }
    if (session?.user?.email) {
      fetchCompanyData();
      fetchPromotions();
    }
  }, [session, status]);

  const fetchCompanyData = async () => {
    try {
      const res = await fetch("/api/company/status");
      const data = await res.json();
      setCompanyData(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchPromotions = async () => {
    try {
      const res = await fetch("/api/company/promotions");
      const data = await res.json();
      setPromotions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPromotion = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/company/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPromotion),
      });
      if (res.ok) {
        setShowAddForm(false);
        setNewPromotion({ title: "", description: "", link: "" });
        fetchPromotions();
        alert("Promotion submitted! Awaiting admin approval.");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMakePayment = (promo) => {
    setSelectedPromo(promo);
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = () => {
    if (!paymentMethod) {
      alert("Please select a payment method");
      return;
    }
    setPaymentSuccess(true);
    setTimeout(() => {
      setShowPaymentModal(false);
      setPaymentSuccess(false);
      setPaymentMethod("");
      alert("✅ Payment successful! Your promotion is now LIVE on the platform.");
      fetchPromotions();
    }, 2000);
  };

  const handleLogout = async () => {
    const { signOut } = await import("next-auth/react");
    await signOut({ redirect: false });
    router.push("/company/login");
  };

  const paymentMethods = [
    { id: "telebirr", name: "TeleBirr", icon: "📱", color: "bg-green-500" },
    { id: "cbe", name: "CBE Birr", icon: "🏦", color: "bg-blue-500" },
    { id: "abyssinia", name: "Abyssinia Bank", icon: "💳", color: "bg-red-500" },
  ];

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (companyData && !companyData.isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-amber-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="text-7xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold text-amber-700 mb-4">Account Pending Verification</h2>
          <p className="text-gray-600 mb-6">Your company account is under review. You will be able to create promotions once verified.</p>
          <button onClick={() => router.push("/")} className="bg-amber-500 text-white px-6 py-2 rounded-lg">Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gradient-to-r from-purple-700 to-pink-600 text-white shadow-xl sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Ad2Care Dashboard</h1>
            <p className="text-purple-100 text-sm">Manage your promotions</p>
          </div>
          <button onClick={handleLogout} className="bg-white/20 px-5 py-2 rounded-xl hover:bg-white/30">Logout</button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 mb-8 text-white">
          <h2 className="text-2xl font-bold mb-2">Welcome, {companyData?.companyName || "Company"}!</h2>
          <p>Create promotions → Admin approves → Make payment → Promotion goes LIVE</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <p className="text-gray-500 text-sm">Total</p>
            <p className="text-2xl font-bold text-purple-600">{promotions.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <p className="text-gray-500 text-sm">Pending Approval</p>
            <p className="text-2xl font-bold text-yellow-600">{promotions.filter(p => p.status === "pending").length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <p className="text-gray-500 text-sm">Approved / Ready to Pay</p>
            <p className="text-2xl font-bold text-blue-600">{promotions.filter(p => p.status === "approved").length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <p className="text-gray-500 text-sm">Live</p>
            <p className="text-2xl font-bold text-green-600">{promotions.filter(p => p.status === "live").length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          <button onClick={() => { setActiveTab("promotions"); setShowAddForm(false); }} className={`px-6 py-3 font-semibold ${activeTab === "promotions" ? "text-purple-600 border-b-2 border-purple-600" : "text-gray-500"}`}>
            My Promotions
          </button>
          <button onClick={() => { setActiveTab("payment"); setShowAddForm(false); }} className={`px-6 py-3 font-semibold ${activeTab === "payment" ? "text-purple-600 border-b-2 border-purple-600" : "text-gray-500"}`}>
            Make Payment
          </button>
          <button onClick={() => { setActiveTab("profile"); setShowAddForm(false); }} className={`px-6 py-3 font-semibold ${activeTab === "profile" ? "text-purple-600 border-b-2 border-purple-600" : "text-gray-500"}`}>
            Company Profile
          </button>
        </div>

        {/* Promotions Tab */}
        {activeTab === "promotions" && (
          <>
            <div className="mb-6">
              <button onClick={() => setShowAddForm(!showAddForm)} className="bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700">
                {showAddForm ? "− Cancel" : "+ Create New Promotion"}
              </button>
            </div>

            {showAddForm && (
              <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Create New Promotion</h3>
                <form onSubmit={handleAddPromotion} className="space-y-4">
                  <input type="text" placeholder="Title *" required value={newPromotion.title} onChange={(e) => setNewPromotion({...newPromotion, title: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                  <textarea rows="3" placeholder="Description" value={newPromotion.description} onChange={(e) => setNewPromotion({...newPromotion, description: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                  <input type="url" placeholder="Link (URL)" value={newPromotion.link} onChange={(e) => setNewPromotion({...newPromotion, link: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">📋 After submission, admin will review your promotion. Once approved, you can pay to make it LIVE.</p>
                  </div>
                  <button type="submit" disabled={submitting} className="w-full bg-purple-600 text-white py-2 rounded-xl">{submitting ? "Creating..." : "Create Promotion"}</button>
                </form>
              </div>
            )}

            {/* Promotions List */}
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b bg-gray-50">
                <h2 className="text-xl font-semibold">Your Promotions</h2>
                <p className="text-sm text-gray-500">Track your promotion status</p>
              </div>
              {promotions.length === 0 ? (
                <div className="p-12 text-center text-gray-500">No promotions yet. Click "Create New Promotion" to get started.</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {promotions.map((promo) => (
                    <div key={promo.id} className="p-6 hover:bg-gray-50 transition">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{promo.title}</h3>
                          <p className="text-gray-600 text-sm mt-1">{promo.description}</p>
                          {promo.link && <a href={promo.link} target="_blank" className="text-purple-600 text-sm block mt-1">🔗 {promo.link}</a>}
                          <div className="flex items-center gap-3 mt-2">
                            {promo.status === "pending" && (
                              <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-800">⏳ Awaiting Admin Approval</span>
                            )}
                            {promo.status === "approved" && (
                              <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">✅ Approved - Ready for Payment</span>
                            )}
                            {promo.status === "live" && (
                              <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">🌟 LIVE on Platform</span>
                            )}
                            <span className="text-xs text-gray-400">👁️ {promo.views || 0} views</span>
                            <span className="text-xs text-gray-400">🖱️ {promo.clicks || 0} clicks</span>
                          </div>
                        </div>
                        {promo.status === "approved" && (
                          <button onClick={() => handleMakePayment(promo)} className="bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                            💰 Pay 100 ETB & Make LIVE
                          </button>
                        )}
                        {promo.status === "live" && (
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm">🌟 LIVE</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Payment Tab */}
        {activeTab === "payment" && (
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h2 className="text-xl font-semibold">Make a Payment</h2>
              <p className="text-sm text-gray-500">Pay 100 ETB to make your approved promotion LIVE</p>
            </div>
            <div className="p-6">
              <div className="mb-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">💡 Only admin-approved promotions can be paid for.</p>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-6">
                {paymentMethods.map((method) => (
                  <div key={method.id} onClick={() => setPaymentMethod(method.id)} className={`border-2 rounded-xl p-4 cursor-pointer text-center transition ${paymentMethod === method.id ? "border-purple-600 bg-purple-50" : "border-gray-200 hover:border-purple-300"}`}>
                    <div className={`w-12 h-12 ${method.color} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                      <span className="text-2xl">{method.icon}</span>
                    </div>
                    <h3 className="font-semibold text-sm">{method.name}</h3>
                  </div>
                ))}
              </div>
              <button onClick={handlePaymentSubmit} className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700">
                Pay 100 ETB
              </button>
              <p className="text-xs text-gray-400 text-center mt-4">Demo Mode: No actual payment will be processed</p>

              <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                <h3 className="font-semibold text-sm mb-2">How Your Payment Helps</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span>💼 Platform Fee (60%)</span><span>60 ETB</span></div>
                  <div className="flex justify-between"><span>🎓 Sanitary Pads Fund (40%)</span><span>40 ETB</span></div>
                  <div className="border-t pt-2 mt-2 flex justify-between font-semibold"><span>Total</span><span>100 ETB</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Profile Tab - Company Name Displayed Here */}
        {activeTab === "profile" && companyData && (
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Company Profile</h2>
            <div className="space-y-3">
              <p><strong>Company Name:</strong> {companyData.companyName || "N/A"}</p>
              <p><strong>Email:</strong> {session?.user?.email || companyData.email || "N/A"}</p>
              <p><strong>License Number:</strong> {companyData.companyLicenseNumber || "N/A"}</p>
              <p><strong>Registered:</strong> {companyData.registrationDate ? new Date(companyData.registrationDate).toLocaleDateString() : "N/A"}</p>
              <p><strong>Status:</strong> <span className="text-green-600 font-semibold">Verified ✓</span></p>
            </div>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedPromo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-5 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Complete Payment</h3>
                <button onClick={() => setShowPaymentModal(false)} className="text-white text-2xl">×</button>
              </div>
            </div>
            <div className="p-6">
              <p className="text-center mb-2">Pay 100 ETB to make your promotion LIVE:</p>
              <p className="font-bold text-center text-lg mb-4">"{selectedPromo.title}"</p>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {paymentMethods.map((method) => (
                  <button key={method.id} onClick={() => setPaymentMethod(method.id)} className={`py-3 rounded-xl border-2 ${paymentMethod === method.id ? "border-purple-600 bg-purple-50" : "border-gray-200"}`}>
                    <span className="text-2xl block">{method.icon}</span>
                    <span className="text-xs">{method.name}</span>
                  </button>
                ))}
              </div>
              {paymentSuccess ? (
                <div className="bg-green-100 text-green-700 p-4 rounded-xl text-center">
                  ✅ Payment Successful! Your promotion is now LIVE on the platform.
                </div>
              ) : (
                <button onClick={handlePaymentSubmit} className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700">
                  Confirm Payment
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}