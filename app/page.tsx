"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function HomePage() {
  const [showPolicy, setShowPolicy] = useState(false);
  const [promotions, setPromotions] = useState([]);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState(null);

  // Fetch promotions when component mounts (for preview)
  useEffect(() => {
    fetch("/api/promotions")
      .then(res => res.json())
      .then(data => {
        const approvedPromos = Array.isArray(data) ? data.filter(p => p.status === "approved" || p.status === "live") : [];
        setPromotions(approvedPromos.slice(0, 3)); // Show only 3 on home page
      })
      .catch(err => console.error("Error fetching promotions:", err));
  }, []);

  const handleViewPromoDetails = (promo) => {
    setSelectedPromo(promo);
    setShowPromoModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              {/* Logo Image - Increased size */}
              <Image
                src="/logoswomen.jpg"
                alt="Ad2Care Logo"
                width={56}
                height={56}
                className="rounded-xl"
                priority
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              {/* Fallback div if image doesn't load */}
              <div className="w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl items-center justify-center hidden">
                <span className="text-white font-bold text-xl">A2C</span>
              </div>
              <div>
                <span className="font-bold text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Ad2Care
                </span>
                <p className="text-sm text-gray-500">Promote • Empower</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/promotions" className="text-gray-700 hover:text-purple-600 transition">
                Promotions
              </Link>
              <Link href="/company/login" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition">
                Login
              </Link>
              <Link href="/company/register" className="border border-purple-600 text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-50 transition">
                Register
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center">
            {/* Large Logo in Hero Section */}
            <div className="flex justify-center mb-6">
              <Image
                src="/logo.png"
                alt="Ad2Care Logo"
                width={120}
                height={120}
                className="rounded-2xl shadow-lg"
                priority
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="w-[120px] h-[120px] bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl items-center justify-center hidden shadow-lg">
                <span className="text-white font-bold text-4xl">A2C</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
              Promote Products.
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                {" "}Empower Women.
              </span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Join Ad2Care to promote your products and support women's education.
              Every promotion helps fund sanitary pads for students in need.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/company/register" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition transform hover:scale-105">
                Get Started
              </Link>
              <Link href="/promotions"  className="border-2 border-purple-600 text-purple-600 px-8 py-3 rounded-xl font-semibold hover:bg-purple-50 transition">
                View Promotions
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Goals Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Our Platform Goals</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Empower Women</h3>
              <p className="text-gray-600">Support women's education by funding sanitary pads for students in need.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Boost Businesses</h3>
              <p className="text-gray-600">Help companies reach their target audience through effective promotions.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌍</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Create Impact</h3>
              <p className="text-gray-600">Build a sustainable ecosystem where businesses and communities grow together.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">1</div>
              <h3 className="font-semibold mb-2">Company Registers</h3>
              <p className="text-sm text-gray-600">Sign up and get verified</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">2</div>
              <h3 className="font-semibold mb-2">Create Promotion</h3>
              <p className="text-sm text-gray-600">Submit your promotion</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">3</div>
              <h3 className="font-semibold mb-2">Admin Approves</h3>
              <p className="text-sm text-gray-600">Content is reviewed</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">4</div>
              <h3 className="font-semibold mb-2">Make Payment</h3>
              <p className="text-sm text-gray-600">Pay to go LIVE</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Promotions Preview */}
      {promotions.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Featured Promotions</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {promotions.map((promo) => (
                <div key={promo.id} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 shadow-md hover:shadow-xl transition">
                  <h3 className="font-bold text-lg text-gray-800">{promo.title}</h3>
                  <p className="text-gray-600 text-sm mt-2 line-clamp-2">{promo.description}</p>
                  <p className="text-purple-600 text-xs mt-2">🏢 {promo.company?.companyName}</p>
                  <button
                    onClick={() => handleViewPromoDetails(promo)}
                    className="mt-4 text-purple-600 font-semibold text-sm hover:text-purple-700"
                  >
                    View Details →
                  </button>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/promotions" className="text-purple-600 hover:text-purple-700 font-semibold">
                View All Promotions →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Platform Policy Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Platform Policy</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">📋 Content Guidelines</h3>
              <ul className="space-y-2 text-gray-600">
                <li>✓ No illegal or harmful content</li>
                <li>✓ No false or misleading information</li>
                <li>✓ Respectful and professional language</li>
                <li>✓ Accurate product representation</li>
                <li>✓ No prohibited items or services</li>
              </ul>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">💰 Payment & Fees</h3>
              <ul className="space-y-2 text-gray-600">
                <li>✓ 100 ETB per promotion</li>
                <li>✓ 60% platform fee (maintenance & development)</li>
                <li>✓ 40% goes to sanitary pads fund</li>
                <li>✓ Payment via TeleBirr, CBE, Abyssinia Bank</li>
                <li>✓ 100% transparency in fund allocation</li>
              </ul>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">🛡️ Company Verification</h3>
              <ul className="space-y-2 text-gray-600">
                <li>✓ Valid business license required</li>
                <li>✓ Tax ID verification</li>
                <li>✓ Manual admin review process</li>
                <li>✓ Regular compliance checks</li>
                <li>✓ Secure data handling</li>
              </ul>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">🎓 Social Impact</h3>
              <ul className="space-y-2 text-gray-600">
                <li>✓ 40% of fees fund sanitary pads</li>
                <li>✓ Partner with local schools</li>
                <li>✓ Monthly donation reports</li>
                <li>✓ Support girls' education</li>
                <li>✓ Transparent impact tracking</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">Our Impact So Far</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-bold text-white mb-2">120+</div>
              <p className="text-purple-100">Pads Donated</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">5+</div>
              <p className="text-purple-100">Companies Joined</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">200+</div>
              <p className="text-purple-100">Students Supported</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="border rounded-xl p-4 hover:bg-gray-50 transition">
              <h3 className="font-semibold text-gray-800">How do I register my company?</h3>
              <p className="text-gray-600 text-sm mt-1">Click "Register" on the homepage, fill out the form, upload your business license, and wait for admin approval.</p>
            </div>
            <div className="border rounded-xl p-4 hover:bg-gray-50 transition">
              <h3 className="font-semibold text-gray-800">How much does it cost to promote?</h3>
              <p className="text-gray-600 text-sm mt-1">100 ETB per promotion. 60% covers platform costs, 40% funds sanitary pads for students.</p>
            </div>
            <div className="border rounded-xl p-4 hover:bg-gray-50 transition">
              <h3 className="font-semibold text-gray-800">How long does verification take?</h3>
              <p className="text-gray-600 text-sm mt-1">Admin typically reviews and approves companies within 24-48 hours.</p>
            </div>
            <div className="border rounded-xl p-4 hover:bg-gray-50 transition">
              <h3 className="font-semibold text-gray-800">What payment methods are accepted?</h3>
              <p className="text-gray-600 text-sm mt-1">TeleBirr, CBE Birr, and Abyssinia Bank. More options coming soon.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Make an Impact?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join our platform today and start promoting your products while supporting women's education.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/company/register" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition">
              Register Your Company
            </Link>
            <Link href="/company/login" className="border-2 border-purple-600 text-purple-600 px-8 py-3 rounded-xl font-semibold hover:bg-purple-50 transition">
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                {/* Logo in footer - Larger size */}
                <Image
                  src="/logo.png"
                  alt="Ad2Care Logo"
                  width={48}
                  height={48}
                  className="rounded-lg"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg items-center justify-center hidden">
                  <span className="text-white font-bold text-base">A2C</span>
                </div>
                <span className="font-bold text-xl">Ad2Care</span>
              </div>
              <p className="text-gray-400 text-sm">Promote Products. Empower Women.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/" className="hover:text-white transition">Home</Link></li>
                <li><Link href="/promotions" className="hover:text-white transition">Promotions</Link></li>
                <li><Link href="/company/register" className="hover:text-white transition">Register</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Policies</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><button onClick={() => setShowPolicy(true)} className="hover:text-white transition">Terms of Service</button></li>
                <li><button className="hover:text-white transition">Privacy Policy</button></li>
                <li><button className="hover:text-white transition">Refund Policy</button></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <p className="text-gray-400 text-sm">Email: info@ad2care.com</p>
              <div className="flex gap-4 mt-4">
                <span className="text-gray-400 hover:text-white cursor-pointer">📘</span>
                <span className="text-gray-400 hover:text-white cursor-pointer">🐦</span>
                <span className="text-gray-400 hover:text-white cursor-pointer">📷</span>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
            © 2024 Ad2Care. All rights reserved. | Empowering women through education
          </div>
        </div>
      </footer>

      {/* Policy Modal */}
      {showPolicy && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-5 rounded-t-2xl flex justify-between items-center sticky top-0">
              <h3 className="text-xl font-bold text-white">Terms of Service</h3>
              <button onClick={() => setShowPolicy(false)} className="text-white text-2xl">×</button>
            </div>
            <div className="p-6 space-y-4">
              <h4 className="font-semibold text-lg">1. Platform Usage</h4>
              <p className="text-gray-600 text-sm">Ad2Care is a platform connecting businesses with customers through promotions while supporting women's education.</p>

              <h4 className="font-semibold text-lg">2. Company Responsibilities</h4>
              <p className="text-gray-600 text-sm">Companies must provide accurate information, comply with content guidelines, and ensure promotions are legal and appropriate.</p>

              <h4 className="font-semibold text-lg">3. Payment Terms</h4>
              <p className="text-gray-600 text-sm">100 ETB fee per promotion. 60% platform fee, 40% donated to sanitary pads fund. No refunds after promotion goes live.</p>

              <h4 className="font-semibold text-lg">4. Content Moderation</h4>
              <p className="text-gray-600 text-sm">All promotions are reviewed by admin before approval. We reserve the right to reject any inappropriate content.</p>

              <h4 className="font-semibold text-lg">5. Privacy</h4>
              <p className="text-gray-600 text-sm">We protect your data and never share with third parties without consent.</p>

              <div className="bg-gray-50 p-4 rounded-lg mt-4">
                <p className="text-sm text-gray-500">For questions, contact: legal@ad2care.com</p>
              </div>
            </div>
            <div className="p-5 border-t flex justify-end">
              <button onClick={() => setShowPolicy(false)} className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Promotion Details Modal */}
      {showPromoModal && selectedPromo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-5 rounded-t-2xl flex justify-between items-center sticky top-0">
              <h3 className="text-xl font-bold text-white">{selectedPromo.title}</h3>
              <button onClick={() => setShowPromoModal(false)} className="text-white text-2xl">×</button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-500">Promoted by</p>
              <p className="font-semibold mb-3">{selectedPromo.company?.companyName}</p>
              <p className="text-sm text-gray-500">Description</p>
              <p className="text-gray-700 mb-4">{selectedPromo.description || "No description available"}</p>
              {selectedPromo.link && (
                <a href={selectedPromo.link} target="_blank" rel="noopener noreferrer" className="block w-full bg-purple-600 text-white text-center py-2 rounded-lg hover:bg-purple-700">
                  Visit Promotion →
                </a>
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