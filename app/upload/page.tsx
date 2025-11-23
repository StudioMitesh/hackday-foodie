"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select an image file");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      const response = await axios.post(`${backendUrl}/upload-image`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.sessionId) {
        router.push(`/session/${response.data.sessionId}`);
      } else {
        setError("Failed to create session");
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Upload Ingredient Photo</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Select Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              disabled={uploading}
            />
          </div>

          {preview && (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Preview</label>
              <div className="relative w-full h-64 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {uploading ? "Uploading..." : "Upload & Process"}
          </button>
        </div>
      </div>
    </main>
  );
}

