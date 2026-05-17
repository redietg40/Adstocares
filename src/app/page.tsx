export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Ad2Care</h1>
        <p className="text-lg text-gray-600 mb-8">Promote Products. Empower Women.</p>
        <a href="/company/register" className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700">
          Get Started
        </a>
      </div>
    </div>
  );
}
