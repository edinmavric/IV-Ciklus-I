/**
 * ═══════════════════════════════════════════════════════════════════
 * MIGRATION 001 - Initial Indexes
 * ═══════════════════════════════════════════════════════════════════
 * Kreira početne indekse za sve kolekcije.
 *
 * UP:   Kreira indekse
 * DOWN: Briše indekse (rollback)
 * ═══════════════════════════════════════════════════════════════════
 */

export const version = 1;
export const name = "initial_indexes";
export const description = "Kreira početne indekse za products, users, orders, sessions";

/**
 * UP - Kreiranje indeksa
 */
export const up = async (db) => {
  console.log("  Creating indexes...\n");

  // ─────────────────────────────────────────────────────────────────
  // PRODUCTS
  // ─────────────────────────────────────────────────────────────────
  const products = db.collection("products");

  await products.createIndex(
    { sku: 1 },
    { unique: true, name: "idx_products_sku_unique" }
  );
  console.log("  ✓ products: idx_products_sku_unique");

  await products.createIndex(
    { category: 1 },
    { name: "idx_products_category" }
  );
  console.log("  ✓ products: idx_products_category");

  await products.createIndex(
    { category: 1, price: -1 },
    { name: "idx_products_category_price" }
  );
  console.log("  ✓ products: idx_products_category_price");

  await products.createIndex(
    { name: "text", description: "text" },
    { name: "idx_products_text_search", weights: { name: 10, description: 5 } }
  );
  console.log("  ✓ products: idx_products_text_search");

  // ─────────────────────────────────────────────────────────────────
  // USERS
  // ─────────────────────────────────────────────────────────────────
  const users = db.collection("users");

  // email i username su unique u schema, ali za sigurnost:
  await users.createIndex(
    { email: 1 },
    { unique: true, name: "idx_users_email_unique" }
  );
  console.log("  ✓ users: idx_users_email_unique");

  await users.createIndex(
    { username: 1 },
    { unique: true, name: "idx_users_username_unique" }
  );
  console.log("  ✓ users: idx_users_username_unique");

  await users.createIndex(
    { role: 1, createdAt: -1 },
    { name: "idx_users_role_created" }
  );
  console.log("  ✓ users: idx_users_role_created");

  // ─────────────────────────────────────────────────────────────────
  // ORDERS
  // ─────────────────────────────────────────────────────────────────
  const orders = db.collection("orders");

  await orders.createIndex(
    { orderNumber: 1 },
    { unique: true, name: "idx_orders_number_unique" }
  );
  console.log("  ✓ orders: idx_orders_number_unique");

  await orders.createIndex(
    { userId: 1 },
    { name: "idx_orders_user" }
  );
  console.log("  ✓ orders: idx_orders_user");

  await orders.createIndex(
    { userId: 1, status: 1 },
    { name: "idx_orders_user_status" }
  );
  console.log("  ✓ orders: idx_orders_user_status");

  await orders.createIndex(
    { status: 1, createdAt: 1 },
    { name: "idx_orders_status_date" }
  );
  console.log("  ✓ orders: idx_orders_status_date");

  // ─────────────────────────────────────────────────────────────────
  // SESSIONS
  // ─────────────────────────────────────────────────────────────────
  const sessions = db.collection("sessions");

  await sessions.createIndex(
    { token: 1 },
    { unique: true, name: "idx_sessions_token_unique" }
  );
  console.log("  ✓ sessions: idx_sessions_token_unique");

  await sessions.createIndex(
    { expiresAt: 1 },
    { expireAfterSeconds: 0, name: "idx_sessions_ttl" }
  );
  console.log("  ✓ sessions: idx_sessions_ttl");

  await sessions.createIndex(
    { userId: 1 },
    { name: "idx_sessions_user" }
  );
  console.log("  ✓ sessions: idx_sessions_user");

  console.log("\n  All indexes created!");
};

/**
 * DOWN - Rollback (brisanje indeksa)
 */
export const down = async (db) => {
  console.log("  Dropping indexes...\n");

  const indexesToDrop = [
    // Products
    { collection: "products", name: "idx_products_sku_unique" },
    { collection: "products", name: "idx_products_category" },
    { collection: "products", name: "idx_products_category_price" },
    { collection: "products", name: "idx_products_text_search" },
    // Users
    { collection: "users", name: "idx_users_email_unique" },
    { collection: "users", name: "idx_users_username_unique" },
    { collection: "users", name: "idx_users_role_created" },
    // Orders
    { collection: "orders", name: "idx_orders_number_unique" },
    { collection: "orders", name: "idx_orders_user" },
    { collection: "orders", name: "idx_orders_user_status" },
    { collection: "orders", name: "idx_orders_status_date" },
    // Sessions
    { collection: "sessions", name: "idx_sessions_token_unique" },
    { collection: "sessions", name: "idx_sessions_ttl" },
    { collection: "sessions", name: "idx_sessions_user" },
  ];

  for (const { collection, name } of indexesToDrop) {
    try {
      await db.collection(collection).dropIndex(name);
      console.log(`  ✓ ${collection}: Dropped ${name}`);
    } catch (e) {
      console.log(`  ⚠ ${collection}: ${name} not found (skipped)`);
    }
  }

  console.log("\n  Rollback complete!");
};
