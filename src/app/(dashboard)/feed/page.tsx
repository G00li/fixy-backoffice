import { Suspense } from 'react';
import PostFeed from '@/components/posts/PostFeed';
import PostFeedSkeleton from '@/components/posts/PostFeedSkeleton';

export const metadata = {
  title: 'Feed de Posts | Fixy',
  description: 'Descubra trabalhos incríveis de providers na Fixy. Veja portfólios, projetos e inspirações.',
  keywords: 'fixy, providers, posts, portfólio, trabalhos, serviços',
};

// Revalidate a cada 5 minutos (ISR)
export const revalidate = 300;

export default function FeedPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Feed de Posts
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Descubra trabalhos incríveis de providers e inspire-se
        </p>
      </div>

      {/* Feed with Suspense */}
      <Suspense 
        fallback={
          <div className="space-y-6">
            <div className="h-16 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
            <PostFeedSkeleton count={6} />
          </div>
        }
      >
        <PostFeed />
      </Suspense>
    </div>
  );
}
