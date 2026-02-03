// ============================================
// SEED SKRIPTA - Popunjavanje baze demo podacima
// ============================================
// Pokrenuti sa: node scripts/seed.js
// NAPOMENA: MongoDB mora biti pokrenut na localhost:27017

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// MongoDB URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blogmaster';

// ============================================
// SCHEMAS (kopija iz models/ foldera)
// ============================================

const userSchema = new mongoose.Schema({
  ime: String,
  email: { type: String, unique: true, lowercase: true },
  lozinka: String,
  uloga: { type: String, enum: ['korisnik', 'autor', 'admin'], default: 'korisnik' },
  slika: { type: String, default: '/images/default-avatar.png' },
  biografija: String,
  aktivan: { type: Boolean, default: true },
}, { timestamps: true });

const postSchema = new mongoose.Schema({
  naslov: String,
  slug: { type: String, unique: true },
  sadrzaj: String,
  izvod: String,
  slika: { type: String, default: '/images/default-post.jpg' },
  kategorija: String,
  tagovi: [String],
  autor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, default: 'objavljen' },
  brojPregleda: { type: Number, default: 0 },
  istaknut: { type: Boolean, default: false },
  vremeZaCitanje: { type: String, default: '5 min' },
  datumObjave: Date,
}, { timestamps: true });

const komentarSchema = new mongoose.Schema({
  sadrzaj: String,
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  autor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  roditeljKomentar: { type: mongoose.Schema.Types.ObjectId, ref: 'Komentar', default: null },
  odobren: { type: Boolean, default: true },
}, { timestamps: true });

// ============================================
// DEMO PODACI
// ============================================

const demoKorisnici = [
  {
    ime: 'Admin',
    email: 'admin@test.com',
    lozinka: 'admin123',
    uloga: 'admin',
    biografija: 'Administrator BlogMaster platforme. Zadužen za upravljanje sadržajem i korisnicima.',
  },
  {
    ime: 'Autor Demo',
    email: 'autor@test.com',
    lozinka: 'autor123',
    uloga: 'autor',
    biografija: 'Pisac tehničkih članaka sa fokusom na web razvoj i JavaScript.',
  },
  {
    ime: 'Korisnik Demo',
    email: 'user@test.com',
    lozinka: 'user123',
    uloga: 'korisnik',
    biografija: 'Entuzijasta programiranja koji voli učiti nove stvari.',
  },
];

