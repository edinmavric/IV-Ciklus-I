/**
 * Glavna stranica - Forms, Server Actions & Mutations
 *
 * Ovo je Server Component (default u Next.js App Router).
 * Prikazuje navigaciju do svih demo stranica za ovaj čas.
 */

export default function Home() {
  return (
    <div className="container">
      {/* Hero sekcija */}
      <header className="hero">
        <h1>Forms, Server Actions & Mutations</h1>
        <p className="subtitle">
          Naučite kako raditi sa formama u Next.js bez API endpointa
        </p>
      </header>

      {/* Sekcija: Problem klasičnih formi */}
      <section>
        <h2>Problem klasičnih formi</h2>
        <div className="cards-grid">
          <div className="card">
            <div className="card-icon">😫</div>
            <h3>Puno Boilerplate-a</h3>
            <p>
              useState za svako polje, onChange handleri, loading stanje,
              error handling... Previše koda za jednostavnu formu.
            </p>
            <code>
              {`const [email, setEmail] = useState('')
const [loading, setLoading] = useState(false)
const [error, setError] = useState(null)`}
            </code>
          </div>

          <div className="card">
            <div className="card-icon">🔌</div>
            <h3>API Endpoint</h3>
            <p>
              Moramo kreirati poseban API route za svaku formu.
              Dupla validacija - client i server side.
            </p>
            <code>
              {`// app/api/login/route.js
export async function POST(request) {
  const data = await request.json()
  // validacija, baza...
}`}
            </code>
          </div>

          <div className="card">
            <div className="card-icon">⏳</div>
            <h3>JavaScript obavezan</h3>
            <p>
              Forma ne radi dok se JavaScript ne učita.
              Loše za spore konekcije i SEO.
            </p>
            <code>
              {`// Korisnik čeka...
[Loading JS...] → [Parse] → [Execute]
// Tek onda forma radi`}
            </code>
          </div>
        </div>
      </section>

      {/* Sekcija: Server Actions */}
      <section>
        <h2>Rješenje: Server Actions</h2>
        <div className="cards-grid">
          <div className="card">
            <div className="card-icon">🚀</div>
            <h3>Server Actions</h3>
            <p>
              Async funkcije koje se izvršavaju na serveru.
              Nema potrebe za API endpointima!
            </p>
            <code>
              {`"use server"

export async function login(formData) {
  const email = formData.get('email')
  // Direktno na serveru!
}`}
            </code>
            <a href="/demo/server-action" className="btn primary">
              Pogledaj demo →
            </a>
          </div>

          <div className="card">
            <div className="card-icon">⏳</div>
            <h3>useFormStatus</h3>
            <p>
              React hook za praćenje stanja forme.
              Prikazuje loading indikator dok se forma šalje.
            </p>
            <code>
              {`const { pending } = useFormStatus()

<button disabled={pending}>
  {pending ? 'Šaljem...' : 'Pošalji'}
</button>`}
            </code>
            <a href="/demo/form-status" className="btn primary">
              Pogledaj demo →
            </a>
          </div>

          <div className="card">
            <div className="card-icon">📊</div>
            <h3>useActionState</h3>
            <p>
              Hook za čitanje rezultata Server Action-a.
              Omogućava prikazivanje grešaka i poruka.
            </p>
            <code>
              {`const [state, formAction] = useActionState(
  serverAction,
  initialState
)`}
            </code>
            <a href="/demo/action-state" className="btn primary">
              Pogledaj demo →
            </a>
          </div>
        </div>
      </section>

      {/* Poređenje */}
      <section>
        <h2>Poređenje pristupa</h2>
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Aspekt</th>
              <th>Tradicionalno (API Route)</th>
              <th>Server Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Broj fajlova</td>
              <td>2+ (page + api route)</td>
              <td>1-2 (page + actions)</td>
            </tr>
            <tr>
              <td>Boilerplate</td>
              <td>Puno (fetch, headers, body)</td>
              <td>Malo (samo action)</td>
            </tr>
            <tr>
              <td>Validacija</td>
              <td>Client + Server (duplo)</td>
              <td>Samo Server (sigurnije)</td>
            </tr>
            <tr>
              <td>Radi bez JS</td>
              <td>❌ Ne</td>
              <td>✅ Da (Progressive Enhancement)</td>
            </tr>
            <tr>
              <td>Caching</td>
              <td>Ručno</td>
              <td>Automatski integrirano</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Zadatak */}
      <section>
        <h2>Zadatak</h2>
        <div className="task-card">
          <h3>Forma za kreiranje posta (bez API-ja)</h3>
          <p>Kreiraj formu sa sljedećim poljima:</p>
          <ul>
            <li>✅ Naslov (min 5 karaktera)</li>
            <li>✅ Kategorija (select)</li>
            <li>✅ Sadržaj (textarea, min 20 karaktera)</li>
            <li>✅ Server-side validacija</li>
            <li>✅ Prikaz grešaka ispod polja</li>
            <li>✅ Loading stanje tokom slanja</li>
          </ul>
          <a href="/zadatak" className="btn primary">
            Pogledaj rješenje →
          </a>
        </div>
      </section>

      {/* Korisni linkovi */}
      <section className="resources">
        <h2>Korisni linkovi</h2>
        <ul>
          <li>
            <a
              href="https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations"
              target="_blank"
              rel="noopener noreferrer"
            >
              Next.js Server Actions Docs
            </a>
          </li>
          <li>
            <a
              href="https://react.dev/reference/react-dom/hooks/useFormStatus"
              target="_blank"
              rel="noopener noreferrer"
            >
              React useFormStatus Docs
            </a>
          </li>
          <li>
            <a
              href="https://react.dev/reference/react/useActionState"
              target="_blank"
              rel="noopener noreferrer"
            >
              React useActionState Docs
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
}
