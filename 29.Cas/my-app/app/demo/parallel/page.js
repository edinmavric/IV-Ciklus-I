/**
 * DEMO: Parallel Fetching
 *
 * Dohvatanje više resursa ISTOVREMENO umjesto jednog po jednog.
 * Dramatično poboljšava performanse!
 */

async function ParallelPage() {
  const startTime = Date.now();

  // ✅ PARALELNO dohvatanje - svi fetch-evi počinju istovremeno
  const [usersResponse, postsResponse, commentsResponse] = await Promise.all([
    fetch('https://jsonplaceholder.typicode.com/users?_limit=3', { cache: 'no-store' }),
    fetch('https://jsonplaceholder.typicode.com/posts?_limit=3', { cache: 'no-store' }),
    fetch('https://jsonplaceholder.typicode.com/comments?_limit=3', { cache: 'no-store' })
  ]);

  const [users, posts, comments] = await Promise.all([
    usersResponse.json(),
    postsResponse.json(),
    commentsResponse.json()
  ]);

  const endTime = Date.now();
  const duration = endTime - startTime;
  const fetchTime = new Date().toLocaleString('sr-RS');

  return (
    <div className="container">
      <h1>Parallel Fetching Demo</h1>

      <div className="info-box success">
        <h2>Zašto paralelno?</h2>
        <ul>
          <li><strong>Sekvencijalno:</strong> vrijeme1 + vrijeme2 + vrijeme3 = 3s</li>
          <li><strong>Paralelno:</strong> MAX(vrijeme1, vrijeme2, vrijeme3) = 1s</li>
          <li>Promise.all() čeka da se SVI završe</li>
          <li>3x brže učitavanje!</li>
        </ul>
      </div>

      <div className="code-box">
        <h3>❌ LOŠE - Sekvencijalno:</h3>
        <pre>
{`const users = await fetch('/users').then(r => r.json());
const posts = await fetch('/posts').then(r => r.json());
const comments = await fetch('/comments').then(r => r.json());
// Ukupno vrijeme: 1s + 1s + 1s = 3s`}
        </pre>
      </div>

      <div className="code-box success">
        <h3>✅ DOBRO - Paralelno:</h3>
        <pre>
{`const [users, posts, comments] = await Promise.all([
  fetch('/users').then(r => r.json()),
  fetch('/posts').then(r => r.json()),
  fetch('/comments').then(r => r.json())
]);
// Ukupno vrijeme: max(1s, 1s, 1s) = 1s`}
        </pre>
      </div>

      <div className="time-box highlight">
        <p><strong>Vrijeme učitavanja:</strong> {duration}ms</p>
        <p><strong>Dohvaćeni resursi:</strong> {users.length} korisnika, {posts.length} postova, {comments.length} komentara</p>
        <p><strong>Vrijeme renderovanja:</strong> {fetchTime}</p>
      </div>

      <div className="parallel-grid">
        <div className="section">
          <h2>Korisnici ({users.length})</h2>
          {users.map(user => (
            <div key={user.id} className="mini-card">
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </div>
          ))}
        </div>

        <div className="section">
          <h2>Postovi ({posts.length})</h2>
          {posts.map(post => (
            <div key={post.id} className="mini-card">
              <strong>#{post.id}</strong>
              <span>{post.title.substring(0, 30)}...</span>
            </div>
          ))}
        </div>

        <div className="section">
          <h2>Komentari ({comments.length})</h2>
          {comments.map(comment => (
            <div key={comment.id} className="mini-card">
              <strong>{comment.name.substring(0, 20)}...</strong>
              <span>{comment.email}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="nav-box">
        <a href="/demo/revalidate">← Prethodni: revalidate</a>
        <a href="/zadatak">Zadatak →</a>
      </div>
    </div>
  );
}

export default ParallelPage;
