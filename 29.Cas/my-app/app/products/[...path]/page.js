/**
 * CATCH-ALL RUTA: [...path] - Hvata SVE segmente (obavezno min 1)
 *
 * Folder: app/products/[...path]/page.js
 *
 * Matchuje:
 *   ✅ /products/electronics
 *   ✅ /products/electronics/phones
 *   ✅ /products/electronics/phones/iphone
 *   ❌ /products          (404 - mora imati barem jedan segment)
 */

async function ProductsPage({ params }) {
  const { path } = await params;

  // path je UVIJEK niz (array)
  // /products/a/b/c → path = ["a", "b", "c"]

  // Simuliraj kategorije proizvoda
  const categories = {
    'electronics': { name: 'Elektronika', icon: '🔌', description: 'Telefoni, laptopi, TV...' },
    'phones': { name: 'Telefoni', icon: '📱', description: 'Pametni telefoni' },
    'laptops': { name: 'Laptopi', icon: '💻', description: 'Prenosni računari' },
    'clothing': { name: 'Odjeća', icon: '👕', description: 'Muška i ženska odjeća' },
    'shoes': { name: 'Obuća', icon: '👟', description: 'Patike, cipele...' },
    'books': { name: 'Knjige', icon: '📚', description: 'Beletristika, stručne...' },
  };

  // Dohvati mock proizvode
  const response = await fetch('https://jsonplaceholder.typicode.com/photos?_limit=6', {
    cache: 'force-cache'
  });
  const products = await response.json();

  // Kreiraj breadcrumb
  const breadcrumbs = path.map((segment, index) => ({
    name: categories[segment]?.name || segment,
    path: '/products/' + path.slice(0, index + 1).join('/')
  }));

  return (
    <div className="container">
      <h1>Catch-All ruta: [...path]</h1>

      <div className="info-box warning">
        <h2>Kako radi [...path]?</h2>
        <ul>
          <li><strong>Folder:</strong> app/products/[...path]/page.js</li>
          <li><strong>Hvata SVE segmente</strong> kao niz (array)</li>
          <li><strong>Minimum 1 segment</strong> - /products samo daje 404</li>
          <li><strong>params.path</strong> = {JSON.stringify(path)}</li>
        </ul>
      </div>

      <div className="code-box">
        <h3>Primjeri URL-ova:</h3>
        <pre>
{`/products/electronics           → path = ["electronics"]           ✅
/products/electronics/phones    → path = ["electronics", "phones"] ✅
/products/a/b/c/d               → path = ["a", "b", "c", "d"]      ✅
/products                       → 404 (nema segmenata)             ❌`}
        </pre>
      </div>

      <div className="current-path">
        <h3>Trenutni path:</h3>
        <div className="path-display">
          <code>params.path = {JSON.stringify(path)}</code>
        </div>

        <div className="breadcrumb">
          <a href="/products/electronics">products</a>
          {breadcrumbs.map((crumb, i) => (
            <span key={i}>
              <span className="separator">/</span>
              <a href={crumb.path}>{crumb.name}</a>
            </span>
          ))}
        </div>
      </div>

      <div className="path-segments">
        <h3>Segmenti ({path.length}):</h3>
        <div className="segments-grid">
          {path.map((segment, index) => (
            <div key={index} className="segment-card">
              <span className="segment-index">[{index}]</span>
              <span className="segment-value">"{segment}"</span>
              {categories[segment] && (
                <span className="segment-icon">{categories[segment].icon}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <h3>Proizvodi u ovoj kategoriji:</h3>
      <div className="products-grid">
        {products.map(product => (
          <div key={product.id} className="product-card">
            <img src={product.thumbnailUrl} alt={product.title} />
            <h4>Proizvod #{product.id}</h4>
            <p>{product.title.substring(0, 30)}...</p>
          </div>
        ))}
      </div>

      <div className="test-links">
        <h3>Testiraj različite putanje:</h3>
        <div className="links-grid">
          <a href="/products/electronics">electronics</a>
          <a href="/products/electronics/phones">electronics/phones</a>
          <a href="/products/electronics/phones/iphone">electronics/phones/iphone</a>
          <a href="/products/clothing">clothing</a>
          <a href="/products/clothing/shoes">clothing/shoes</a>
          <a href="/products/books/fiction/fantasy">books/fiction/fantasy</a>
        </div>
      </div>

      <div className="nav-box">
        <a href="/users/1">← [id] ruta</a>
        <a href="/posts">[[...slug]] ruta →</a>
      </div>
    </div>
  );
}

export default ProductsPage;
