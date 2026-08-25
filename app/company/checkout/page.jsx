"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const promoId = searchParams.get("promoId");
  const amount = searchParams.get("amount") || 500;

  const [loading, setLoading] = useState(true);
  const [promoTitle, setPromoTitle] = useState("Custom Donation");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/company/login");
    }
    
    // Fetch promotion details if promoId is provided
    if (promoId && session) {
      fetchPromoDetails(promoId);
    } else if (session) {
      setLoading(false);
    }
  }, [status, session, promoId]);

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
    if (paymentMethod === "card" && (!cardNumber || !expiry || !cvc)) {
      alert("Please fill in all card details.");
      return;
    }
    if (paymentMethod !== "card" && !phoneNumber) {
      alert("Please enter your account or phone number.");
      return;
    }
    setIsProcessing(true);

    try {
      const res = await fetch(`/api/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promotionId: promoId,
          amount: amount,
          paymentMethod: paymentMethod,
          paymentAccount: paymentMethod === "card" ? cardNumber : phoneNumber,
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
          
          <h1 className="text-3xl font-bold mb-8 tracking-tight">Configure your plan</h1>
          
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-4">Payment method</h2>
            
            <div className="flex gap-3 mb-6">
              <button 
                onClick={() => setPaymentMethod("card")} 
                className={`flex-1 py-3 px-4 rounded-xl border flex items-center justify-center gap-2 transition-all ${paymentMethod === 'card' ? 'bg-[#2a2a2a] border-white text-white' : 'border-gray-800 text-gray-400 hover:border-gray-600'}`}
              >
                💳 Card
              </button>
              <button 
                onClick={() => setPaymentMethod("telebirr")} 
                className={`flex-1 py-3 px-4 rounded-xl border flex items-center justify-center gap-2 transition-all ${paymentMethod === 'telebirr' ? 'bg-[#2a2a2a] border-green-500 text-white' : 'border-gray-800 text-gray-400 hover:border-gray-600'}`}
              >
                📱 TeleBirr
              </button>
              <button 
                onClick={() => setPaymentMethod("cbe")} 
                className={`flex-1 py-3 px-4 rounded-xl border flex items-center justify-center gap-2 transition-all ${paymentMethod === 'cbe' ? 'bg-[#2a2a2a] border-blue-500 text-white' : 'border-gray-800 text-gray-400 hover:border-gray-600'}`}
              >
                🏦 CBE Birr
              </button>
            </div>

            <form onSubmit={handleSubscribe} className="space-y-4">
              {paymentMethod === "card" ? (
                <>
                  <div className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800 focus-within:border-gray-500 transition-colors flex items-center">
                    <input 
                      type="text" 
                      placeholder="Card number" 
                      className="bg-transparent w-full outline-none text-gray-200 placeholder-gray-500 text-lg"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      maxLength={19}
                    />
                    <div className="flex gap-2">
                      <div className="w-8 h-5 bg-blue-600 rounded flex items-center justify-center text-[10px] font-bold">VISA</div>
                      <div className="w-8 h-5 bg-red-500 rounded flex items-center justify-center text-[10px] font-bold relative overflow-hidden">
                        <div className="w-4 h-4 rounded-full bg-yellow-400 absolute left-1"></div>
                        <div className="w-4 h-4 rounded-full bg-orange-500 absolute right-1 mix-blend-multiply"></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800 focus-within:border-gray-500 transition-colors flex-1">
                      <input 
                        type="text" 
                        placeholder="Expiration date" 
                        className="bg-transparent w-full outline-none text-gray-200 placeholder-gray-500 text-lg"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        maxLength={5}
                      />
                    </div>
                    <div className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800 focus-within:border-gray-500 transition-colors flex-1 relative group">
                      <input 
                        type="text" 
                        placeholder="Security code" 
                        className="bg-transparent w-full outline-none text-gray-200 placeholder-gray-500 text-lg"
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value)}
                        maxLength={4}
                      />
                      <span className="text-xs text-gray-500 absolute bottom-1 left-4">CVC</span>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-50">
                        💳
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800 focus-within:border-gray-500 transition-colors flex items-center">
                  <input 
                    type="text" 
                    placeholder={paymentMethod === 'telebirr' ? "+251 9..." : "1000..."}
                    className="bg-transparent w-full outline-none text-gray-200 placeholder-gray-500 text-lg"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                  <div className="text-gray-500 text-sm font-medium">
                    {paymentMethod === 'telebirr' ? "Phone Number" : "Account Number"}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 mt-4">
                <input type="checkbox" id="save-card" className="w-4 h-4 rounded border-gray-700 bg-[#1a1a1a] accent-white" />
                <label htmlFor="save-card" className="text-sm text-gray-400">Save payment details to Ad2Care for future purchases</label>
              </div>

              {/* Hidden submit button to allow Enter key to submit */}
              <button type="submit" className="hidden">Submit</button>
            </form>
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
                Boost "{promoTitle}" to the top of the feed
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
                <span>ETB {(amount * 0.85).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>VAT (15%)</span>
                <span>ETB {(amount * 0.15).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-white pt-2">
                <span>Due today</span>
                <span>ETB {Number(amount).toFixed(2)}</span>
              </div>
            </div>

            <button 
              onClick={handleSubscribe} 
              disabled={isProcessing}
              className={`w-full bg-white text-black font-semibold rounded-full py-3 mt-8 hover:bg-gray-200 transition-colors text-lg ${isProcessing ? 'opacity-70 cursor-wait' : ''}`}
            >
              {isProcessing ? "Processing..." : "Subscribe"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
