import Link from "next/link";

export default function AdvertisePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 text-center">
      <h1 className="text-5xl font-bold text-gray-900 dark:text-white tracking-tight mb-4">
        Reach Early Adopters
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-12">
        Get your product in front of thousands of users while making a real-world impact. Every sponsorship donates hygiene pads to those in need.
      </p>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
        {/* Free Tier */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Standard Listing</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Perfect for new products launching on a budget.</p>
          <div className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8">Free</div>
          <ul className="space-y-4 mb-8 text-gray-600 dark:text-gray-300">
            <li className="flex items-center gap-3">✅ Standard placement in feed</li>
            <li className="flex items-center gap-3">✅ Community upvotes & comments</li>
            <li className="flex items-center gap-3">✅ Basic analytics tracking</li>
          </ul>
          <Link href="/company/register?plan=free" className="block w-full py-3 px-4 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white text-center font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            Start Free
          </Link>
        </div>

        {/* Pro Tier */}
        <div className="bg-gradient-to-b from-orange-50 to-white dark:from-orange-900/20 dark:to-gray-800 rounded-3xl shadow-lg border-2 border-orange-500 p-8 relative">
          <div className="absolute top-0 right-8 transform -translate-y-1/2 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold tracking-wide">
            RECOMMENDED
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Boosted Listing</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Dominate the leaderboard and get maximum visibility.</p>
          <div className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8">Flexible <span className="text-lg text-gray-500 font-normal">/ pay what you want</span></div>
          <ul className="space-y-4 mb-8 text-gray-600 dark:text-gray-300">
            <li className="flex items-center gap-3">🚀 <strong className="text-gray-900 dark:text-white">Pinned to top</strong> of the feed</li>
            <li className="flex items-center gap-3">💖 Supports the Sanitary Pad Fund</li>
            <li className="flex items-center gap-3">✨ "Karma Badge" on your product</li>
            <li className="flex items-center gap-3">📈 Premium analytics dashboard</li>
          </ul>
          <Link href="/company/register?plan=boost" className="block w-full py-3 px-4 bg-orange-500 text-white text-center font-bold rounded-xl hover:bg-orange-600 transition-colors shadow-md">
            Boost Your Product
          </Link>
        </div>
      </div>
    </div>
  );
}
