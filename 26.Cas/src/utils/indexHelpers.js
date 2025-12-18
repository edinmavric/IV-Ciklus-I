// ═══════════════════════════════════════════════════════════════════
// INDEX HELPERS - Utility funkcije za rad sa indeksima
// ═══════════════════════════════════════════════════════════════════

/**
 * Proveri da li indeks postoji na kolekciji
 * @param {Model} Model - Mongoose model
 * @param {string} indexName - Ime indeksa
 * @returns {Promise<boolean>}
 */
export const indexExists = async (Model, indexName) => {
  const indexes = await Model.collection.indexes();
  return indexes.some((idx) => idx.name === indexName);
};

/**
 * Kreiraj indeks samo ako ne postoji
 * @param {Model} Model - Mongoose model
 * @param {Object} keys - Ključevi indeksa { field: 1 }
 * @param {Object} options - Opcije indeksa
 * @returns {Promise<{created: boolean, name: string}>}
 */
export const ensureIndex = async (Model, keys, options = {}) => {
  const name = options.name || Object.keys(keys).map(k => `${k}_${keys[k]}`).join("_");

  if (await indexExists(Model, name)) {
    return { created: false, name, message: "Index already exists" };
  }

  await Model.collection.createIndex(keys, { ...options, name });
  return { created: true, name, message: "Index created" };
};

/**
 * Obriši indeks ako postoji
 * @param {Model} Model - Mongoose model
 * @param {string} indexName - Ime indeksa
 * @returns {Promise<{dropped: boolean, name: string}>}
 */
export const dropIndexIfExists = async (Model, indexName) => {
  if (indexName === "_id_") {
    return { dropped: false, name: indexName, message: "Cannot drop _id index" };
  }

  if (await indexExists(Model, indexName)) {
    await Model.collection.dropIndex(indexName);
    return { dropped: true, name: indexName, message: "Index dropped" };
  }

  return { dropped: false, name: indexName, message: "Index does not exist" };
};

/**
 * Lista svih indeksa sa detaljima
 * @param {Model} Model - Mongoose model
 * @returns {Promise<Array>}
 */
export const listIndexes = async (Model) => {
  const indexes = await Model.collection.indexes();
  let stats;

  try {
    stats = await Model.collection.stats();
  } catch (e) {
    stats = { indexSizes: {} };
  }

  return indexes.map((idx) => ({
    name: idx.name,
    keys: idx.key,
    unique: idx.unique || false,
    sparse: idx.sparse || false,
    partial: idx.partialFilterExpression || null,
    ttl: idx.expireAfterSeconds != null ? `${idx.expireAfterSeconds}s` : null,
    size: stats.indexSizes?.[idx.name]
      ? `${(stats.indexSizes[idx.name] / 1024).toFixed(2)} KB`
      : "N/A",
  }));
};

/**
 * Statistika korišćenja indeksa
 * @param {Model} Model - Mongoose model
 * @returns {Promise<Array>}
 */
export const getIndexStats = async (Model) => {
  const stats = await Model.collection.aggregate([{ $indexStats: {} }]).toArray();

  return stats.map((s) => ({
    name: s.name,
    timesUsed: s.accesses.ops,
    since: s.accesses.since,
  }));
};

/**
 * Pronađi nekorišćene indekse
 * @param {Model} Model - Mongoose model
 * @returns {Promise<Array>}
 */
export const findUnusedIndexes = async (Model) => {
  const stats = await getIndexStats(Model);
  return stats.filter((s) => s.timesUsed === 0 && s.name !== "_id_");
};

/**
 * Uporedi indekse u Schema sa indeksima u bazi
 * @param {Model} Model - Mongoose model
 * @returns {Promise<Object>}
 */
export const compareIndexes = async (Model) => {
  // Indeksi definisani u Schema
  const schemaIndexes = Model.schema.indexes().map(([keys, options]) => ({
    keys,
    name: options?.name || Object.keys(keys).map(k => `${k}_${keys[k]}`).join("_"),
    options,
  }));

  // Indeksi u bazi
  const dbIndexes = await Model.collection.indexes();
  const dbIndexNames = dbIndexes.map((i) => i.name);
  const schemaIndexNames = schemaIndexes.map((i) => i.name);

  // Pronađi razlike
  const missingInDb = schemaIndexNames.filter(
    (name) => !dbIndexNames.includes(name) && name !== "_id_"
  );

  const extraInDb = dbIndexNames.filter(
    (name) => !schemaIndexNames.includes(name) && name !== "_id_"
  );

  const synced = schemaIndexNames.filter(
    (name) => dbIndexNames.includes(name)
  );

  return {
    schemaIndexCount: schemaIndexes.length,
    dbIndexCount: dbIndexes.length - 1, // minus _id
    missingInDb,
    extraInDb,
    synced,
    inSync: missingInDb.length === 0 && extraInDb.length === 0,
  };
};

/**
 * Formatiraj indekse za prikaz u konzoli
 * @param {Array} indexes - Lista indeksa
 */
export const printIndexes = (indexes) => {
  console.log("\n┌" + "─".repeat(78) + "┐");
  console.log("│" + " INDEKSI ".padStart(44).padEnd(78) + "│");
  console.log("├" + "─".repeat(78) + "┤");

  indexes.forEach((idx, i) => {
    const keys = JSON.stringify(idx.keys);
    const flags = [
      idx.unique && "UNIQUE",
      idx.sparse && "SPARSE",
      idx.partial && "PARTIAL",
      idx.ttl && `TTL(${idx.ttl})`,
    ].filter(Boolean).join(", ");

    console.log(`│ ${(i + 1).toString().padStart(2)}. ${idx.name.padEnd(40)} │ ${(idx.size || "").padStart(10)} │`);
    console.log(`│     Keys: ${keys.padEnd(65)} │`);
    if (flags) {
      console.log(`│     Flags: ${flags.padEnd(64)} │`);
    }
  });

  console.log("└" + "─".repeat(78) + "┘\n");
};
