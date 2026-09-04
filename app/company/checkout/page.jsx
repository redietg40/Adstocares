"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Image from "next/image";

function CheckoutContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const promoId = searchParams.get("promoId");
  const amount = searchParams.get("amount") || 500;

  const [loading, setLoading] = useState(true);
  const [promoTitle, setPromoTitle] = useState("Custom Donation");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/company/login");
    }
    
    if (promoId && session) {
      fetchPromoDetails(promoId);
    } else if (session) {
      setLoading(false);
    }
  }, [status, session, promoId, router]);

  const fetchPromoDetails = async (id) => {
    try {
      const res = await fetch("/api/company/promotions");
      const data = await res.json();
      const promo = data.find((p) => p.id === id);
      if (promo) {
        setPromoTitle(promo.title);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const res = await fetch(`/api/payments/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promotionId: promoId,
          amount: amount,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.checkout_url) {
          window.location.href = data.checkout_url;
        } else {
          alert("Error: Missing checkout URL from server.");
          setIsProcessing(false);
        }
      } else {
        const data = await res.json();
        alert(`Payment failed: ${data.error}`);
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Network error.");
      setIsProcessing(false);
    }
  };

  if (loading || status === "loading") {
    return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex justify-center p-8 font-sans">
      <div className="max-w-5xl w-full flex flex-col md:flex-row gap-12 mt-12">
        
        {/* Left Column - Payment Details */}
        <div className="flex-1">
          <button onClick={() => router.push("/company/dashboard")} className="text-gray-400 hover:text-white flex items-center gap-2 mb-8 transition-colors">
            <span className="text-xl">‹</span> Back to Dashboard
          </button>
          
          <h1 className="text-3xl font-bold mb-8 tracking-tight">Checkout securely</h1>
          
          <div className="bg-[#1a1a1a] rounded-2xl p-8 border border-gray-800">
            <h2 className="text-xl font-medium mb-4">Pay with Chapa</h2>
            <p className="text-gray-400 mb-8 leading-relaxed">
              You will be redirected to Chapa's secure checkout page to complete your payment using Telebirr, CBE Birr, M-PESA, or your bank card.
            </p>

            <div className="flex gap-4 mb-8 flex-wrap">
               <div className="px-4 py-2 bg-[#2a2a2a] rounded-lg text-sm text-gray-300 font-medium">💳 Cards</div>
               <div className="px-4 py-2 bg-[#2a2a2a] rounded-lg text-sm text-green-400 font-medium">📱 TeleBirr</div>
               <div className="px-4 py-2 bg-[#2a2a2a] rounded-lg text-sm text-blue-400 font-medium">🏦 CBE Birr</div>
            </div>

            <div className="flex items-center gap-3 text-sm text-gray-500 bg-[#0a0a0a] p-4 rounded-xl border border-gray-800">
               <span className="text-xl">🔒</span> Payments are securely processed by Chapa. We do not store your payment information.
            </div>
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div className="w-full md:w-[400px]">
          <div className="bg-[#212121] rounded-3xl p-8 sticky top-12 border border-gray-800/50 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Ad2Care Boost Plan</h2>
            
            <p className="text-sm text-gray-400 mb-3">Top features</p>
            <ul className="space-y-4 mb-8 text-gray-300 text-sm">
              <li className="flex gap-3 items-start">
                <span className="text-white">⚡</span> 
                Smarter, faster responses and higher visibility
              </li>
              <li className="flex gap-3 items-start">
                <span className="text-white">🚀</span> 
                Boost &quot;{promoTitle}&quot; to the top of the feed
              </li>
              <li className="flex gap-3 items-start">
                <span className="text-white">💖</span> 
                Earn a Gold Karma Badge on your product
              </li>
              <li className="flex gap-3 items-start">
                <span className="text-white">🩸</span> 
                Donate directly to the Sanitary Pad Fund
              </li>
            </ul>

            <div className="border-t border-gray-800 pt-6 space-y-3 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span>ETB {(Number(amount) * 0.85).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>VAT (15%)</span>
                <span>ETB {(Number(amount) * 0.15).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-white pt-2">
                <span>Due today</span>
                <span>ETB {Number(amount).toFixed(2)}</span>
              </div>
            </div>

            <button 
              onClick={handleSubscribe} 
              disabled={isProcessing}
              className={`w-full bg-white text-black font-semibold rounded-full py-3 mt-8 hover:bg-gray-200 transition-colors text-lg flex items-center justify-center gap-2 ${isProcessing ? 'opacity-70 cursor-wait' : ''}`}
            >
              {isProcessing ? "Connecting to Chapa..." : "Proceed to Payment"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">Loading checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
