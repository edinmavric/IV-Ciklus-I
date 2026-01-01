// Next.js 13+ App Router - SSR (dynamic rendering)
// Ovo je Server Component - default ponašanje

async function ProductPage({ params }) {
  // Ovo se izvršava na SERVERU pri SVAKOM requestu
  const response = await fetch(
    `https://api.example.com/products/${params.id}`,
    {
      cache: 'no-store', // Forsira SSR - svaki put svež podatak
    }
  );
  const product = await response.json();

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <p>Cena: {product.price} RSD</p>
    </div>
  );
}

export default ProductPage;
