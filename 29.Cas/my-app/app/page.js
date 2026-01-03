/**
 * fetch() u Next.js
 * Glavna stranica sa navigacijom
 */

export default function Home() {
  return (
    <div className="container">
      <header className="hero">
        <h1>fetch() u Next.js</h1>
        <p className="subtitle">Caching strategije i Server-side Data Fetching</p>
      </header>
      
      <section className="strategies">
        <h2>Caching strategije</h2>
        <div className="strategies-grid">
          <div className="strategy-card ssg">
            <div className="strategy-icon">📦</div>
            <h3>force-cache (SSG)</h3>
            <p>Podaci se keširaju zauvijek. Najbrže, ali podaci mogu biti stari.</p>
            <code>{`cache: 'force-cache'`}</code>
            <a href="/demo/force-cache" className="btn">Pogledaj demo →</a>
          </div>

          <div className="strategy-card ssr">
            <div className="strategy-icon">🔄</div>
            <h3>no-store (SSR)</h3>
            <p>Svježi podaci na svaki request. Sporije, ali uvijek aktuelno.</p>
            <code>{`cache: 'no-store'`}</code>
            <a href="/demo/no-store" className="btn">Pogledaj demo →</a>
          </div>

          <div className="strategy-card isr">
            <div className="strategy-icon">⏱️</div>
            <h3>revalidate (ISR)</h3>
            <p>Balans - kešira, ali osvježava periodično.</p>
            <code>{`next: { revalidate: 60 }`}</code>
            <a href="/demo/revalidate" className="btn">Pogledaj demo →</a>
          </div>

          <div className="strategy-card parallel">
            <div className="strategy-icon">⚡</div>
            <h3>Parallel Fetching</h3>
            <p>Dohvati više resursa istovremeno sa Promise.all().</p>
            <code>{`Promise.all([...])`}</code>
            <a href="/demo/parallel" className="btn">Pogledaj demo →</a>
          </div>
        </div>
      </section>

      <section className="comparison">
        <h2>Poređenje strategija</h2>
        <table>
          <thead>
            <tr>
              <th>Strategija</th>
              <th>Kada se fetch-uje</th>
              <th>Svježina</th>
              <th>Brzina</th>
              <th>Use Case</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>force-cache</code></td>
              <td>Build time</td>
              <td>❌ Stale</td>
              <td>⚡⚡⚡</td>
              <td>Blog, dokumentacija</td>
            </tr>
            <tr>
              <td><code>no-store</code></td>
              <td>Svaki request</td>
              <td>✅ Fresh</td>
              <td>⚡</td>
              <td>Dashboard, auth</td>
            </tr>
            <tr>
              <td><code>revalidate</code></td>
              <td>Svakih N sek</td>
              <td>✅ Mostly fresh</td>
              <td>⚡⚡</td>
              <td>News, e-commerce</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="task">
        <h2>Zadatak</h2>
        <div className="task-card">
          <h3>Kombinuj SSR i SSG na istoj stranici</h3>
          <ul>
            <li>✅ SSR (no-store) za korisnike - uvijek svježi podaci</li>
            <li>✅ SSG (force-cache) za postove - keširani podaci</li>
          </ul>
          <a href="/zadatak" className="btn primary">Pogledaj rješenje →</a>
        </div>
      </section>

      <section className="dynamic-routes-section">
        <h2>Dinamičke rute</h2>
        <div className="strategies-grid">
          <div className="strategy-card">
            <div className="strategy-icon">📍</div>
            <h3>[param]</h3>
            <p>Obavezan parametar. Hvata tačno jedan segment.</p>
            <code>app/users/[id]/page.js</code>
            <a href="/users/1" className="btn">Pogledaj demo →</a>
          </div>

          <div className="strategy-card">
            <div className="strategy-icon">📂</div>
            <h3>[...param]</h3>
            <p>Catch-all. Hvata jedan ili više segmenata.</p>
            <code>app/products/[...path]/page.js</code>
            <a href="/products/electronics" className="btn">Pogledaj demo →</a>
          </div>

          <div className="strategy-card">
            <div className="strategy-icon">📁</div>
            <h3>[[...param]]</h3>
            <p>Opcionalni catch-all. Hvata nula ili više segmenata.</p>
            <code>app/posts/[[...slug]]/page.js</code>
            <a href="/posts" className="btn">Pogledaj demo →</a>
          </div>

          <div className="strategy-card">
            <div className="strategy-icon">📋</div>
            <h3>Pregled svih</h3>
            <p>Kompletno poređenje svih dinamičkih ruta.</p>
            <code>Dokumentacija</code>
            <a href="/dynamic-routes" className="btn primary">Pogledaj pregled →</a>
          </div>
        </div>
      </section>

      <section className="resources">
        <h2>Korisni linkovi</h2>
        <ul>
          <li><a href="https://nextjs.org/docs/app/building-your-application/data-fetching" target="_blank">Next.js Data Fetching Docs</a></li>
          <li><a href="https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes" target="_blank">Next.js Dynamic Routes Docs</a></li>
          <li><a href="https://jsonplaceholder.typicode.com/" target="_blank">JSONPlaceholder API</a></li>
        </ul>
      </section>
    </div>
  );
}
