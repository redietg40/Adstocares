"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetch("/api/promotions")
      .then(res => res.json())
      .then(data => {
        setPromotions(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setPromotions([]);
        setLoading(false);
      });
  }, []);

  const filteredPromotions = promotions.filter(promo =>
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading promotions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-700 to-pink-600 text-white shadow-xl sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Ad2Care Promotions</h1>
              <p className="text-purple-100 text-sm">Discover products from verified companies</p>
            </div>
            <Link href="/" className="bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30">
              Home
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search promotions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
          />
        </div>

        {/* Stats */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-8 text-center text-gray-600">
          Showing {filteredPromotions.length} of {promotions.length} promotions
        </div>

        {/* Promotions Grid */}
        {filteredPromotions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📢</div>
            <h3 className="text-xl font-semibold text-gray-700">No promotions found</h3>
            <p className="text-gray-500">Check back later for new promotions.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPromotions.map((promo) => (
              <div key={promo.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden">
                <div className="h-40 bg-gradient-to-r from-purple-200 to-pink-200 flex items-center justify-center">
                  {promo.imageUrl ? (
                    <img src={promo.imageUrl} alt={promo.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-5xl">📢</span>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg text-gray-800">{promo.title}</h3>
                  <p className="text-gray-600 text-sm mt-1 line-clamp-2">{promo.description || "No description"}</p>
                  <p className="text-purple-600 text-xs mt-2">{promo.company?.companyName}</p>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => handleViewDetails(promo)} className="flex-1 bg-purple-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-purple-700">
                      View Details
                    </button>
                    {promo.link && (
                      <a href={promo.link} target="_blank" rel="noopener noreferrer" className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm text-center hover:bg-gray-300">
                        Visit
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedPromo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-purple-600 p-5 rounded-t-2xl flex justify-between items-center sticky top-0">
              <h3 className="text-xl font-bold text-white">{selectedPromo.title}</h3>
              <button onClick={() => setShowModal(false)} className="text-white text-2xl">×</button>
            </div>
            <div className="p-6">
              {selectedPromo.imageUrl && (
                <img src={selectedPromo.imageUrl} alt={selectedPromo.title} className="w-full h-48 object-cover rounded-lg mb-4" />
              )}
              <p className="text-sm text-gray-500">Company</p>
              <p className="font-semibold mb-3">{selectedPromo.company?.companyName}</p>
              <p className="text-sm text-gray-500">Description</p>
              <p className="text-gray-700 mb-3">{selectedPromo.description || "No description"}</p>
              {selectedPromo.link && (
                <>
                  <p className="text-sm text-gray-500">Link</p>
                  <a href={selectedPromo.link} target="_blank" rel="noopener noreferrer" className="text-purple-600 break-all mb-4 inline-block">
                    {selectedPromo.link}
                  </a>
                  <a href={selectedPromo.link} target="_blank" rel="noopener noreferrer" className="block w-full bg-purple-600 text-white text-center py-2 rounded-lg hover:bg-purple-700 mt-4">
                    Visit Promotion
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}