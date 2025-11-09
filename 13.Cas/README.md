# DOMACI RADITE DO SLEDECE NEDELJE (17.11. ROK).

# Praktični Zadatak - Validacija i Kontroleri

## Zadatak

### 1. Modeli

Implementirati sledeće modele sa validacijom:

#### Employee (Zaposleni)

```javascript
{
  firstName: String,     // Obavezno, minimum 2 karaktera
  lastName: String,      // Obavezno, minimum 2 karaktera
  email: String,        // Obavezno, jedinstveno, validni email format
  position: String,     // Obavezno, enum: ['developer', 'designer', 'manager', 'hr', 'marketing']
  salary: Number,       // Obavezno, minimum 30000
  department: ObjectId, // Reference ka Department
  hireDate: Date,      // Obavezno, ne može biti u budućnosti
  isActive: Boolean,   // Default: true
  skills: [String],    // Niz veština, minimum 1
  projects: [{         // Niz projekata na kojima radi
    type: ObjectId,
    ref: 'Project'
  }]
}
```

#### Department (Odeljenje)

```javascript
{
  name: String,        // Obavezno, jedinstveno
  description: String, // Maksimum 500 karaktera
  budget: Number,      // Obavezno, minimum 0
  location: {         // Obavezna lokacija
    city: String,     // Obavezno
    country: String   // Obavezno
  },
  head: ObjectId,     // Reference ka Employee (menadžer)
  employees: [{       // Niz zaposlenih u odeljenju
    type: ObjectId,
    ref: 'Employee'
  }]
}
```

#### Project (Projekat)

```javascript
{
  name: String,          // Obavezno, jedinstveno
  description: String,   // Obavezno
  startDate: Date,       // Obavezno
  endDate: Date,        // Mora biti nakon startDate
  budget: Number,        // Obavezno, minimum 5000
  status: String,       // enum: ['planning', 'active', 'completed', 'on-hold']
  priority: Number,     // 1-5, default: 3
  department: ObjectId, // Reference ka Department
  team: [{             // Niz članova tima
    employee: {
      type: ObjectId,
      ref: 'Employee'
    },
    role: String      // Obavezno
  }]
}
```

### 2. Validatori

Za svaki model implementirati custom validatore za:

#### Employee

1. Email format
2. Plata mora biti u određenom rangu zavisno od pozicije
3. Skills mora sadržati samo jedinstvene vrednosti
4. HireDate validacija

#### Department

1. Budget validacija u odnosu na broj zaposlenih
2. Location validacija za podržane zemlje
3. Provera da li je head član department-a

#### Project

1. Date range validacija
2. Budget validacija u odnosu na department budget
3. Team size validacija (minimum 2 člana)

### 3. Kontroleri

Implementirati sledeće kontrolere sa error handling-om:

#### Employee Controllers

1. Kreiranje novog zaposlenog sa svim validacijama
2. Dodavanje veština zaposlenom
3. Promena department-a sa svim potrebnim ažuriranjima
4. Deaktivacija zaposlenog (soft delete)
5. Pretraga zaposlenih po više kriterijuma

#### Department Controllers

1. Kreiranje department-a sa validacijom budžeta
2. Dodavanje/uklanjanje zaposlenih
3. Promena department head-a
4. Izračunavanje ukupnih troškova (plate)
5. Pregled svih projekata department-a

#### Project Controllers

1. Kreiranje projekta sa validacijom tima
2. Ažuriranje status-a projekta
3. Dodavanje/uklanjanje članova tima
4. Praćenje budžeta projekta
5. Generisanje izveštaja o progresu

## Ko zavrsi sve pre roka, neka doda jos neki Model, jos neke Rute za njih i poboljsa logiku.