/**
 * Pregled svih dinamičkih ruta u Next.js
 */

export default function DynamicRoutesPage() {
  return (
    <div className="container">
      <h1>Dinamičke rute u Next.js</h1>
      <p className="subtitle">Pregled svih tipova dinamičkih ruta</p>

      {/* [param] */}
      <div className="route-section">
        <div className="route-header">
          <h2>[param]</h2>
          <span className="badge required">Obavezan</span>
        </div>

        <div className="route-content">
          <div className="route-info">
            <h3>Opis:</h3>
            <p>Hvata <strong>tačno jedan</strong> segment URL-a. Parametar je <strong>obavezan</strong>.</p>

            <h3>Folder struktura:</h3>
            <code className="folder">app/users/[id]/page.js</code>

            <h3>Pristup parametru:</h3>
            <pre className="code-block">
{`async function Page({ params }) {
  const { id } = await params;
  // id = "123"
}`}
            </pre>
          </div>

          <div className="route-examples">
            <h3>Primjeri:</h3>
            <table>
              <thead>
                <tr>
                  <th>URL</th>
                  <th>params</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="valid">
                  <td>/users/1</td>
                  <td><code>{`{ id: "1" }`}</code></td>
                  <td>✅</td>
                </tr>
                <tr className="valid">
                  <td>/users/abc</td>
                  <td><code>{`{ id: "abc" }`}</code></td>
                  <td>✅</td>
                </tr>
                <tr className="invalid">
                  <td>/users</td>
                  <td>-</td>
                  <td>❌ 404</td>
                </tr>
                <tr className="invalid">
                  <td>/users/1/posts</td>
                  <td>-</td>
                  <td>❌ 404</td>
                </tr>
              </tbody>
            </table>

            <a href="/users/1" className="btn primary">Testiraj →</a>
          </div>
        </div>
      </div>

      {/* [...param] */}
      <div className="route-section">
        <div className="route-header">
          <h2>[...param]</h2>
          <span className="badge catch-all">Catch-all</span>
        </div>

        <div className="route-content">
          <div className="route-info">
            <h3>Opis:</h3>
            <p>Hvata <strong>jedan ili više</strong> segmenata URL-a kao <strong>niz (array)</strong>. Mora imati barem jedan segment.</p>

            <h3>Folder struktura:</h3>
            <code className="folder">app/products/[...path]/page.js</code>

            <h3>Pristup parametru:</h3>
            <pre className="code-block">
{`async function Page({ params }) {
  const { path } = await params;
  // path = ["electronics", "phones"]
}`}
            </pre>
          </div>

          <div className="route-examples">
            <h3>Primjeri:</h3>
            <table>
              <thead>
                <tr>
                  <th>URL</th>
                  <th>params</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="valid">
                  <td>/products/a</td>
                  <td><code>{`{ path: ["a"] }`}</code></td>
                  <td>✅</td>
                </tr>
                <tr className="valid">
                  <td>/products/a/b</td>
                  <td><code>{`{ path: ["a","b"] }`}</code></td>
                  <td>✅</td>
                </tr>
                <tr className="valid">
                  <td>/products/a/b/c</td>
                  <td><code>{`{ path: ["a","b","c"] }`}</code></td>
                  <td>✅</td>
                </tr>
                <tr className="invalid">
                  <td>/products</td>
                  <td>-</td>
                  <td>❌ 404</td>
                </tr>
              </tbody>
            </table>

            <a href="/products/electronics/phones" className="btn primary">Testiraj →</a>
          </div>
        </div>
      </div>

      {/* [[...param]] */}
      <div className="route-section">
        <div className="route-header">
          <h2>[[...param]]</h2>
          <span className="badge optional">Opcionalni Catch-all</span>
        </div>

        <div className="route-content">
          <div className="route-info">
            <h3>Opis:</h3>
            <p>Hvata <strong>nula ili više</strong> segmenata. <strong>Dvostruke zagrade</strong> znače da je opcionalno.</p>

            <h3>Folder struktura:</h3>
            <code className="folder">app/posts/[[...slug]]/page.js</code>

            <h3>Pristup parametru:</h3>
            <pre className="code-block">
{`async function Page({ params }) {
  const { slug } = await params;
  // slug = undefined ILI ["a", "b"]
}`}
            </pre>
          </div>

          <div className="route-examples">
            <h3>Primjeri:</h3>
            <table>
              <thead>
                <tr>
                  <th>URL</th>
                  <th>params</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="valid">
                  <td>/posts</td>
                  <td><code>{`{ slug: undefined }`}</code></td>
                  <td>✅</td>
                </tr>
                <tr className="valid">
                  <td>/posts/1</td>
                  <td><code>{`{ slug: ["1"] }`}</code></td>
                  <td>✅</td>
                </tr>
                <tr className="valid">
                  <td>/posts/a/b/c</td>
                  <td><code>{`{ slug: ["a","b","c"] }`}</code></td>
                  <td>✅</td>
                </tr>
              </tbody>
            </table>

            <a href="/posts" className="btn primary">Testiraj →</a>
          </div>
        </div>
      </div>

      {/* Poređenje */}
      <div className="comparison-section">
        <h2>Poređenje svih tipova</h2>
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Tip</th>
              <th>Sintaksa</th>
              <th>Matchuje /base</th>
              <th>Matchuje /base/a</th>
              <th>Matchuje /base/a/b/c</th>
              <th>params tip</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>[param]</strong></td>
              <td><code>[id]</code></td>
              <td>❌</td>
              <td>✅</td>
              <td>❌</td>
              <td>string</td>
            </tr>
            <tr>
              <td><strong>[...param]</strong></td>
              <td><code>[...path]</code></td>
              <td>❌</td>
              <td>✅</td>
              <td>✅</td>
              <td>string[]</td>
            </tr>
            <tr>
              <td><strong>[[...param]]</strong></td>
              <td><code>[[...slug]]</code></td>
              <td>✅</td>
              <td>✅</td>
              <td>✅</td>
              <td>string[] | undefined</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Use Cases */}
      <div className="use-cases">
        <h2>Kada koristiti koji tip?</h2>
        <div className="use-cases-grid">
          <div className="use-case-card">
            <h3>[param]</h3>
            <ul>
              <li>/users/<strong>[id]</strong> - Profil korisnika</li>
              <li>/products/<strong>[productId]</strong> - Detalji proizvoda</li>
              <li>/blog/<strong>[postId]</strong> - Blog post</li>
            </ul>
          </div>
          <div className="use-case-card">
            <h3>[...param]</h3>
            <ul>
              <li>/docs/<strong>[...path]</strong> - Dokumentacija</li>
              <li>/shop/<strong>[...categories]</strong> - Kategorije</li>
              <li>/files/<strong>[...filepath]</strong> - File browser</li>
            </ul>
          </div>
          <div className="use-case-card">
            <h3>[[...param]]</h3>
            <ul>
              <li>/blog/<strong>[[...slug]]</strong> - Blog sa/bez filtera</li>
              <li>/search/<strong>[[...query]]</strong> - Pretraga</li>
              <li>/dashboard/<strong>[[...path]]</strong> - Dashboard</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="nav-box">
        <a href="/posts">← [[...slug]] ruta</a>
        <a href="/">Početna →</a>
      </div>
    </div>
  );
}
