import Image from "next/image";
import Link from "next/link";
import { Section, Container } from "@/components/craft";
import { getPostsPaginated } from "@/lib/wordpress"; // Verify this import path in your project

export default async function RecentPosts() {
  // Fetch the 4 latest posts
  const { data: posts } = await getPostsPaginated(1, 4);

  if (!posts || posts.length === 0) return null;

  return (
    <Section id="recent-posts" className="md:py-0">
      <Container className="max-w-7xl lg:px-0">
        <div className="flex justify-between items-end mb-8">
          <h3 className="text-3xl font-bold text-blue-950">Rakesh Retails <span className="text-red-700">Insights</span></h3>
          <Link href="/posts" className="text-sm font-medium text-primary hover:underline">
            View All Posts <span className="text-red-700">→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {posts.map((post: any) => (
            <div key={post.id} className="flex flex-col group border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
              {/* 1. Thumbnail */}
              <div className="relative aspect-video overflow-hidden">
                {post._embedded?.['wp:featuredmedia']?.[0]?.source_url ? (
                  <Image
                    src={post._embedded['wp:featuredmedia'][0].source_url}
                    alt={post.title.rendered}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">No Image</div>
                )}
              </div>

              <div className="p-4 flex flex-col grow">
                {/* 2. Post Info */}
                <div className="text-xs text-gray-500 mb-2 uppercase tracking-wider font-medium">
                  {new Date(post.date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </div>
                <Link href={`/posts/${post.slug}`}>
                 
                {/* 3. Title */}
                <h3 
                  className="font-bold text-lg mb-2 line-clamp-2 hover:text-red-700 transition-colors"
                  dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                />
                </Link>
                {/* 4. Excerpt */}
                <div 
                  className="text-gray-600 text-sm mb-4 line-clamp-3 grow"
                  dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
                />

                {/* 5. Read More Button */}
                <Link 
                  href={`/posts/${post.slug}`}
                  className="mt-auto inline-flex items-center text-sm font-bold text-red-600 hover:gap-2 transition-all"
                >
                  READ MORE <span>→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
