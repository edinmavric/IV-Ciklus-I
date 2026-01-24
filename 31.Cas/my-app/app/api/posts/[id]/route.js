// ===========================================
// Dinamička API Ruta - /api/posts/[id]
// ===========================================
// [id] je dinamički segment - hvata bilo koju vrijednost
// Npr: /api/posts/1, /api/posts/2, /api/posts/abc
// ===========================================

// Pristupamo istoj "bazi" - u stvarnom projektu ovo bi bila prava baza
// NAPOMENA: U produkciji, ovo bi trebao biti import iz database modula
let posts = [
  { id: 1, title: "Prvi post", content: "Sadržaj prvog posta", author: "Edin" },
  { id: 2, title: "Drugi post", content: "Sadržaj drugog posta", author: "Marko" },
  { id: 3, title: "Treći post", content: "Sadržaj trećeg posta", author: "Ana" },
];

// ===========================================
// GET - Dohvati jedan post po ID-u
// ===========================================
export async function GET(request, { params }) {
  // params dolazi kao drugi argument
  // VAŽNO: U Next.js 15+, params je Promise!
  const { id } = await params;

  const post = posts.find((p) => p.id === parseInt(id));

  if (!post) {
    return Response.json(
      { success: false, error: "Post nije pronađen" },
      { status: 404 }
    );
  }

  return Response.json({
    success: true,
    data: post,
  });
}

// ===========================================
// PUT - Ažuriraj cijeli post
// ===========================================
export async function PUT(request, { params }) {
  const { id } = await params;
  const postIndex = posts.findIndex((p) => p.id === parseInt(id));

  if (postIndex === -1) {
    return Response.json(
      { success: false, error: "Post nije pronađen" },
      { status: 404 }
    );
  }

  try {
    const body = await request.json();

    // PUT zamjenjuje cijeli resurs
    posts[postIndex] = {
      id: parseInt(id),
      title: body.title || "Bez naslova",
      content: body.content || "Bez sadržaja",
      author: body.author || "Anonimno",
      updatedAt: new Date().toISOString(),
    };

    return Response.json({
      success: true,
      data: posts[postIndex],
    });
  } catch (error) {
    return Response.json(
      { success: false, error: "Neispravan JSON format" },
      { status: 400 }
    );
  }
}

// ===========================================
// PATCH - Djelomično ažuriraj post
// ===========================================
export async function PATCH(request, { params }) {
  const { id } = await params;
  const postIndex = posts.findIndex((p) => p.id === parseInt(id));

  if (postIndex === -1) {
    return Response.json(
      { success: false, error: "Post nije pronađen" },
      { status: 404 }
    );
  }

  try {
    const body = await request.json();

    // PATCH ažurira samo proslijeđena polja
    posts[postIndex] = {
      ...posts[postIndex], // zadržavamo postojeća polja
      ...body, // prepisujemo sa novim vrijednostima
      id: parseInt(id), // ID se ne može mijenjati
      updatedAt: new Date().toISOString(),
    };

    return Response.json({
      success: true,
      data: posts[postIndex],
    });
  } catch (error) {
    return Response.json(
      { success: false, error: "Neispravan JSON format" },
      { status: 400 }
    );
  }
}

// ===========================================
// DELETE - Obriši post po ID-u
// ===========================================
export async function DELETE(request, { params }) {
  const { id } = await params;
  const postIndex = posts.findIndex((p) => p.id === parseInt(id));

  if (postIndex === -1) {
    return Response.json(
      { success: false, error: "Post nije pronađen" },
      { status: 404 }
    );
  }

  // Uklanjamo post iz niza
  const deletedPost = posts.splice(postIndex, 1)[0];

  return Response.json({
    success: true,
    message: "Post uspješno obrisan",
    data: deletedPost,
  });
}
