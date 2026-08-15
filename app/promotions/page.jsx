"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUp, MessageCircle, ExternalLink } from "lucide-react";

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetch("/api/promotions")
      .then((res) => res.json())
      .then((data) => {
        setPromotions(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setPromotions([]);
        setLoading(false);
      });
  }, []);

  const filteredPromotions = promotions.filter(
    (promo) =>
      promo.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promo.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promo.company?.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (promo) => {
    setSelectedPromo(promo);
    setShowModal(true);
    // Track view
    fetch(`/api/promotions/${promo.id}/view`, { method: "POST" }).catch(console.error);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading promotions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F9] font-sans text-gray-900">
      {/* Navbar (Simplified) */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#FF6154] text-white rounded-full flex items-center justify-center font-bold text-xl">
              P
            </div>
            <h1 className="text-xl font-bold text-gray-800">Ad2Care</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 px-4 py-2 bg-gray-100 border-none rounded-full text-sm focus:ring-2 focus:ring-[#FF6154] outline-none"
              />
            </div>
            <Link
              href="/login"
              className="text-gray-600 hover:text-gray-900 text-sm font-medium"
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        
        {/* HERO BANNER FOR COMPANIES */}
        <div className="bg-gradient-to-r from-orange-50 to-[#FFF0ED] border border-[#FFD5CC] rounded-xl p-8 mb-10 flex flex-col md:flex-row items-center justify-between shadow-sm">
          <div className="md:w-2/3 mb-6 md:mb-0">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Reach new customers while changing lives.
            </h2>
            <p className="text-gray-600 text-lg">
              Are you a seller? Promote your product on Ad2Care today. Every engagement helps us donate hygiene pads to those in need.
            </p>
            <div className="mt-4 flex items-center text-sm font-semibold text-[#FF6154]">
              <span className="mr-2">🌟</span> 1,204 Pads Distributed this month!
            </div>
          </div>
          <div className="md:w-1/3 flex justify-end">
            <Link
              href="/company/register"
              className="bg-[#FF6154] text-white px-6 py-3 rounded-md font-semibold shadow-md hover:bg-[#e04f43] transition-colors text-center w-full md:w-auto whitespace-nowrap"
            >
              Register Your Company Free
            </Link>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Main Feed */}
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-6 text-gray-800">Top Products Today</h3>

            {filteredPromotions.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <div className="text-4xl mb-4">📢</div>
                <h3 className="text-lg font-medium text-gray-700">No products found</h3>
                <p className="text-gray-500 mt-1">Check back later or register yours!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filteredPromotions.map((promo, index) => (
                  <div
                    key={promo.id}
                    onClick={() => handleViewDetails(promo)}
                    className="bg-white p-4 rounded-lg border border-gray-100 hover:border-gray-300 shadow-sm hover:shadow-md transition cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center flex-1 min-w-0 pr-4">
                      {/* Thumbnail */}
                      <div className="w-14 h-14 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 mr-4 border border-gray-200">
                        {promo.imageUrl ? (
                          <img
                            src={promo.imageUrl}
                            alt={promo.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl bg-gradient-to-br from-orange-100 to-red-100 text-orange-500 font-bold">
                            {promo.title ? promo.title.charAt(0) : "P"}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center text-sm font-semibold text-gray-900 group-hover:text-[#FF6154] transition-colors">
                          <span className="mr-1">{index + 1}.</span> {promo.title}
                        </div>
                        <p className="text-gray-500 text-sm mt-1 truncate">
                          {promo.description || "A new amazing product from " + promo.company?.companyName}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-sm">
                            {promo.company?.companyName || "Company"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right side stats/buttons */}
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="hidden md:flex flex-col items-center justify-center text-gray-500 hover:text-gray-900 transition-colors">
                        <MessageCircle size={18} />
                        <span className="text-xs font-medium mt-1">0</span>
                      </div>
                      <button className="flex flex-col items-center justify-center w-14 h-14 bg-white border border-gray-200 rounded-md hover:border-gray-400 transition-colors text-gray-700">
                        <ArrowUp size={16} className="mb-0.5 font-bold" />
                        <span className="text-xs font-bold">{promo.views || Math.floor(Math.random() * 100) + 10}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Sidebar (Optional extra details) */}
          <div className="hidden lg:block w-72 flex-shrink-0">
             <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm sticky top-24">
               <h4 className="font-bold text-gray-900 mb-3">About Ad2Care</h4>
               <p className="text-sm text-gray-600 mb-4">
                 Ad2Care is the place to discover the latest products while making a real-world impact.
               </p>
               <div className="pt-4 border-t border-gray-100">
                 <div className="flex justify-between items-center text-sm mb-2">
                   <span className="text-gray-500">Products</span>
                   <span className="font-semibold text-gray-800">{promotions.length}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-gray-500">Pads Given</span>
                   <span className="font-semibold text-green-600">1,204</span>
                 </div>
               </div>
             </div>
          </div>

        </div>
      </main>

      {/* Product Detail Modal */}
      {showModal && selectedPromo && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                    {selectedPromo.imageUrl ? (
                      <img src={selectedPromo.imageUrl} alt={selectedPromo.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl bg-orange-100 text-orange-500 font-bold">
                        {selectedPromo.title ? selectedPromo.title.charAt(0) : "P"}
                      </div>
                    )}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedPromo.title}</h3>
                  <p className="text-gray-500 mt-1">{selectedPromo.description?.slice(0, 50)}...</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-700 text-3xl font-light">×</button>
            </div>
            
            <div className="p-6 flex-1">
              {selectedPromo.imageUrl && (
                <img src={selectedPromo.imageUrl} alt={selectedPromo.title} className="w-full h-64 object-cover rounded-lg mb-6 border border-gray-200" />
              )}
              
              <div className="flex justify-between items-start mb-6">
                 <div>
                    <h4 className="font-semibold text-gray-900">Maker</h4>
                    <p className="text-gray-600">{selectedPromo.company?.companyName || "Unknown Company"}</p>
                 </div>
                 <button className="flex items-center gap-2 bg-[#FF6154] text-white px-6 py-3 rounded-md font-semibold hover:bg-[#e04f43] transition">
                    UPVOTE <span className="opacity-80">({selectedPromo.views || 42})</span>
                 </button>
              </div>

              <h4 className="font-semibold text-gray-900 mt-4 mb-2">About this product</h4>
              <p className="text-gray-700 leading-relaxed mb-6 whitespace-pre-wrap">
                {selectedPromo.description || "No extensive description provided by the maker."}
              </p>

              {selectedPromo.link && (
                <div className="pt-6 border-t border-gray-100">
                  <a 
                    href={selectedPromo.link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center justify-center gap-2 w-full bg-gray-100 text-gray-800 font-semibold text-center py-4 rounded-lg hover:bg-gray-200 transition"
                  >
                    Visit Website <ExternalLink size={18} />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}