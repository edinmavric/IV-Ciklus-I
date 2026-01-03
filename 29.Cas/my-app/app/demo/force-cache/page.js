/**
 * DEMO: force-cache (SSG - Static Site Generation)
 *
 * Podaci se dohvataju JEDNOM prilikom build-a i keširaju se zauvijek.
 * Ovo je DEFAULT ponašanje u Next.js.
 */

async function ForceCachePage() {
  // force-cache je default, ali ga eksplicitno navodimo za edukativne svrhe
  const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5');
  const posts = await response.json();

  // Vrijeme kada su podaci dohvaćeni
  const fetchTime = new Date().toLocaleString('sr-RS');

  return (
    <div className="container">
      <h1>force-cache Demo (SSG)</h1>

      <div className="info-box">
        <h2>Kako radi?</h2>
        <ul>
          <li>Podaci se dohvataju <strong>JEDNOM</strong> prilikom build-a</li>
          <li>Keširaju se na serveru zauvijek</li>
          <li>Svi korisnici dobijaju iste (keširane) podatke</li>
          <li>Najbrže moguće učitavanje</li>
        </ul>
      </div>

      <div className="code-box">
        <code>
          {`fetch(url, { cache: 'force-cache' })`}
        </code>
      </div>

      <div className="time-box">
        <p><strong>Vrijeme renderovanja:</strong> {fetchTime}</p>
        <p className="hint">Refreshuj stranicu - vrijeme će ostati ISTO (keširan podatak)</p>
      </div>

      <h2>Postovi (keširani):</h2>
      <div className="posts-grid">
        {posts.map(post => (
          <div key={post.id} className="post-card">
            <h3>#{post.id} - {post.title}</h3>
            <p>{post.body}</p>
          </div>
        ))}
      </div>

      <div className="nav-box">
        <a href="/">← Nazad na početnu</a>
        <a href="/demo/no-store">Sljedeći: no-store →</a>
      </div>
    </div>
  );
}

export default ForceCachePage;