const demoPostovi = [
  {
    naslov: 'Uvod u Next.js 15 - Sve što treba da znate',
    slug: 'uvod-u-nextjs-15',
    izvod: 'Kompletni vodič kroz najnoviju verziju Next.js framework-a sa praktičnim primerima i najboljim praksama.',
    sadrzaj: `
      <h2>Šta je Next.js?</h2>
      <p>Next.js je React framework koji omogućava server-side rendering, static site generation i mnogo više. U verziji 15 donosi revolucionarne promene.</p>

      <h2>Nove funkcionalnosti u Next.js 15</h2>
      <ul>
        <li><strong>App Router</strong> - Novi način organizacije ruta</li>
        <li><strong>Server Components</strong> - Komponente koje se renderuju na serveru</li>
        <li><strong>Server Actions</strong> - Direktni pozivi servera bez API-ja</li>
        <li><strong>Streaming</strong> - Progresivno učitavanje sadržaja</li>
      </ul>

      <h2>Primer Server Komponente</h2>
      <pre><code>
// app/page.js
export default async function Page() {
  const data = await fetch('https://api.example.com/data');
  return <div>{data}</div>;
}
      </code></pre>

      <h2>Zaključak</h2>
      <p>Next.js 15 donosi značajna poboljšanja u performansama i developer experience-u. Preporučujemo da ga isprobate u vašem sledećem projektu.</p>
    `,
    kategorija: 'tehnologija',
    tagovi: ['nextjs', 'react', 'javascript', 'framework'],
    istaknut: true,
  },
  {
    naslov: 'MongoDB i Mongoose - Kompletni vodič',
    slug: 'mongodb-mongoose-vodic',
    izvod: 'Naučite kako da koristite MongoDB sa Mongoose ODM-om u vašim Node.js aplikacijama.',
    sadrzaj: `
      <h2>Šta je MongoDB?</h2>
      <p>MongoDB je NoSQL baza podataka koja čuva podatke u JSON-sličnim dokumentima. Idealna je za moderne web aplikacije.</p>

      <h2>Mongoose ODM</h2>
      <p>Mongoose je Object Document Mapper koji olakšava rad sa MongoDB u Node.js okruženju.</p>

      <h2>Definisanje Schema</h2>
      <pre><code>
const userSchema = new mongoose.Schema({
  ime: { type: String, required: true },
  email: { type: String, unique: true },
  lozinka: { type: String, select: false },
});
      </code></pre>

      <h2>CRUD Operacije</h2>
      <p>Sa Mongoose-om možete jednostavno izvršavati Create, Read, Update i Delete operacije.</p>
    `,
    kategorija: 'programiranje',
    tagovi: ['mongodb', 'mongoose', 'nodejs', 'baza-podataka'],
    istaknut: false,
  },
  {
    naslov: 'Server Actions u Next.js - Praktični primeri',
    slug: 'server-actions-nextjs',
    izvod: 'Detaljno objašnjenje Server Actions funkcionalnosti sa realnim primerima forme i validacije.',
    sadrzaj: `
      <h2>Šta su Server Actions?</h2>
      <p>Server Actions su asinhroni funkcije koje se izvršavaju na serveru. Mogu se pozvati direktno iz komponenti bez potrebe za API rutama.</p>

      <h2>Kreiranje Server Action</h2>
      <pre><code>
'use server';

export async function kreirajPost(formData) {
  const naslov = formData.get('naslov');
  // Validacija i čuvanje u bazu
  return { success: true };
}
      </code></pre>

      <h2>Korišćenje sa useActionState</h2>
      <p>Hook useActionState omogućava praćenje stanja forme i prikaz grešaka.</p>
    `,
    kategorija: 'tutorial',
    tagovi: ['nextjs', 'server-actions', 'forms', 'react'],
    istaknut: false,
  },
  {
    naslov: 'Autentifikacija sa NextAuth v5',
    slug: 'autentifikacija-nextauth-v5',
    izvod: 'Implementacija kompletnog auth sistema sa NextAuth v5, JWT tokenima i zaštitom ruta.',
    sadrzaj: `
      <h2>NextAuth v5 - Nova generacija</h2>
      <p>NextAuth v5 donosi značajne promene u API-ju i načinu konfiguracije. Evo kako da ga implementirate.</p>

      <h2>Konfiguracija</h2>
      <pre><code>
// auth.js
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        // Verifikacija korisnika
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    }
  }
});
      </code></pre>
    `,
    kategorija: 'web-razvoj',
    tagovi: ['nextauth', 'autentifikacija', 'jwt', 'sigurnost'],
    istaknut: true,
  },
  {
    naslov: 'SEO Optimizacija u Next.js',
    slug: 'seo-optimizacija-nextjs',
    izvod: 'Naučite kako da optimizujete vašu Next.js aplikaciju za pretraživače korišćenjem Metadata API-ja.',
    sadrzaj: `
      <h2>Metadata API</h2>
      <p>Next.js pruža moćan Metadata API za definisanje SEO metapodataka.</p>

      <h2>Statička Metadata</h2>
      <pre><code>
export const metadata = {
  title: 'Moj Blog',
  description: 'Opisi vaše stranice',
  openGraph: {
    title: 'Moj Blog',
    images: ['/og-image.jpg'],
  },
};
      </code></pre>

      <h2>Dinamička Metadata</h2>
      <p>Za dinamičke stranice koristite generateMetadata funkciju.</p>
    `,
    kategorija: 'web-razvoj',
    tagovi: ['seo', 'nextjs', 'metadata', 'optimizacija'],
    istaknut: false,
  },
];

