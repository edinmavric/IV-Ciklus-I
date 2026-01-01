// Next.js 13+ App Router - SSG
// Po defaultu, fetch se kešira = SSG ponašanje

async function BlogPost({ params }) {
  // Ovo se izvršava samo JEDNOM tokom builda
  const response = await fetch(`https://api.example.com/posts/${params.slug}`, {
    cache: 'force-cache', // Default - SSG ponašanje
  });
  const post = await response.json();

  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}
