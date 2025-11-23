"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading session...</p>
        </div>
      </main>
    );
  }

  if (error && !session) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </main>
    );
  }

  const isProcessing = session?.status === "pending" || session?.status === "processing";

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Session Details</h1>

        {isProcessing && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
              <p className="text-blue-800 dark:text-blue-200">Processing your ingredients...</p>
            </div>
          </div>
        )}

        {session?.imageUrl && (
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">Uploaded Image</h2>
            <div className="relative w-full h-64 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
              <img
                src={session.imageUrl}
                alt="Uploaded ingredients"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        )}

        {session?.status === "complete" && (
          <>
            {session.ingredients && session.ingredients.length > 0 && (
              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-4">Detected Ingredients</h2>
                <div className="flex flex-wrap gap-2">
                  {session.ingredients.map((ingredient, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full text-sm font-medium"
                    >
                      {ingredient}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {session.recipes && session.recipes.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Generated Recipes</h2>
                <div className="grid gap-6 md:grid-cols-2">
                  {session.recipes.map((recipe, idx) => (
                    <div
                      key={idx}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
                    >
                      <h3 className="text-xl font-bold mb-2">{recipe.name}</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {recipe.description}
                      </p>
                      <div>
                        <h4 className="font-semibold mb-2">Steps:</h4>
                        <ol className="list-decimal list-inside space-y-2">
                          {recipe.steps.map((step, stepIdx) => (
                            <li key={stepIdx} className="text-sm">
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {session?.status === "error" && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200">
              An error occurred while processing your image. Please try again.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

