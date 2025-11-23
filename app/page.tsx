import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-5xl font-bold mb-4">BiggieBack</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Upload ingredient photos and get AI-generated recipes
        </p>
        <Link
          href="/upload"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
        >
          Get Started
        </Link>
      </div>
    </main>
  );
}

