/**
 * ZADATAK: SSR za korisnike + SSG za postove
 *
 * Cilj: Demonstrirati kombinovanje različitih caching strategija na istoj stranici
 *
 * - Korisnici: cache: 'no-store' (SSR) - uvijek svježi podaci
 * - Postovi: cache: 'force-cache' (SSG) - keširani podaci
 */

async function ZadatakPage() {
  // SSR za korisnike - svježi podaci na svaki request
  const usersResponse = await fetch('https://jsonplaceholder.typicode.com/users', {
    cache: 'no-store'
  });
  const users = await usersResponse.json();

  // SSG za postove - keširani podaci
  const postsResponse = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=10', {
    cache: 'force-cache'
  });
  const posts = await postsResponse.json();

  const fetchTime = new Date().toLocaleString('sr-RS');

  return (
    <div className="container">
      <h1>Zadatak: SSR + SSG kombinacija</h1>

      <div className="info-box">
        <h2>Šta smo uradili?</h2>
        <ul>
          <li><strong>Korisnici (SSR):</strong> Dohvataju se na SVAKI request - {`cache: 'no-store'`}</li>
          <li><strong>Postovi (SSG):</strong> Dohvataju se JEDNOM i keširaju - {`cache: 'force-cache'`}</li>
        </ul>
      </div>

      <div className="time-box">
        <p><strong>Vrijeme renderovanja:</strong> {fetchTime}</p>
        <p className="hint">Korisnici će se osvježiti na svaki refresh, postovi ostaju isti!</p>
      </div>

      <div className="zadatak-grid">
        {/* SSR Sekcija - Korisnici */}
        <div className="section ssr-section">
          <div className="section-header">
            <h2>Korisnici (SSR - no-store)</h2>
            <span className="badge ssr">Dinamički</span>
          </div>
          <p className="section-desc">Ovi podaci se dohvataju na SVAKI request</p>

          <div className="users-list">
            {users.slice(0, 5).map(user => (
              <div key={user.id} className="user-item">
                <div className="user-avatar">{user.name.charAt(0)}</div>
                <div className="user-info">
                  <h4>{user.name}</h4>
                  <p>{user.email}</p>
                  <small>{user.company.name}</small>
                </div>
              </div>
            ))}
          </div>

          <div className="code-example">
            <code>
              {`fetch(usersUrl, { cache: 'no-store' })`}
            </code>
          </div>
        </div>

        {/* SSG Sekcija - Postovi */}
        <div className="section ssg-section">
          <div className="section-header">
            <h2>Postovi (SSG - force-cache)</h2>
            <span className="badge ssg">Statički</span>
          </div>
          <p className="section-desc">Ovi podaci se dohvataju JEDNOM i keširaju</p>

          <div className="posts-list">
            {posts.map(post => (
              <div key={post.id} className="post-item">
                <span className="post-id">#{post.id}</span>
                <div className="post-content">
                  <h4>{post.title}</h4>
                  <p>{post.body.substring(0, 80)}...</p>
                </div>
              </div>
            ))}
          </div>

          <div className="code-example">
            <code>
              {`fetch(postsUrl, { cache: 'force-cache' })`}
            </code>
          </div>
        </div>
      </div>

      <div className="zadatak-explanation">
        <h3>Zašto ova kombinacija?</h3>
        <table>
          <thead>
            <tr>
              <th>Resurs</th>
              <th>Strategija</th>
              <th>Razlog</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Korisnici</td>
              <td>SSR (no-store)</td>
              <td>Korisnici se mogu registrovati/mijenjati - trebamo svježe podatke</td>
            </tr>
            <tr>
              <td>Postovi</td>
              <td>SSG (force-cache)</td>
              <td>Postovi se rijetko mijenjaju - možemo keširati za bolje performanse</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="nav-box">
        <a href="/demo/parallel">← Nazad na Parallel demo</a>
        <a href="/">Početna →</a>
      </div>
    </div>
  );
}

export default ZadatakPage;
