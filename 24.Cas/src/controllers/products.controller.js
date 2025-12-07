import Product from "../models/Product.js";

// GET /products - Vrati sve proizvode
export const getAllProducts = async (req, res) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      search,
      sort = "-createdAt",
      page = 1,
      limit = 10,
    } = req.query;

    // Gradimo filter objekat
    const filter = { isActive: true };

    // Filtriranje po kategoriji
    if (category) {
      filter.category = category.toLowerCase();
    }

    // Filtriranje po ceni
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Pretraga po nazivu/opisu
    if (search) {
      filter.$text = { $search: search };
    }

    // Paginacija
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Izvrsavanje upita
    const [products, total] = await Promise.all([
      Product.find(filter).sort(sort).skip(skip).limit(limitNum),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Greska pri dobijanju proizvoda",
      error: error.message,
    });
  }
};

// GET /products/:id - Vrati jedan proizvod
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Proizvod sa ID-jem ${id} nije pronadjen`,
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    // Provera da li je greska zbog nevalidnog ObjectId formata
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Nevalidan format ID-ja",
      });
    }

    res.status(500).json({
      success: false,
      message: "Greska pri dobijanju proizvoda",
      error: error.message,
    });
  }
};

// POST /products - Kreiraj novi proizvod
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;

    const product = await Product.create({
      name,
      description,
      price,
      category,
      stock,
    });

    res.status(201).json({
      success: true,
      message: "Proizvod uspesno kreiran",
      data: product,
    });
  } catch (error) {
    // Mongoose validacione greske
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validaciona greska",
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Greska pri kreiranju proizvoda",
      error: error.message,
    });
  }
};

// PUT /products/:id - Azuriraj proizvod
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, stock, isActive } = req.body;

    const product = await Product.findByIdAndUpdate(
      id,
      { name, description, price, category, stock, isActive },
      {
        new: true, // Vrati azurirani dokument
        runValidators: true, // Pokreni validaciju
      }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Proizvod sa ID-jem ${id} nije pronadjen`,
      });
    }

    res.status(200).json({
      success: true,
      message: "Proizvod uspesno azuriran",
      data: product,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validaciona greska",
        errors,
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Nevalidan format ID-ja",
      });
    }

    res.status(500).json({
      success: false,
      message: "Greska pri azuriranju proizvoda",
      error: error.message,
    });
  }
};

// DELETE /products/:id - Obrisi proizvod
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Proizvod sa ID-jem ${id} nije pronadjen`,
      });
    }

    res.status(200).json({
      success: true,
      message: "Proizvod uspesno obrisan",
      data: product,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Nevalidan format ID-ja",
      });
    }

    res.status(500).json({
      success: false,
      message: "Greska pri brisanju proizvoda",
      error: error.message,
    });
  }
};
