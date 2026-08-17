export default function ForumsPage() {
  const mockTopics = [
    { id: 1, title: "Best strategies for launching a SaaS product?", author: "Sarah M.", replies: 24, views: 105 },
    { id: 2, title: "Looking for a co-founder (Tech lead)", author: "David K.", replies: 8, views: 56 },
    { id: 3, title: "Feedback on my new landing page design", author: "Alex R.", replies: 15, views: 89 },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Community Forums</h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">Discuss, share, and connect with other founders.</p>
        </div>
        <button className="bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors">
          New Topic
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center overflow-hidden">
        <div className="text-5xl mb-4">💬</div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Forums Yet</h3>
        <p className="text-gray-500 dark:text-gray-400">
          Until now there is no forum. Be the first to start a discussion!
        </p>
      </div>
    </div>
  );
}
