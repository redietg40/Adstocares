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
  
  // Viewer Modal State
  const [showViewersModal, setShowViewersModal] = useState(false);
  const [viewersList, setViewersList] = useState([]);
  const [loadingViewers, setLoadingViewers] = useState(false);

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
    router.push(`/company/checkout?promoId=${promo.id}`);
  };

  const handleViewViewers = async (promoId) => {
    setShowViewersModal(true);
    setLoadingViewers(true);
    setViewersList([]);
    try {
      const res = await fetch(`/api/company/promotions/${promoId}/viewers`);
      const data = await res.json();
      setViewersList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching viewers:", error);
    } finally {
      setLoadingViewers(false);
    }
  };

  const handleCustomDonation = () => {
    router.push(`/company/checkout?amount=500`); // Or dynamically from the amount input
  };

  const handleLogout = async () => {
    const { signOut } = await import("next-auth/react");
    await signOut({ redirect: false });
    router.push("/company/login");
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (companyData && !companyData.isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-amber-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="text-8xl mb-4">⏳</div>
          <h2 className="text-3xl font-bold text-amber-700 mb-4">Account Pending Verification</h2>
          <p className="text-lg text-gray-600 mb-6">Your company account is under review. You will be able to create promotions once verified.</p>
          <button onClick={() => router.push("/")} className="bg-amber-500 text-white px-6 py-2 rounded-lg text-lg">Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Welcome, {companyData?.companyName || "Company"}!</h2>
            <p className="text-gray-600 dark:text-gray-400 font-medium text-lg">Create promotions → Admin approves → Promotion goes LIVE for FREE → Optionally Boost to the top!</p>
          </div>
          <button onClick={handleLogout} className="bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 px-5 py-2 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-700 text-sm font-semibold transition-colors">
            Logout
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 text-center border border-transparent dark:border-gray-700 transition-colors">
            <p className="text-gray-500 dark:text-gray-400 text-base">Total</p>
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{promotions.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 text-center border border-transparent dark:border-gray-700 transition-colors">
            <p className="text-gray-500 dark:text-gray-400 text-base">Pending Approval</p>
            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-500">{promotions.filter(p => p.status === "pending").length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 text-center border border-gray-100 dark:border-gray-700 transition-colors">
            <p className="text-gray-500 dark:text-gray-400 text-base font-medium">Approved (Free Live)</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{promotions.filter(p => p.status === "approved").length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 text-center border border-gray-100 dark:border-gray-700 transition-colors">
            <p className="text-gray-500 dark:text-gray-400 text-base font-medium">Boosted / Sponsored</p>
            <p className="text-3xl font-bold text-amber-600 dark:text-amber-500">{promotions.filter(p => p.status === "live").length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
          <button onClick={() => { setActiveTab("promotions"); setShowAddForm(false); }} className={`px-6 py-3 font-semibold text-lg transition-colors ${activeTab === "promotions" ? "text-orange-600 dark:text-orange-500 border-b-2 border-orange-600 dark:border-orange-500" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"}`}>
            My Promotions
          </button>
          <button onClick={() => { setActiveTab("payment"); setShowAddForm(false); }} className={`px-6 py-3 font-semibold text-lg transition-colors ${activeTab === "payment" ? "text-amber-600 dark:text-amber-500 border-b-2 border-amber-600 dark:border-amber-500" : "text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400"}`}>
            Boosts & Donations
          </button>
          <button onClick={() => { setActiveTab("profile"); setShowAddForm(false); }} className={`px-6 py-3 font-semibold text-lg transition-colors ${activeTab === "profile" ? "text-orange-600 dark:text-orange-500 border-b-2 border-orange-600 dark:border-orange-500" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"}`}>
            Company Profile
          </button>
        </div>

        {/* Promotions Tab */}
        {activeTab === "promotions" && (
          <>
            <div className="mb-6">
              <button onClick={() => setShowAddForm(!showAddForm)} className="bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold text-lg hover:bg-orange-700">
                {showAddForm ? "− Cancel" : "+ Create New Promotion"}
              </button>
            </div>

            {showAddForm && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 mb-6 transition-colors">
                <h3 className="text-xl font-semibold mb-4 dark:text-white">Create New Promotion</h3>
                <form onSubmit={handleAddPromotion} className="space-y-4">
                  <input type="text" placeholder="Title *" required value={newPromotion.title} onChange={(e) => setNewPromotion({...newPromotion, title: e.target.value})} className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg text-lg dark:bg-gray-700 dark:text-white transition-colors" />
                  <textarea rows="3" placeholder="Description" value={newPromotion.description} onChange={(e) => setNewPromotion({...newPromotion, description: e.target.value})} className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg text-lg dark:bg-gray-700 dark:text-white transition-colors" />
                  <input type="url" placeholder="Link (URL)" value={newPromotion.link} onChange={(e) => setNewPromotion({...newPromotion, link: e.target.value})} className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg text-lg dark:bg-gray-700 dark:text-white transition-colors" />
                  <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 p-4 rounded-xl transition-colors">
                    <p className="text-base text-blue-800 dark:text-blue-300 font-medium">📋 After submission, the admin will review your product. Once approved, it goes LIVE for FREE!</p>
                  </div>
                  <button type="submit" disabled={submitting} className="w-full bg-orange-600 text-white py-2 rounded-xl text-lg hover:bg-orange-700 transition-colors">{submitting ? "Creating..." : "Create Promotion"}</button>
                </form>
              </div>
            )}

            {/* Promotions List */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden transition-colors">
              <div className="px-6 py-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 transition-colors">
                <h2 className="text-2xl font-semibold dark:text-white">Your Promotions</h2>
                <p className="text-base text-gray-500 dark:text-gray-400">Track your promotion status</p>
              </div>
              {promotions.length === 0 ? (
                <div className="p-12 text-center text-gray-500 dark:text-gray-400 text-lg">No promotions yet. Click "Create New Promotion" to get started.</div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {promotions.map((promo) => (
                    <div key={promo.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-xl dark:text-white">{promo.title}</h3>
                          <p className="text-gray-600 dark:text-gray-300 text-base mt-1">{promo.description}</p>
                          {promo.link && <a href={promo.link} target="_blank" className="text-orange-600 dark:text-orange-400 text-base block mt-1">🔗 {promo.link}</a>}
                          <div className="flex items-center gap-3 mt-2">
                            {promo.status === "pending" && (
                              <span className="px-2 py-0.5 text-sm rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">⏳ Awaiting Admin Approval</span>
                            )}
                            {promo.status === "approved" && (
                              <span className="px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">✅ LIVE (Free Tier)</span>
                            )}
                            {promo.status === "live" && (
                              <span className="px-3 py-1 text-sm font-semibold rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800">🚀 Sponsored / Boosted</span>
                            )}
                            <button 
                              onClick={() => handleViewViewers(promo.id)}
                              className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                            >
                              👁️ {promo.views || 0} views
                            </button>
                            <span className="text-sm text-gray-400 dark:text-gray-500">🖱️ {promo.clicks || 0} clicks</span>
                          </div>
                        </div>
                        {promo.status === "approved" && (
                          <div className="flex flex-col gap-2">
                            <button onClick={() => handleMakePayment(promo)} className="bg-orange-500 text-white px-4 py-2 rounded-xl text-base font-bold shadow-sm hover:shadow-md hover:scale-105 transition-all">
                              🚀 Boost to Top
                            </button>
                            <button onClick={() => handleMakePayment(promo)} className="bg-white dark:bg-gray-800 border-2 border-orange-500 text-orange-600 dark:text-orange-400 px-4 py-2 rounded-xl text-base font-bold shadow-sm hover:bg-orange-50 dark:hover:bg-gray-700 hover:scale-105 transition-all">
                              💖 Donate & Get Badge
                            </button>
                          </div>
                        )}
                        {promo.status === "live" && (
                          <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800 px-4 py-2 rounded-xl text-base font-bold">🚀 Boosted Active</span>
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
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden transition-colors">
            <div className="px-6 py-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 transition-colors">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Boosts & Donations</h2>
              <p className="text-base text-gray-500 dark:text-gray-400 font-medium">Pay flexibly to sponsor your product or donate to the Pad Fund</p>
            </div>
            <div className="p-6">
              <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl transition-colors">
                <h3 className="font-bold text-orange-900 dark:text-orange-300 mb-1 text-xl">Why Donate? 💖</h3>
                <p className="text-base text-orange-800 dark:text-orange-200 leading-relaxed">Donating to the Sanitary Pad Fund earns you a <span className="font-bold text-amber-600 dark:text-amber-400">Gold Heart "Karma Badge"</span> on your product. This badge is proven to increase user trust and upvotes by 300%!</p>
              </div>
              <div className="mb-6">
                <label className="block text-base font-bold text-gray-700 mb-2">Amount to Pay (Flexible)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 font-bold text-gray-500">ETB</span>
                  <input type="number" placeholder="Enter amount" className="w-full pl-14 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-0 outline-none text-xl font-bold transition-colors" defaultValue={500} id="customAmount" />
                </div>
              </div>

              <button onClick={() => {
                const amt = document.getElementById("customAmount").value || 500;
                router.push(`/company/checkout?amount=${amt}`);
              }} className={`w-full text-white bg-orange-600 hover:bg-orange-700 py-4 rounded-xl font-bold text-xl shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl`}>
                Configure Payment Plan
              </button>

              <div className="mt-8 p-5 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 rounded-2xl transition-colors">
                <h3 className="font-bold text-base mb-3 text-gray-800 dark:text-gray-200 uppercase tracking-wider">How Your Payment Helps</h3>
                <div className="space-y-2 text-base">
                  <div className="flex justify-between items-center text-gray-600 dark:text-gray-400"><span>💼 Platform Server Costs</span><span className="font-semibold bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-md text-sm">Flexible</span></div>
                  <div className="flex justify-between items-center font-bold text-amber-600 dark:text-amber-400 text-lg"><span>🎓 Sanitary Pads Fund</span><span className="bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded-md text-sm border border-amber-200 dark:border-amber-800">Flexible</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Profile Tab - Company Name Displayed Here */}
        {activeTab === "profile" && companyData && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 transition-colors">
            <h2 className="text-2xl font-semibold mb-4 dark:text-white">Company Profile</h2>
            <div className="space-y-3 text-lg text-gray-700 dark:text-gray-300">
              <p><strong className="text-gray-900 dark:text-white">Company Name:</strong> {companyData.companyName || "N/A"}</p>
              <p><strong className="text-gray-900 dark:text-white">Email:</strong> {session?.user?.email || companyData.email || "N/A"}</p>
              <p><strong className="text-gray-900 dark:text-white">License Number:</strong> {companyData.companyLicenseNumber || "N/A"}</p>
              <p><strong className="text-gray-900 dark:text-white">Registered:</strong> {companyData.registrationDate ? new Date(companyData.registrationDate).toLocaleDateString() : "N/A"}</p>
              <p><strong className="text-gray-900 dark:text-white">Status:</strong> <span className="text-green-600 dark:text-green-400 font-semibold">Verified ✓</span></p>
            </div>
          </div>
        )}

        {/* Viewers Modal */}
        {showViewersModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden transition-colors">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Users Who Viewed</h3>
                <button onClick={() => setShowViewersModal(false)} className="text-white text-2xl hover:text-gray-200">&times;</button>
              </div>
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                {loadingViewers ? (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : viewersList.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No registered users have viewed this yet, or views were anonymous.</p>
                ) : (
                  <div className="space-y-4">
                    {viewersList.map((viewer) => (
                      <div key={viewer.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold">
                          {viewer.user?.companyName?.[0]?.toUpperCase() || viewer.user?.email?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {viewer.user?.companyName || viewer.user?.email?.split('@')[0]}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(viewer.viewedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 text-right">
                <button onClick={() => setShowViewersModal(false)} className="px-5 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 font-medium transition-colors">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}