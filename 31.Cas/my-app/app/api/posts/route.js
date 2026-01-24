// ===========================================
// API Route - /api/posts
// ===========================================
// Ovo je tzv. "Route Handler" u Next.js
// Fajl MORA biti nazvan route.js (ili route.ts)
// ===========================================

// Simulirana baza podataka (u memoriji)
let posts = [
  { id: 1, title: "Prvi post", content: "Sadržaj prvog posta", author: "Edin" },
  { id: 2, title: "Drugi post", content: "Sadržaj drugog posta", author: "Marko" },
  { id: 3, title: "Treći post", content: "Sadržaj trećeg posta", author: "Ana" },
];

// Brojač za ID-eve
let nextId = 4;

// ===========================================
// GET - Dohvati sve postove
// ===========================================
export async function GET(request) {
  // Možemo pristupiti URL parametrima
  const { searchParams } = new URL(request.url);
  const author = searchParams.get("author");

  // Filtriranje po autoru ako je proslijeđen parametar
  let result = posts;
  if (author) {
    result = posts.filter(
      (post) => post.author.toLowerCase() === author.toLowerCase()
    );
  }

  // Vraćamo JSON response
  return Response.json({
    success: true,
    count: result.length,
    data: result,
  });
}

// ===========================================
// POST - Kreiraj novi post
// ===========================================
export async function POST(request) {
  try {
    // Čitamo body iz requesta
    const body = await request.json();

    // Validacija
    if (!body.title || !body.content) {
      return Response.json(
        { success: false, error: "Title i content su obavezni!" },
        { status: 400 }
      );
    }

    // Kreiramo novi post
    const newPost = {
      id: nextId++,
      title: body.title,
      content: body.content,
      author: body.author || "Anonimno",
      createdAt: new Date().toISOString(),
    };

    // Dodajemo u "bazu"
    posts.push(newPost);

    // Vraćamo kreirani post
    return Response.json(
      { success: true, data: newPost },
      { status: 201 } // 201 = Created
    );
  } catch (error) {
    return Response.json(
      { success: false, error: "Neispravan JSON format" },
      { status: 400 }
    );
  }
}

// ===========================================
// DELETE - Obriši sve postove (za demonstraciju)
// ===========================================
export async function DELETE() {
  posts = [];
  nextId = 1;

  return Response.json({
    success: true,
    message: "Svi postovi su obrisani",
  });
}
