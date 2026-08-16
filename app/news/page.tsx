export default function NewsPage() {
  const mockNews = [
    { id: 1, title: "Ad2Care Hits 10,000 Pads Distributed!", category: "Milestone", date: "Aug 15, 2026", readTime: "3 min read" },
    { id: 2, title: "New Feature: Company Dashboards are Live", category: "Product Update", date: "Aug 12, 2026", readTime: "2 min read" },
    { id: 3, title: "How Tech Startups are giving back in 2026", category: "Industry", date: "Aug 10, 2026", readTime: "5 min read" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Latest News</h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">Stay updated with platform features and milestones.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockNews.map((news) => (
          <div key={news.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer">
            <span className="text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wider">{news.category}</span>
            <h3 className="mt-3 text-xl font-bold text-gray-900 dark:text-white leading-tight">{news.title}</h3>
            <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>{news.date}</span>
              <span>{news.readTime}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
