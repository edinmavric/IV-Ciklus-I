/**
 * DEMO: no-store (SSR - Server Side Rendering)
 *
 * Podaci se dohvataju NA SVAKI REQUEST - uvijek svježi podaci.
 * Nema keširanja.
 */

async function NoStorePage() {
  // no-store = nikad ne kešira, uvijek svjež fetch
  const response = await fetch('https://jsonplaceholder.typicode.com/users?_limit=5', {
    cache: 'no-store'
  });
  const users = await response.json();

  // Vrijeme kada su podaci dohvaćeni - promijenit će se na svaki refresh!
  const fetchTime = new Date().toLocaleString('sr-RS');

  return (
    <div className="container">
      <h1>no-store Demo (SSR)</h1>

      <div className="info-box warning">
        <h2>Kako radi?</h2>
        <ul>
          <li>Podaci se dohvataju na <strong>SVAKI REQUEST</strong></li>
          <li>Nema keširanja - uvijek svježi podaci</li>
          <li>Sporije od keširanih podataka</li>
          <li>Idealno za: korisnički dashboard, profil, real-time podatke</li>
        </ul>
      </div>

      <div className="code-box">
        <code>
          {`fetch(url, { cache: 'no-store' })`}
        </code>
      </div>

      <div className="time-box highlight">
        <p><strong>Vrijeme renderovanja:</strong> {fetchTime}</p>
        <p className="hint">Refreshuj stranicu - vrijeme će se PROMIJENITI (novi fetch svaki put)</p>
      </div>

      <h2>Korisnici (svježi podaci):</h2>
      <div className="users-grid">
        {users.map(user => (
          <div key={user.id} className="user-card">
            <h3>{user.name}</h3>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Kompanija:</strong> {user.company.name}</p>
            <p><strong>Grad:</strong> {user.address.city}</p>
          </div>
        ))}
      </div>

      <div className="nav-box">
        <a href="/demo/force-cache">← Prethodni: force-cache</a>
        <a href="/demo/revalidate">Sljedeći: revalidate →</a>
      </div>
    </div>
  );
}

export default NoStorePage;
