"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUp, MessageCircle, ExternalLink, Smile } from "lucide-react";
import { useSession } from "next-auth/react";
import EmojiPicker from "emoji-picker-react";

function getRelativeTime(dateInput, elapsedSeconds = 0) {
  if (!dateInput) return "Just now";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "Just now";

  const now = new Date();
  let diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  // Fix server/client clock skew (if server is in the future, assume 0)
  if (diffInSeconds < 0) diffInSeconds = 0;
  
  diffInSeconds += elapsedSeconds; // add local tick time

  if (diffInSeconds < 10) return "Just now";
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths} mo ago`;

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears}y ago`;
}

function RelativeTime({ dateInput }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed((prev) => prev + 10);
    }, 10000); // tick 10 seconds
    return () => clearInterval(timer);
  }, []);

  return <>{getRelativeTime(dateInput, elapsed)}</>;
}

export default function PromotionsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [localUpvotes, setLocalUpvotes] = useState({});
  const [userUpvotedProducts, setUserUpvotedProducts] = useState({});
  const [commentText, setCommentText] = useState("");
  const [localComments, setLocalComments] = useState({});
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalConfig, setAuthModalConfig] = useState({ title: "", action: "" });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [toastMessage, setToastMessage] = useState("");

  const handleUpvote = async (e, promo) => {
    e.stopPropagation();
    if (!session) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`/api/promotions/${promo.id}/upvote`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        setToastMessage(data.error || "Could not process upvote");
        setTimeout(() => setToastMessage(""), 3000);
        return;
      }

      // Update state with persistent DB counts
      setUserUpvotedProducts((prev) => ({
        ...prev,
        [promo.id]: data.hasUpvoted,
      }));

      setLocalUpvotes((prev) => ({
        ...prev,
        [promo.id]: data.totalUpvotes,
      }));

      if (!data.hasUpvoted) {
        setToastMessage("Upvote removed");
        setTimeout(() => setToastMessage(""), 2000);
      }
    } catch (err) {
      console.error("Upvote error:", err);
    }
  };

  const handlePostComment = async () => {
    if (!session) {
      router.push("/login");
      return;
    }
    if (!commentText.trim() || !selectedPromo) return;

    try {
      const res = await fetch(`/api/promotions/${selectedPromo.id}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentText.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.comment) {
        const formattedComment = {
          id: data.comment.id,
          user: data.comment.user?.companyName || data.comment.user?.email?.split("@")[0] || "User",
          createdAt: data.comment.createdAt,
          time: getRelativeTime(data.comment.createdAt),
          text: data.comment.content,
          avatarColor: "bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400",
        };

        setLocalComments((prev) => ({
          ...prev,
          [selectedPromo.id]: [formattedComment, ...(prev[selectedPromo.id] || [])],
        }));
        setCommentText("");
      }
    } catch (err) {
      console.error("Post comment error:", err);
    }
  };

  const handleComment = (e, promo) => {
    e.stopPropagation();
    setSelectedPromo(promo);
    setShowModal(true);
    fetchCommentsForPromo(promo.id);
  };

  const fetchCommentsForPromo = (promoId) => {
    fetch(`/api/promotions/${promoId}/comment`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const formatted = data.map((c) => ({
            id: c.id,
            user: c.user?.companyName || c.user?.email?.split("@")[0] || "User",
            createdAt: c.createdAt,
            time: getRelativeTime(c.createdAt),
            text: c.content,
            avatarColor: "bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400",
          }));
          setLocalComments((prev) => ({ ...prev, [promoId]: formatted }));
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetch("/api/promotions")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPromotions(data);
          // Initialize DB counts and user voted state
          const upvotesMap = {};
          const userVotedMap = {};
          const currentUserId = session?.user?.id;

          data.forEach((p) => {
            upvotesMap[p.id] = p._count?.upvotes || 0;
            if (currentUserId && p.upvotes) {
              userVotedMap[p.id] = p.upvotes.some((u) => u.userId === currentUserId);
            }
          });

          setLocalUpvotes(upvotesMap);
          setUserUpvotedProducts(userVotedMap);
          
          // Track views for the loaded promotions
          if (data.length > 0) {
            const promoIds = data.map(p => p.id);
            fetch("/api/promotions/views", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ids: promoIds })
            }).catch(console.error);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch promotions:", err);
        setPromotions([]);
        setLoading(false);
      });
  }, [session]);

  const filteredPromotions = promotions.filter(
    (promo) =>
      promo.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promo.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promo.company?.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (promo) => {
    setSelectedPromo(promo);
    setShowModal(true);
    fetchCommentsForPromo(promo.id);
    // Track click when they open details
    fetch(`/api/promotions/${promo.id}/click`, { method: "POST" }).catch(console.error);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 font-medium">Loading promotions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F9] dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 transition-colors relative">
      {toastMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-3 rounded-full shadow-2xl font-semibold text-sm animate-bounce">
          ⚠️ {toastMessage}
        </div>
      )}
      {/* Navbar (Simplified) */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20 transition-colors">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#FF6154] text-white rounded-full flex items-center justify-center font-bold text-xl">
              P
            </div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">Ad2Care</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 px-4 py-2 bg-gray-100 dark:bg-gray-700 dark:text-white border-none rounded-full text-sm focus:ring-2 focus:ring-[#FF6154] outline-none transition-colors"
              />
            </div>
            {session ? (
              <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                {session.user?.companyName || session.user?.name || session.user?.email}
              </span>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm font-medium"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        
        {/* HERO BANNER FOR COMPANIES */}
        <div className="bg-gradient-to-r from-orange-50 to-[#FFF0ED] dark:from-gray-800 dark:to-gray-800 border border-[#FFD5CC] dark:border-gray-700 rounded-xl p-8 mb-10 flex flex-col md:flex-row items-center justify-between shadow-sm transition-colors">
          <div className="md:w-2/3 mb-6 md:mb-0">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Reach new customers while changing lives.
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
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
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">Top Products Today</h3>

            {filteredPromotions.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center transition-colors">
                <div className="text-4xl mb-4">📢</div>
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200">No products found</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Check back later or register yours!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filteredPromotions.map((promo, index) => (
                  <div
                    key={promo.id}
                    onClick={() => handleViewDetails(promo)}
                    className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500 shadow-sm hover:shadow-md transition cursor-pointer flex items-center justify-between group overflow-hidden"
                  >
                    <div className="flex items-center flex-1 min-w-0 pr-4">
                      {/* Thumbnail */}
                      <div className="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden flex-shrink-0 mr-4 border border-gray-200 dark:border-gray-600 transition-colors">
                        {promo.imageUrl ? (
                          <img
                            src={promo.imageUrl}
                            alt={promo.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl bg-gradient-to-br from-orange-100 to-red-100 dark:from-gray-600 dark:to-gray-700 text-orange-500 dark:text-orange-300 font-bold">
                            {promo.title ? promo.title.charAt(0) : "P"}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
                        <div className="flex items-center text-sm font-semibold text-gray-900 dark:text-white group-hover:text-[#FF6154] transition-colors truncate">
                          <span className="mr-1">{index + 1}.</span> {promo.title}
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 truncate">
                          {promo.description || "A new amazing product from " + promo.company?.companyName}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-sm transition-colors">
                            {promo.company?.companyName || "Company"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right side stats/buttons */}
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <button onClick={(e) => handleComment(e, promo)} className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors bg-transparent border-none">
                        <MessageCircle size={18} />
                        <span className="text-xs font-medium mt-1">{(promo._count?.comments || 0)}</span>
                      </button>
                      <button 
                        onClick={(e) => handleUpvote(e, promo)} 
                        className={`flex flex-col items-center justify-center w-14 h-14 border rounded-md transition-colors ${
                          userUpvotedProducts[promo.id]
                            ? "bg-orange-50 dark:bg-orange-950/40 border-orange-500 text-orange-600 dark:text-orange-400 font-bold"
                            : "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-orange-400 dark:hover:border-orange-500 hover:text-orange-500 dark:hover:text-orange-400"
                        }`}
                      >
                        <ArrowUp size={16} className="mb-0.5 font-bold" />
                        <span className="text-xs font-bold">{localUpvotes[promo.id] || 0}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Sidebar (Optional extra details) */}
          <div className="hidden lg:block w-72 flex-shrink-0">
             <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 shadow-sm sticky top-24 transition-colors">
               <h4 className="font-bold text-gray-900 dark:text-white mb-3">About Ad2Care</h4>
               <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                 Ad2Care is the place to discover the latest products while making a real-world impact.
               </p>
               <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                 <div className="flex justify-between items-center text-sm mb-2">
                   <span className="text-gray-500 dark:text-gray-400">Products</span>
                   <span className="font-semibold text-gray-800 dark:text-gray-200">{promotions.length}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-gray-500 dark:text-gray-400">Pads Given</span>
                   <span className="font-semibold text-green-600 dark:text-green-400">1,204</span>
                 </div>
               </div>
             </div>
          </div>

        </div>
      </main>

      {/* Product Detail Modal */}
      {showModal && selectedPromo && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl transition-colors">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-start">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-600 transition-colors">
                    {selectedPromo.imageUrl ? (
                      <img src={selectedPromo.imageUrl} alt={selectedPromo.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl bg-orange-100 dark:bg-gray-600 text-orange-500 dark:text-orange-300 font-bold">
                        {selectedPromo.title ? selectedPromo.title.charAt(0) : "P"}
                      </div>
                    )}
                </div>
                <div className="min-w-0">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white truncate">{selectedPromo.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-1 truncate">{selectedPromo.description?.slice(0, 50)}...</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-700 dark:hover:text-white text-3xl font-light ml-4">×</button>
            </div>
            
            <div className="p-6 flex-1">
              {selectedPromo.imageUrl && (
                <img src={selectedPromo.imageUrl} alt={selectedPromo.title} className="w-full h-64 object-cover rounded-lg mb-6 border border-gray-200 dark:border-gray-700" />
              )}
              
              <div className="flex justify-between items-start mb-6">
                 <div className="min-w-0 pr-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Maker</h4>
                    <p className="text-gray-600 dark:text-gray-300 truncate">{selectedPromo.company?.companyName || "Unknown Company"}</p>
                 </div>
                 <button 
                    onClick={(e) => handleUpvote(e, selectedPromo)} 
                    className={`flex items-center gap-2 flex-shrink-0 px-6 py-3 rounded-md font-semibold transition shadow-md ${
                      userUpvotedProducts[selectedPromo.id]
                        ? "bg-orange-600 text-white hover:bg-orange-700"
                        : "bg-[#FF6154] text-white hover:bg-[#e04f43]"
                    }`}
                 >
                    {userUpvotedProducts[selectedPromo.id] ? "UPVOTED ✓" : "UPVOTE"} <span className="opacity-80">({localUpvotes[selectedPromo.id] || 0})</span>
                 </button>
              </div>

              <h4 className="font-semibold text-gray-900 dark:text-white mt-4 mb-2">About this product</h4>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 whitespace-pre-wrap break-words">
                {selectedPromo.description || "No extensive description provided by the maker."}
              </p>

              {selectedPromo.link && (
                <div className="pt-6 border-t border-gray-100 dark:border-gray-700 mb-6">
                  <a 
                    href={selectedPromo.link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center justify-center gap-2 w-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 font-semibold text-center py-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Visit Website <ExternalLink size={18} />
                  </a>
                </div>
              )}

              <div className="border-t border-gray-100 dark:border-gray-700 pt-6 mt-2">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Comments ({(localComments[selectedPromo.id] || []).length})
                </h4>
                
                {/* Comment Input / Sign-In Callout */}
                {session ? (
                  <div className="flex gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/50 flex-shrink-0 flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold uppercase">
                      {(session.user?.companyName || session.user?.name || session.user?.email || "U").charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <textarea 
                        placeholder="What do you think about this product?" 
                        className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-white transition-colors"
                        rows="3"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                      ></textarea>
                      <div className="flex justify-between items-center mt-2 relative">
                        <div>
                          <button 
                            type="button"
                            onClick={() => setShowEmojiPicker((prev) => !prev)} 
                            className="text-gray-500 hover:text-orange-500 transition-colors flex items-center gap-1"
                          >
                            <Smile size={20} />
                            <span className="text-sm font-medium">Emoji</span>
                          </button>
                          
                          {showEmojiPicker && (
                            <div className="absolute bottom-full left-0 mb-2 z-[60] shadow-2xl rounded-xl">
                              <EmojiPicker onEmojiClick={(emojiData) => {
                                setCommentText((prev) => prev + emojiData.emoji);
                                setShowEmojiPicker(false);
                              }} />
                            </div>
                          )}
                        </div>

                        <button onClick={handlePostComment} className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors">
                          Post Comment
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-orange-50 dark:bg-gray-800/80 border border-orange-200 dark:border-gray-700 rounded-xl p-4 mb-6 text-center shadow-sm">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-3">
                      💬 Want to leave a comment? Sign in or register to join the discussion!
                    </p>
                    <div className="flex justify-center gap-3">
                      <Link 
                        href="/login" 
                        className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow-sm"
                      >
                        Sign In
                      </Link>
                      <Link 
                        href="/register" 
                        className="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 text-xs font-semibold px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition"
                      >
                        Create Account
                      </Link>
                    </div>
                  </div>
                )}

                {/* Real Database Comments List */}
                <div className="space-y-4">
                  {(localComments[selectedPromo.id] || []).length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No comments yet. Be the first to share your thoughts!</p>
                  ) : (
                    (localComments[selectedPromo.id] || []).map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <div className={`w-8 h-8 rounded-full ${comment.avatarColor} flex-shrink-0 flex items-center justify-center font-bold text-xs uppercase`}>
                          {comment.user.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className="font-semibold text-gray-900 dark:text-white text-sm">{comment.user}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {comment.createdAt ? <RelativeTime dateInput={comment.createdAt} /> : comment.time}
                            </span>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 text-sm mt-1 break-words">{comment.text}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal (Like Product Hunt) */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-4 flex justify-between items-center">
              <div className="w-8"></div> {/* Spacer for centering */}
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center -mb-8 z-10 border-4 border-white dark:border-gray-800 shadow-sm relative">
                 <span className="text-3xl relative top-[-2px]">🚀</span>
              </div>
              <button onClick={() => setShowAuthModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl font-light">×</button>
            </div>
            
            <div className="p-8 pt-10 text-center">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{authModalConfig.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-8">{authModalConfig.action}</p>
              
              <div className="space-y-3">
                <Link 
                  href="/register" 
                  className="flex items-center justify-center w-full bg-orange-500 text-white px-4 py-3 rounded-xl font-semibold hover:bg-orange-600 transition shadow-md"
                >
                  <span className="mr-2">👤</span> Create User Account
                </Link>
                <Link 
                  href="/login" 
                  className="flex items-center justify-center w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 px-4 py-3 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-600 transition shadow-sm"
                >
                  <span className="mr-2">✉️</span> User Sign In
                </Link>
                <div className="pt-2 border-t border-gray-100 dark:border-gray-700 flex justify-center gap-4 text-xs text-gray-500">
                  <span>Are you a business?</span>
                  <Link href="/company/login" className="text-orange-500 hover:underline font-semibold">
                    Company Sign In
                  </Link>
                </div>
              </div>

              <p className="text-xs text-gray-400 dark:text-gray-500 mt-6">
                We never post to any of your accounts without your permission.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}