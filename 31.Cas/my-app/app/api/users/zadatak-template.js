// ===========================================
// ZADATAK: API Ruta - /api/users
// ===========================================
// Implementirajte GET i POST metode
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
// Query params: ?role=admin (opciono)
// ===========================================
// Očekivani response:
// {
//   success: true,
//   count: 3,
//   data: [...]
// }
// ===========================================
export async function GET(request) {
  // TODO: Implementiraj
  // 1. Pročitaj query param "role" iz URL-a
  //    const { searchParams } = new URL(request.url);
  //    const role = searchParams.get("role");
  //
  // 2. Ako je proslijeđen role, filtriraj usere
  //
  // 3. Vrati JSON response sa success, count i data

  return Response.json({ message: "TODO: Implementiraj GET" });
}

// ===========================================
// POST - Kreiraj novog usera
// Body: { name, email, role? }
// ===========================================
// Očekivani response (201):
// {
//   success: true,
//   data: { id: 4, name: "...", email: "...", role: "user" }
// }
// ===========================================
export async function POST(request) {
  // TODO: Implementiraj
  // 1. Pročitaj body iz requesta
  //    const body = await request.json();
  //
  // 2. Validiraj da name i email postoje
  //    Vrati 400 ako nedostaju
  //
  // 3. Provjeri da email nije već zauzet
  //    Vrati 409 (Conflict) ako je zauzet
  //
  // 4. Kreiraj novog usera sa nextId++
  //
  // 5. Dodaj usera u users niz
  //
  // 6. Vrati JSON response sa statusom 201

  return Response.json({ message: "TODO: Implementiraj POST" });
}
