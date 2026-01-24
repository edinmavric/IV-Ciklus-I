// ===========================================
// ZADATAK: API Ruta - /api/users
// ===========================================
// Studenti trebaju implementirati:
// 1. GET - dohvati sve usere (sa filterom po role)
// 2. POST - kreiraj novog usera (sa validacijom)
// ===========================================

// Simulirana baza podataka
let users = [
  { id: 1, name: "Edin Pašić", email: "edin@example.com", role: "admin" },
  { id: 2, name: "Marko Marković", email: "marko@example.com", role: "user" },
  { id: 3, name: "Ana Anić", email: "ana@example.com", role: "moderator" },
];

let nextId = 4;

// ===========================================
// GET - Dohvati sve usere
// Query params: ?role=admin
// ===========================================
export async function GET(request) {
  // TODO: Implementiraj
  // 1. Pročitaj query param "role" iz URL-a
  // 2. Ako je proslijeđen role, filtriraj usere
  // 3. Vrati JSON response sa success, count i data

  // RJEŠENJE:
  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role");

  let result = users;
  if (role) {
    result = users.filter((u) => u.role === role);
  }

  return Response.json({
    success: true,
    count: result.length,
    data: result,
  });
}

// ===========================================
// POST - Kreiraj novog usera
// Body: { name, email, role? }
// ===========================================
export async function POST(request) {
  try {
    const body = await request.json();

    // Validacija
    if (!body.name || !body.email) {
      return Response.json(
        { success: false, error: "Name i email su obavezni!" },
        { status: 400 }
      );
    }

    // Provjera da email nije zauzet
    const existingUser = users.find(
      (u) => u.email.toLowerCase() === body.email.toLowerCase()
    );
    if (existingUser) {
      return Response.json(
        { success: false, error: "Email je već zauzet!" },
        { status: 409 } // 409 = Conflict
      );
    }

    // Kreiraj novog usera
    const newUser = {
      id: nextId++,
      name: body.name,
      email: body.email.toLowerCase(),
      role: body.role || "user",
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);

    return Response.json({ success: true, data: newUser }, { status: 201 });
  } catch (error) {
    return Response.json(
      { success: false, error: "Neispravan JSON format" },
      { status: 400 }
    );
  }
}
