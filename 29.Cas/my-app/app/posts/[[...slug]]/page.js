/**
 * OPTIONAL CATCH-ALL RUTA: [[...slug]] - Hvata SVE segmente (OPCIONALNO)
 *
 * Folder: app/posts/[[...slug]]/page.js
 *
 * Matchuje:
 *   ✅ /posts                     (slug = undefined)
 *   ✅ /posts/1                   (slug = ["1"])
 *   ✅ /posts/category/tech       (slug = ["category", "tech"])
 *   ✅ /posts/2024/01/15/my-post  (slug = ["2024", "01", "15", "my-post"])
 */

async function PostsPage({ params }) {
  const { slug } = await params;

  // slug može biti:
  // - undefined (ako je /posts)
  // - array (ako ima segmente)

  // Odredi šta prikazati na osnovu slug-a
  let content;
  let posts = [];
  let singlePost = null;

  if (!slug || slug.length === 0) {
    // /posts - prikaži sve postove
    const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=10', {
      cache: 'no-store'
    });
    posts = await response.json();
    content = 'all';
  } else if (slug.length === 1 && !isNaN(slug[0])) {
    // /posts/1 - prikaži jedan post
    const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${slug[0]}`, {
      cache: 'no-store'
    });
    if (response.ok) {
      singlePost = await response.json();
      content = 'single';
    } else {
      content = 'not-found';
    }
  } else {
    // /posts/category/something ili /posts/2024/01/15/slug
    content = 'custom-path';
  }

  return (
    <div className="container">
      <h1>Optional Catch-All: [[...slug]]</h1>

      <div className="info-box success">
        <h2>Kako radi [[...slug]]?</h2>
        <ul>
          <li><strong>Folder:</strong> app/posts/[[...slug]]/page.js</li>
          <li><strong>Dvostruke zagrade [[]]</strong> = OPCIONALNO</li>
          <li><strong>Matchuje i /posts</strong> (bez segmenata)</li>
          <li><strong>params.slug</strong> = {slug ? JSON.stringify(slug) : 'undefined'}</li>
        </ul>
      </div>

      <div className="code-box">
        <h3>Primjeri URL-ova:</h3>
        <pre>
{`/posts                    → slug = undefined              ✅
/posts/1                  → slug = ["1"]                  ✅
/posts/category/tech      → slug = ["category", "tech"]   ✅
/posts/2024/01/15/my-post → slug = ["2024","01","15",...] ✅

Razlika od [...path]:
[...path]   → /products       = 404 ❌
[[...slug]] → /posts          = OK  ✅`}
        </pre>
      </div>

      <div className="current-path">
        <h3>Trenutni slug:</h3>
        <div className="path-display">
          <code>params.slug = {slug ? JSON.stringify(slug) : 'undefined'}</code>
        </div>
        <p className="hint">
          {!slug && 'Nema slug-a - prikazujemo sve postove'}
          {slug?.length === 1 && 'Jedan segment - prikazujemo pojedinačni post'}
          {slug?.length > 1 && 'Više segmenata - custom putanja'}
        </p>
      </div>

      {/* Prikaz na osnovu tipa */}
      {content === 'all' && (
        <>
          <h3>Svi postovi (slug = undefined):</h3>
          <div className="posts-list">
            {posts.map(post => (
              <a key={post.id} href={`/posts/${post.id}`} className="post-item clickable">
                <span className="post-id">#{post.id}</span>
                <div className="post-content">
                  <h4>{post.title}</h4>
                  <p>{post.body.substring(0, 80)}...</p>
                </div>
              </a>
            ))}
          </div>
        </>
      )}

      {content === 'single' && singlePost && (
        <div className="single-post">
          <h3>Pojedinačni post (slug = ["{slug[0]}"]):</h3>
          <article className="post-full">
            <h2>{singlePost.title}</h2>
            <p className="post-meta">Post ID: {singlePost.id} | User ID: {singlePost.userId}</p>
            <div className="post-body">
              {singlePost.body}
            </div>
          </article>
          <a href="/posts" className="back-link">← Nazad na sve postove</a>
        </div>
      )}

      {content === 'custom-path' && (
        <div className="custom-path-info">
          <h3>Custom putanja:</h3>
          <p>Detektovana putanja sa {slug.length} segmenata:</p>
          <div className="segments-grid">
            {slug.map((segment, index) => (
              <div key={index} className="segment-card">
                <span className="segment-index">[{index}]</span>
                <span className="segment-value">"{segment}"</span>
              </div>
            ))}
          </div>
          <p className="hint">
            Ovo bi moglo biti: /posts/category/tech, /posts/2024/01/15/slug, itd.
          </p>
        </div>
      )}

      {content === 'not-found' && (
        <div className="not-found">
          <h3>Post nije pronađen</h3>
          <p>Post sa ID-om {slug[0]} ne postoji.</p>
          <a href="/posts">← Nazad na sve postove</a>
        </div>
      )}

      <div className="test-links">
        <h3>Testiraj različite putanje:</h3>
        <div className="links-grid">
          <a href="/posts">/posts (svi)</a>
          <a href="/posts/1">/posts/1</a>
          <a href="/posts/5">/posts/5</a>
          <a href="/posts/category/tech">/posts/category/tech</a>
          <a href="/posts/2024/01/15/my-post">/posts/2024/01/15/my-post</a>
        </div>
      </div>

      <div className="nav-box">
        <a href="/products/electronics">← [...path] ruta</a>
        <a href="/dynamic-routes">Pregled svih ruta →</a>
      </div>
    </div>
  );
}

export default PostsPage;
