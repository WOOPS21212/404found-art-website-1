'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function DebugPage() {
  const [apiStatus, setApiStatus] = useState<string>('Checking...');
  const [posts, setPosts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [apiUrl, setApiUrl] = useState<string>('');

  useEffect(() => {
    // Display the API URL from environment variables
    setApiUrl(process.env.NEXT_PUBLIC_STRAPI_API_URL || 'Not set');

    async function checkApi() {
      try {
        // First check if we can connect to the API
        const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/posts?populate=*`);
        
        if (!response.ok) {
          setApiStatus(`API Error: ${response.status} ${response.statusText}`);
          setError('Cannot connect to Strapi API. Make sure the server is running at the correct URL.');
          return;
        }

        const data = await response.json();
        setApiStatus('Connected');
        
        if (data && data.data && Array.isArray(data.data)) {
          setPosts(data.data);
        } else {
          setError('Received unexpected data format from API');
        }
      } catch (err) {
        setApiStatus('Error');
        setError(`Error connecting to API: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    checkApi();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">404 Found Art API Debug Page</h1>
      
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-2">API Configuration</h2>
        <p><strong>NEXT_PUBLIC_STRAPI_API_URL:</strong> {apiUrl}</p>
        <p><strong>Status:</strong> {apiStatus}</p>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>

      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Posts from API</h2>
        
        {posts.length === 0 ? (
          <p>No posts found. Check if your Strapi server is running and has content.</p>
        ) : (
          <div className="space-y-4">
            <p className="text-green-500">Found {posts.length} posts</p>
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {posts.map(post => (
                <li key={post.id} className="py-3">
                  <div>
                    <p><strong>ID:</strong> {post.id}</p>
                    <p><strong>Title:</strong> {post.attributes?.title || 'No title'}</p>
                    <p><strong>Slug:</strong> {post.attributes?.slug || 'No slug'}</p>
                    <div className="mt-2 space-x-3">
                      <Link 
                        href={`/posts/${post.attributes?.slug}`} 
                        className="text-blue-500 hover:underline"
                      >
                        Test Regular Link
                      </Link>
                      <Link 
                        href={`/posts/post-${post.id}`} 
                        className="text-green-500 hover:underline"
                      >
                        Test Fallback Link
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
