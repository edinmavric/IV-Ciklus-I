// Mock baza podataka - u produkciji bi ovo bilo MongoDB, PostgreSQL, itd.
let products = [
  {
    id: "1",
    name: "Laptop ASUS ROG",
    description: "Gaming laptop sa RTX 4080 grafickom",
    price: 2499.99,
    category: "electronics",
    stock: 15,
    createdAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    name: "iPhone 15 Pro",
    description: "Apple smartphone sa A17 Pro cipom",
    price: 1199.99,
    category: "electronics",
    stock: 50,
    createdAt: "2024-01-20T14:00:00Z",
  },
  {
    id: "3",
    name: "Nike Air Max",
    description: "Sportske patike za trcanje",
    price: 179.99,
    category: "footwear",
    stock: 100,
    createdAt: "2024-02-01T09:00:00Z",
  },
  {
    id: "4",
    name: "Samsung 4K TV 55\"",
    description: "Smart TV sa QLED tehnologijom",
    price: 899.99,
    category: "electronics",
    stock: 25,
    createdAt: "2024-02-10T16:30:00Z",
  },
  {
    id: "5",
    name: "PlayStation 5",
    description: "Sony gaming konzola",
    price: 499.99,
    category: "gaming",
    stock: 10,
    createdAt: "2024-02-15T11:00:00Z",
  },
];

export default products;
