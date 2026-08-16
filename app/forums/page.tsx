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

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {mockTopics.map((topic) => (
            <div key={topic.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{topic.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Started by <span className="font-medium text-gray-700 dark:text-gray-300">{topic.author}</span></p>
              </div>
              <div className="flex gap-6 text-sm text-gray-500 dark:text-gray-400 text-center">
                <div>
                  <span className="block font-bold text-gray-900 dark:text-white">{topic.replies}</span>
                  Replies
                </div>
                <div>
                  <span className="block font-bold text-gray-900 dark:text-white">{topic.views}</span>
                  Views
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
