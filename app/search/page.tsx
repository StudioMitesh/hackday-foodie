"use client";

import { useState } from "react";
import Link from "next/link";
import axios from "axios";

interface Recipe {
  name: string;
  description: string;
  steps: string[];
}

interface SearchResult {
  sessionId: string;
  recipe: Recipe;
  similarity: number;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      setError("Please enter a search query");
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);
    setSearchQuery(query.trim());

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      const response = await axios.get(`${backendUrl}/similar-recipes`, {
        params: { query: query.trim() },
      });

      setResults(response.data.results || []);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "Search failed");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 0.8) return "from-green-400 to-emerald-500";
    if (similarity >= 0.6) return "from-yellow-400 to-orange-500";
    if (similarity >= 0.4) return "from-orange-400 to-pink-500";
    return "from-gray-400 to-gray-500";
  };

  const getSimilarityLabel = (similarity: number) => {
    if (similarity >= 0.8) return "Excellent Match";
    if (similarity >= 0.6) return "Good Match";
    if (similarity >= 0.4) return "Moderate Match";
    return "Weak Match";
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl sm:text-6xl font-extrabold mb-4">
            <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">
              Search Recipes
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Find similar recipes by describing what you're looking for. Our AI will match your query with existing recipes.
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mb-8 border border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg
                  className="h-6 w-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., 'spicy pasta with tomatoes', 'healthy salad', 'quick breakfast'..."
                className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${
                loading || !query.trim()
                  ? "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Searching...
                </span>
              ) : (
                "🔍 Search Recipes"
              )}
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl animate-pulse">
              <p className="text-red-800 dark:text-red-200 flex items-center">
                <span className="mr-2">⚠️</span>
                {error}
              </p>
            </div>
          )}
        </div>

        {/* Search Query Display */}
        {hasSearched && searchQuery && (
          <div className="mb-8 text-center">
            <div className="inline-flex items-center space-x-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Searching for:</span>
              <span className="font-semibold text-lg bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                "{searchQuery}"
              </span>
            </div>
          </div>
        )}

        {/* Results */}
        {hasSearched && (
          <div className="animate-fadeIn">
            {loading ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 mx-auto mb-6">
                  <div className="animate-spin rounded-full h-20 w-20 border-4 border-orange-200 border-t-orange-500"></div>
                </div>
                <p className="text-xl text-gray-600 dark:text-gray-400 font-medium">
                  Searching for similar recipes...
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  This may take a few seconds
                </p>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-8">
                {/* Results Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center">
                      <span className="mr-3 text-5xl">🎯</span>
                      <span>
                        Found <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">{results.length}</span> Recipe{results.length !== 1 ? "s" : ""}
                      </span>
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 ml-16">
                      Sorted by relevance
                    </p>
                  </div>
                </div>

                {/* Results Grid */}
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {results.map((result, idx) => (
                    <div
                      key={idx}
                      className="group bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 transform hover:scale-105 hover:-translate-y-2 relative overflow-hidden"
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      {/* Decorative gradient background */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-200/20 to-pink-200/20 rounded-full blur-2xl -z-0"></div>
                      
                      <div className="relative z-10">
                        {/* Similarity Score - Enhanced */}
                        <div className="mb-6 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className={`px-4 py-2 bg-gradient-to-r ${getSimilarityColor(result.similarity)} text-white rounded-full text-sm font-bold shadow-lg flex items-center space-x-2`}>
                              <span>⭐</span>
                              <span>{Math.round(result.similarity * 100)}%</span>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                              {getSimilarityLabel(result.similarity)}
                            </span>
                          </div>
                          <Link
                            href={`/session/${result.sessionId}`}
                            className="text-sm text-orange-500 hover:text-orange-600 font-semibold flex items-center group/link transition-colors"
                          >
                            View
                            <svg className="w-4 h-4 ml-1 transform group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        </div>

                        {/* Recipe Icon - Larger and more prominent */}
                        <div className="mb-5 flex justify-center">
                          <div className="w-24 h-24 bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 rounded-2xl flex items-center justify-center text-5xl shadow-xl transform group-hover:rotate-6 transition-transform duration-300">
                            🍳
                          </div>
                        </div>

                        {/* Recipe Name - Enhanced */}
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3 text-center group-hover:text-orange-500 transition-colors">
                          {result.recipe.name}
                        </h3>

                        {/* Description - Better styled */}
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 text-center line-clamp-2 min-h-[2.5rem]">
                          {result.recipe.description}
                        </p>

                        {/* Steps Preview - Enhanced design */}
                        <div className="border-t-2 border-gradient-to-r from-orange-200 to-pink-200 dark:border-gray-700 pt-5">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-bold text-gray-800 dark:text-gray-200 flex items-center text-sm">
                              <span className="mr-2 text-lg">📝</span>
                              Cooking Steps
                            </h4>
                            <span className="text-xs font-semibold px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                              {result.recipe.steps.length} steps
                            </span>
                          </div>
                          <ol className="space-y-3">
                            {result.recipe.steps.slice(0, 3).map((step, stepIdx) => (
                              <li
                                key={stepIdx}
                                className="text-sm text-gray-700 dark:text-gray-300 flex items-start group/step"
                              >
                                <span className={`flex-shrink-0 w-7 h-7 bg-gradient-to-br ${getSimilarityColor(result.similarity)} text-white rounded-lg flex items-center justify-center font-bold mr-3 mt-0.5 shadow-md group-hover/step:scale-110 transition-transform`}>
                                  {stepIdx + 1}
                                </span>
                                <span className="line-clamp-2 pt-1">{step}</span>
                              </li>
                            ))}
                            {result.recipe.steps.length > 3 && (
                              <li className="text-xs text-gray-500 dark:text-gray-400 italic pl-10 flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                {result.recipe.steps.length - 3} more steps
                              </li>
                            )}
                          </ol>
                        </div>

                        {/* View Full Recipe Button */}
                        <div className="mt-6 pt-5 border-t border-gray-200 dark:border-gray-700">
                          <Link
                            href={`/session/${result.sessionId}`}
                            className="block w-full text-center px-4 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                          >
                            View Full Recipe →
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl border-2 border-dashed border-gray-300 dark:border-gray-700">
                <div className="text-8xl mb-6 animate-bounce">🔍</div>
                <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-3">
                  No recipes found
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                  We couldn't find any recipes matching your search. Try different keywords or upload some ingredients first!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/upload"
                    className="inline-block px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-full hover:shadow-lg transform hover:scale-105 transition-all"
                  >
                    📸 Upload Ingredients
                  </Link>
                  <button
                    onClick={() => {
                      setQuery("");
                      setResults([]);
                      setHasSearched(false);
                    }}
                    className="inline-block px-6 py-3 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-full border-2 border-gray-300 dark:border-gray-600 hover:border-orange-400 transition-all"
                  >
                    Try Another Search
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info Section - Only show when no search has been performed */}
        {!hasSearched && (
          <div className="mt-12 grid md:grid-cols-2 gap-6 animate-fadeIn">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">💡</div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">
                How it works
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Our AI uses semantic search to find recipes that match your description, even if they don't use the exact same words. It understands meaning, not just keywords.
              </p>
            </div>
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">
                Search Tips
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try searching for flavors, cooking methods, or dish types. For example: "spicy", "quick meal", "vegetarian pasta", "comfort food", etc.
              </p>
            </div>
          </div>
        )}

        {/* Back Link */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors font-medium"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
