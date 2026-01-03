/**
 * DINAMIČKA RUTA: [id] - Obavezni parametar
 *
 * Folder: app/users/[id]/page.js
 *
 * Matchuje:
 *   ✅ /users/1
 *   ✅ /users/2
 *   ✅ /users/abc
 *   ❌ /users         (404 - parametar je OBAVEZAN)
 *   ❌ /users/1/posts (404 - samo jedan segment)
 */

async function UserPage({ params }) {
  // params.id dolazi iz URL-a
  const { id } = await params;

  // Dohvati korisnika po ID-u
  const response = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`, {
    cache: 'no-store'
  });

  // Provjeri da li korisnik postoji
  if (!response.ok) {
    return (
      <div className="container">
        <h1>Korisnik nije pronađen</h1>
        <p>ID: {id}</p>
        <a href="/users/1">← Probaj /users/1</a>
      </div>
    );
  }

  const user = await response.json();

  // Dohvati postove korisnika
  const postsResponse = await fetch(`https://jsonplaceholder.typicode.com/posts?userId=${id}`, {
    cache: 'no-store'
  });
  const posts = await postsResponse.json();

  return (
    <div className="container">
      <h1>Dinamička ruta: [id]</h1>

      <div className="info-box">
        <h2>Kako radi [id]?</h2>
        <ul>
          <li><strong>Folder:</strong> app/users/[id]/page.js</li>
          <li><strong>Parametar je OBAVEZAN</strong> - /users bez ID-a daje 404</li>
          <li><strong>Hvata JEDAN segment</strong> URL-a</li>
          <li><strong>params.id</strong> = "{id}"</li>
        </ul>
      </div>

      <div className="code-box">
        <h3>Primjeri URL-ova:</h3>
        <pre>
{`/users/1     → params = { id: "1" }     ✅
/users/2     → params = { id: "2" }     ✅
/users/abc   → params = { id: "abc" }   ✅
/users       → 404 (nema parametra)     ❌
/users/1/2   → 404 (previše segmenata)  ❌`}
        </pre>
      </div>

      <div className="user-profile">
        <div className="user-header">
          <div className="avatar">{user.name.charAt(0)}</div>
          <div>
            <h2>{user.name}</h2>
            <p>@{user.username}</p>
          </div>
        </div>

        <div className="user-details">
          <div className="detail">
            <strong>Email:</strong>
            <span>{user.email}</span>
          </div>
          <div className="detail">
            <strong>Telefon:</strong>
            <span>{user.phone}</span>
          </div>
          <div className="detail">
            <strong>Website:</strong>
            <span>{user.website}</span>
          </div>
          <div className="detail">
            <strong>Kompanija:</strong>
            <span>{user.company.name}</span>
          </div>
          <div className="detail">
            <strong>Adresa:</strong>
            <span>{user.address.street}, {user.address.city}</span>
          </div>
        </div>
      </div>

      <h3>Postovi korisnika ({posts.length}):</h3>
      <div className="posts-list">
        {posts.slice(0, 5).map(post => (
          <div key={post.id} className="post-item">
            <span className="post-id">#{post.id}</span>
            <div className="post-content">
              <h4>{post.title}</h4>
              <p>{post.body.substring(0, 100)}...</p>
            </div>
          </div>
        ))}
      </div>

      <div className="test-links">
        <h3>Testiraj druge korisnike:</h3>
        <div className="links-grid">
          {[1, 2, 3, 4, 5].map(userId => (
            <a
              key={userId}
              href={`/users/${userId}`}
              className={userId.toString() === id ? 'active' : ''}
            >
              User {userId}
            </a>
          ))}
        </div>
      </div>

      <div className="nav-box">
        <a href="/">← Početna</a>
        <a href="/posts">Catch-all rute →</a>
      </div>
    </div>
  );
}

export default UserPage;
