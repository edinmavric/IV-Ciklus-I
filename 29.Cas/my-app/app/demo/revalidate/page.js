/**
 * DEMO: revalidate (ISR - Incremental Static Regeneration)
 *
 * Podaci se keširaju, ali se automatski osvježavaju nakon određenog vremena.
 * Balans između performansi (cache) i svježine podataka.
 */

async function RevalidatePage() {
  // revalidate: 60 = osvježi podatke svakih 60 sekundi
  const response = await fetch('https://jsonplaceholder.typicode.com/comments?_limit=5', {
    next: { revalidate: 60 }
  });
  const comments = await response.json();

  // Vrijeme kada su podaci dohvaćeni
  const fetchTime = new Date().toLocaleString('sr-RS');

  return (
    <div className="container">
      <h1>revalidate Demo (ISR)</h1>

      <div className="info-box success">
        <h2>Kako radi?</h2>
        <ul>
          <li>Podaci se keširaju kao kod force-cache</li>
          <li>Ali se <strong>automatski osvježavaju</strong> nakon isteka vremena</li>
          <li>revalidate: 60 = osvježi svakih 60 sekundi</li>
          <li>Korisnik uvijek dobija keširanu verziju (brzo!)</li>
          <li>U pozadini se dohvataju novi podaci za sljedeći request</li>
        </ul>
      </div>

      <div className="code-box">
        <code>
          {`fetch(url, { next: { revalidate: 60 } })`}
        </code>
      </div>

      <div className="time-box">
        <p><strong>Vrijeme renderovanja:</strong> {fetchTime}</p>
        <p className="hint">Podaci se osvježavaju svakih 60 sekundi. Refreshuj nakon 1 minute da vidiš novo vrijeme.</p>
      </div>

      <div className="revalidate-info">
        <h3>Timeline:</h3>
        <pre>
{`t=0s     → Dohvati podatke, kešira
t=30s    → Koristi cache (brzo)
t=60s    → Cache još uvijek validan
t=61s    → Request triggeruje revalidaciju u pozadini
           Korisnik dobija stare podatke (brzo)
           Novi podaci se keširaju za sljedeći request`}
        </pre>
      </div>

      <h2>Komentari (osvježavaju se svakih 60s):</h2>
      <div className="comments-grid">
        {comments.map(comment => (
          <div key={comment.id} className="comment-card">
            <h3>{comment.name}</h3>
            <p><strong>Email:</strong> {comment.email}</p>
            <p>{comment.body}</p>
          </div>
        ))}
      </div>

      <div className="nav-box">
        <a href="/demo/no-store">← Prethodni: no-store</a>
        <a href="/demo/parallel">Sljedeći: parallel →</a>
      </div>
    </div>
  );
}

export default RevalidatePage;
