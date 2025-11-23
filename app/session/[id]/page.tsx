"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";

interface Recipe {
  name: string;
  description: string;
  steps: string[];
  embedding?: number[];
}

interface Session {
  _id: string;
  imageUrl: string;
  status: "pending" | "processing" | "complete" | "error";
  ingredients: string[];
  recipes: Recipe[];
  createdAt: string;
  updatedAt: string;
}

export default function SessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSession = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      const response = await axios.get(`${backendUrl}/session/${sessionId}`);
      setSession(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "Failed to fetch session");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!sessionId) return;

    // Initial fetch
    fetchSession();

    // Poll every 2 seconds if status is pending or processing
    const interval = setInterval(() => {
      if (session?.status === "pending" || session?.status === "processing") {
        fetchSession();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [sessionId, session?.status]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-orange-200 border-t-orange-500"></div>
          </div>
          <p className="text-xl text-gray-700 dark:text-gray-300">Loading session...</p>
        </div>
      </main>
    );
  }

  if (error && !session) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😕</div>
          <p className="text-xl text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Link
            href="/upload"
            className="inline-block px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-full hover:shadow-lg transform hover:scale-105 transition-all"
          >
            Try Again
          </Link>
        </div>
      </main>
    );
  }

  const isProcessing = session?.status === "pending" || session?.status === "processing";

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-2">
              <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                Your Recipe Session
              </span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Session ID: {sessionId.slice(0, 8)}...</p>
          </div>
          <Link
            href="/upload"
            className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
          >
            New Upload
          </Link>
        </div>

        {/* Processing Status */}
        {isProcessing && (
          <div className="mb-8 p-6 bg-gradient-to-r from-orange-100 to-pink-100 dark:from-orange-900/20 dark:to-pink-900/20 rounded-2xl border border-orange-200 dark:border-orange-800">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-500"></div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Processing your ingredients...
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Our AI is analyzing your image and generating delicious recipes
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Image Preview */}
        {session?.imageUrl && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
              <span className="mr-2">📷</span>
              Uploaded Image
            </h2>
            <div className="relative w-full h-64 sm:h-96 rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={session.imageUrl}
                alt="Uploaded ingredients"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Results Section */}
        {session?.status === "complete" && (
          <div className="space-y-8">
            {/* Ingredients */}
            {session.ingredients && session.ingredients.length > 0 && (
              <div>
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center">
                  <span className="mr-3 text-4xl">🥬</span>
                  Detected Ingredients
                </h2>
                <div className="flex flex-wrap gap-3">
                  {session.ingredients.map((ingredient, idx) => (
                    <span
                      key={idx}
                      className="px-5 py-2.5 bg-gradient-to-r from-green-400 to-emerald-500 text-white font-semibold rounded-full shadow-lg hover:scale-110 transform transition-transform"
                    >
                      {ingredient}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Recipes */}
            {session.recipes && session.recipes.length > 0 && (
              <div>
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center">
                  <span className="mr-3 text-4xl">🍽️</span>
                  Generated Recipes
                </h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {session.recipes.map((recipe, idx) => (
                    <div
                      key={idx}
                      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all border border-gray-200 dark:border-gray-700 transform hover:scale-105"
                    >
                      <div className="mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-pink-500 rounded-xl flex items-center justify-center text-3xl mb-3">
                          🍳
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                          {recipe.name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {recipe.description}
                        </p>
                      </div>
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center">
                          <span className="mr-2">📝</span>
                          Steps:
                        </h4>
                        <ol className="space-y-2">
                          {recipe.steps.map((step, stepIdx) => (
                            <li
                              key={stepIdx}
                              className="text-sm text-gray-700 dark:text-gray-300 flex items-start"
                            >
                              <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-orange-400 to-pink-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-2 mt-0.5">
                                {stepIdx + 1}
                              </span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error State */}
        {session?.status === "error" && (
          <div className="p-8 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl text-center">
            <div className="text-6xl mb-4">😞</div>
            <h3 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-2">
              Processing Error
            </h3>
            <p className="text-red-600 dark:text-red-400 mb-6">
              An error occurred while processing your image. Please try again.
            </p>
            <Link
              href="/upload"
              className="inline-block px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-full hover:shadow-lg transform hover:scale-105 transition-all"
            >
              Upload New Image
            </Link>
          </div>
        )}

        {/* Back to Home */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors"
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
