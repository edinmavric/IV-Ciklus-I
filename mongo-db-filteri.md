1. $eq — jednako
   GET /students?city=Beograd
   Pronađi sve studente koji su iz Beograda

```js
if (req.query.city) filter.city = { $eq: req.query.city };
// Rezultat: { city: { $eq: "Beograd" } }
```

Napomena: često $eq i ne moraš da pišeš, dovoljno je filter.city = "Beograd".

2. $ne — nije jednako
   GET /students?excludeCity=Beograd
   Svi studenti koji nisu iz Beograda

```js
if (req.query.excludeCity) filter.city = { $ne: req.query.excludeCity };
// { city: { $ne: "Beograd" } }
```

3. $gt i $gte — veće od / veće ili jednako
   GET /students?minAge=18
   Svi studenti sa godinama ≥ 18

```js
if (req.query.minAge) filter.age = { $gte: Number(req.query.minAge) };
// { age: { $gte: 18 } }
```

GET /students?olderThan=25
Svi studenti stariji od 25

```js
if (req.query.olderThan) filter.age = { $gt: Number(req.query.olderThan) };
// { age: { $gt: 25 } }
```

4. $lt i $lte — manje od / manje ili jednako
   GET /students?maxAge=30
   Svi studenti mlađi ili jednaki 30

```js
if (req.query.maxAge) filter.age = { $lte: Number(req.query.maxAge) };
// { age: { $lte: 30 } }
```

5. $in — pripada listi vrednosti
   GET /students?cities=Beograd,Novi%20Sad
   ➡️ Svi studenti iz Beograda ili Novog Sada

```js
if (req.query.cities) {
  const cities = req.query.cities.split(',');
  filter.city = { $in: cities };
}
// { city: { $in: ["Beograd", "Novi Sad"] } }
```

6. $nin — ne pripada listi vrednosti
   GET /students?excludeCities=Niš,Subotica
   Svi koji nisu iz Niša ni iz Subotice

```js
if (req.query.excludeCities) {
  const exclude = req.query.excludeCities.split(',');
  filter.city = { $nin: exclude };
}
// { city: { $nin: ["Niš", "Subotica"] } }
```

7. $or — barem jedan uslov tačan
   GET /students?or=Beograd,Novi%20Sad
   Studenti koji su iz Beograda ili Novog Sada

```js
if (req.query.or) {
  const cities = req.query.or.split(',');
  filter.$or = cities.map(city => ({ city }));
}
// { $or: [ { city: "Beograd" }, { city: "Novi Sad" } ] }
```

8. $and — svi uslovi moraju biti tačni
   GET /students?city=Beograd&minAge=18
   Studenti koji su iz Beograda i stariji od 18

Mongoose ovo automatski spoji kao $and,
ali možeš i eksplicitno:

```js
filter.$and = [
  { city: req.query.city },
  { age: { $gte: Number(req.query.minAge) } }
];
```

9. $regex — delimično poklapanje stringa
   GET /students?nameContains=ar
   Imena koja sadrže “ar” (npr. Marko, Sara)

```js
if (req.query.nameContains) {
  filter.name = { $regex: req.query.nameContains, $options: 'i' };
}
// { name: { $regex: "ar", $options: "i" } }
```

```js
$options: 'i' znači “case-insensitive”.
```

10. $exists — provera da li polje postoji
    GET /students?hasGrade=true
    Svi studenti koji imaju polje grade

```js
if (req.query.hasGrade === 'true') filter.grade = { $exists: true };
if (req.query.hasGrade === 'false') filter.grade = { $exists: false };
// { grade: { $exists: true } }
```

11. $not — negacija uslova
    GET /students?notBeograd=true
    Svi koji nisu iz Beograda

```js
if (req.query.notBeograd === 'true')
  filter.city = { $not: { $eq: 'Beograd' } };
// { city: { $not: { $eq: "Beograd" } } }
```

12. Kombinacija više uslova
    GET /students?city=Beograd&minAge=20&maxAge=25
    Beograd + 20 ≤ age ≤ 25

```js
if (req.query.city) filter.city = req.query.city;
if (req.query.minAge || req.query.maxAge) {
  filter.age = {};
  if (req.query.minAge) filter.age.$gte = Number(req.query.minAge);
  if (req.query.maxAge) filter.age.$lte = Number(req.query.maxAge);
}
```

Rezultat:

```js
{ city: "Beograd", age: { $gte: 20, $lte: 25 } }
```

13. $sort, $limit, $skip - paginacija
    GET /students?city=Beograd&sortBy=age&order=desc&limit=5

```js
const sortField = req.query.sortBy || 'age';
const sortOrder = req.query.order === 'desc' ? -1 : 1;
const limit = Number(req.query.limit) || 10;
const skip = Number(req.query.skip) || 0;

const students = await Student.find(filter)
  .sort({ [sortField]: sortOrder })
  .skip(skip)
  .limit(limit);
```
