| Validator                 | Primer                                 | Opis                                     |
| ------------------------- | -------------------------------------- | ---------------------------------------- |
| `required`                | `{ type: String, required: true }`     | Polje mora biti popunjeno                |
| `minlength` / `maxlength` | `{ minLength: 3, maxLength: 20 }`      | Ograničava dužinu stringa                |
| `min` / `max`             | `{ min: 10, max: 100 }`                | Ograničava brojeve                       |
| `enum`                    | `{ enum: ['A', 'B', 'C'] }`            | Dozvoljene vrednosti                     |
| `match`                   | `{ match: /regex/ }`                   | Mora odgovarati regex izrazu             |
| `validate`                | `{ validate: v => v.startsWith('X') }` | Custom validator                         |
| `unique`                  | `{ unique: true }`                     | Garantuje jedinstvenost u bazi           |
| `default`                 | `{ default: Date.now }`                | Automatska vrednost ako nije data        |
| `trim`                    | `{ trim: true }`                       | Briše razmake na početku/kraju stringa   |
| `lowercase` / `uppercase` | `{ lowercase: true }`                  | Automatski konvertuje string             |
| `immutable`               | `{ immutable: true }`                  | Polje se ne može menjati nakon kreiranja |