// ============================================
// SEED FUNKCIJA
// ============================================

async function seed() {
  try {
    console.log('🌱 Pokretanje seed skripte...\n');

    // Konekcija na MongoDB
    console.log('📦 Povezivanje na MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Povezano na MongoDB\n');

    // Registruj modele
    const User = mongoose.models.User || mongoose.model('User', userSchema);
    const Post = mongoose.models.Post || mongoose.model('Post', postSchema);
    const Komentar = mongoose.models.Komentar || mongoose.model('Komentar', komentarSchema);

    // Očisti postojeće podatke
    console.log('🗑️  Brisanje postojećih podataka...');
    await User.deleteMany({});
    await Post.deleteMany({});
    await Komentar.deleteMany({});
    console.log('✅ Podaci obrisani\n');

    // Kreiraj korisnike
    console.log('👤 Kreiranje korisnika...');
    const kreiraniKorisnici = [];
    for (const korisnik of demoKorisnici) {
      const hashedPassword = await bcrypt.hash(korisnik.lozinka, 12);
      const noviKorisnik = await User.create({
        ...korisnik,
        lozinka: hashedPassword,
      });
      kreiraniKorisnici.push(noviKorisnik);
      console.log(`   ✅ ${korisnik.ime} (${korisnik.email})`);
    }
    console.log('');

    // Pronađi autora za postove (admin ili autor)
    const autorZaPostove = kreiraniKorisnici.find(k => k.uloga === 'autor') || kreiraniKorisnici[0];

    // Kreiraj postove
    console.log('📝 Kreiranje postova...');
    const kreiraniPostovi = [];
    for (const post of demoPostovi) {
      const noviPost = await Post.create({
        ...post,
        autor: autorZaPostove._id,
        datumObjave: new Date(),
        brojPregleda: Math.floor(Math.random() * 500) + 50,
      });
      kreiraniPostovi.push(noviPost);
      console.log(`   ✅ ${post.naslov}`);
    }
    console.log('');

    // Kreiraj komentare
    console.log('💬 Kreiranje komentara...');
    const demoKomentari = [
      'Odličan članak! Baš ono što sam tražio.',
      'Hvala na detaljnom objašnjenju, sada mi je jasnije.',
      'Možete li dodati još primera?',
      'Ovo mi je pomoglo da rešim problem. Hvala!',
      'Sjajan tutorial, jedva čekam sledeći.',
    ];

    const korisnikZaKomentare = kreiraniKorisnici.find(k => k.uloga === 'korisnik') || kreiraniKorisnici[2];

    for (const post of kreiraniPostovi.slice(0, 3)) {
      const brojKomentara = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < brojKomentara; i++) {
        await Komentar.create({
          sadrzaj: demoKomentari[Math.floor(Math.random() * demoKomentari.length)],
          post: post._id,
          autor: korisnikZaKomentare._id,
        });
      }
      console.log(`   ✅ Komentari za: ${post.naslov}`);
    }
    console.log('');

    // Završetak
    console.log('═'.repeat(50));
    console.log('✅ SEED USPEŠNO ZAVRŠEN!\n');
    console.log('📊 Statistika:');
    console.log(`   - Korisnici: ${kreiraniKorisnici.length}`);
    console.log(`   - Postovi: ${kreiraniPostovi.length}`);
    console.log(`   - Komentari: ${await Komentar.countDocuments()}`);
    console.log('');
    console.log('🔐 Demo kredencijali:');
    console.log('   Admin:    admin@test.com / admin123');
    console.log('   Autor:    autor@test.com / autor123');
    console.log('   Korisnik: user@test.com / user123');
    console.log('═'.repeat(50));

  } catch (error) {
    console.error('❌ Greška pri seed-u:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Diskonektovano sa MongoDB');
    process.exit(0);
  }
}

// Pokreni seed
seed();
