import React, { useState, useEffect } from "react";
import "./App.css";

const API_BASE = "http://localhost:8080/api";

// LocalStorage helpers for product ratings
const loadRatingsFromStorage = () => {
  try {
    const raw = localStorage.getItem("product_ratings");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveRatingsToStorage = (data) => {
  try {
    localStorage.setItem("product_ratings", JSON.stringify(data));
  } catch {
    // ignore
  }
};

export default function App() {
  // Auth state
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [activeTab, setActiveTab] = useState(token ? "shop" : "login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  // Products
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Search + suggestions
  const [search, setSearch] = useState("");
  const [autoResults, setAutoResults] = useState([]);

  // Filters & sorting
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [sortOption, setSortOption] = useState("RELEVANT");

  // Slideshow
  const slides = [
    {
      id: 1,
      title: "Fashion Fiesta",
      subtitle: "Flat 60% OFF on clothing & accessories.",
    },
    {
      id: 2,
      title: "Electronics Bonanza",
      subtitle: "Phones, Laptops & more from ₹4999.",
    },
    {
      id: 3,
      title: "Home & Living",
      subtitle: "Make your home cozy with top offers.",
    },
  ];
  const [currentSlide, setCurrentSlide] = useState(0);

  // Cart
  const [cart, setCart] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);

  // Wishlist
  const [wishlist, setWishlist] = useState([]);

  // Coupons
  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Payment
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");

  // Orders
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Profile
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");

  // Support (static)
  const supportEmail = "support@BargainBay.com";
  const supportWebsite = "https://BargainBay.com/support";

  // Ratings: { [productId]: { average, count, userRating } }
  const [ratings, setRatings] = useState(loadRatingsFromStorage);

  // Admin form state
  const [adminName, setAdminName] = useState("");
  const [adminDescription, setAdminDescription] = useState("");
  const [adminPrice, setAdminPrice] = useState("");
  const [adminCategory, setAdminCategory] = useState("");
  const [adminImageUrl, setAdminImageUrl] = useState("");

  const DEFAULT_IMAGE =
    "https://cdn-icons-png.flaticon.com/128/679/679922.png";

  // ---------------- AUTH ----------------
  const login = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        alert("Invalid credentials");
        return;
      }
      const data = await res.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      setToken(data.token);
      setRole(data.role || "ROLE_USER");
      setActiveTab("shop");
      setProfileEmail(email);
      setProfileName(name || "BargainBay User");
    } catch (e) {
      console.error(e);
      alert("Error logging in");
    }
  };

  const register = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) {
        alert("Email already exists or invalid data");
        return;
      }
      alert("Registered successfully! Please login.");
      setActiveTab("login");
    } catch (e) {
      console.error(e);
      alert("Error registering user");
    }
  };

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setRole(null);
    setCart([]);
    setWishlist([]);
    setActiveTab("login");
  };

  // ---------------- LOAD PRODUCTS ----------------
  const loadProducts = async () => {
    if (!token) return;
    try {
      setLoadingProducts(true);
      const res = await fetch(`${API_BASE}/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProducts(data);
    } catch (e) {
      console.error(e);
      alert("Failed to load products");
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadProducts();
    }
  }, [token]);

  // ---------------- SLIDESHOW AUTO ----------------
  useEffect(() => {
    if (activeTab !== "shop") return;
    const id = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(id);
  }, [activeTab, slides.length]);

  // ---------------- SEARCH + SUGGESTIONS ----------------
  const handleSearch = (q) => {
    setSearch(q);
    if (!q.trim()) {
      setAutoResults([]);
      return;
    }
    const lower = q.toLowerCase();
    const matches = products.filter((p) =>
      p.name.toLowerCase().includes(lower)
    );
    setAutoResults(matches.slice(0, 8));
  };

  const selectSuggestion = (p) => {
    setSearch(p.name);
    setAutoResults([]);
  };

  // ---------------- CART ----------------
  const addToCart = (product) => {
    const found = cart.find((c) => c.id === product.id);
    if (found) {
      setCart(
        cart.map((c) =>
          c.id === product.id ? { ...c, qty: c.qty + 1 } : c
        )
      );
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const changeQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, qty: item.qty + delta } : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const removeCartItem = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  useEffect(() => {
    const total = cart.reduce(
      (acc, item) => acc + item.price * item.qty,
      0
    );
    setCartTotal(total);
  }, [cart]);

  // ---------------- WISHLIST ----------------
  const toggleWishlist = (product) => {
    const exists = wishlist.find((w) => w.id === product.id);
    if (exists) {
      setWishlist(wishlist.filter((w) => w.id !== product.id));
    } else {
      setWishlist([...wishlist, product]);
    }
  };

  const isInWishlist = (productId) =>
    wishlist.some((w) => w.id === productId);

  // ---------------- COUPONS (FRONTEND) ----------------
  const applyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      alert("Enter a coupon code");
      return;
    }
    if (code === "SAVE10") {
      setDiscountPercent(10);
      setAppliedCoupon("SAVE10");
    } else if (code === "SAVE20") {
      setDiscountPercent(20);
      setAppliedCoupon("SAVE20");
    } else {
      alert("Invalid coupon code");
      setDiscountPercent(0);
      setAppliedCoupon(null);
    }
  };

  const finalAmount = cartTotal * (1 - discountPercent / 100);

  // ---------------- ORDERS ----------------
  const loadOrders = async () => {
    try {
      setLoadingOrders(true);
      const res = await fetch(`${API_BASE}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOrders(data);
    } catch (e) {
      console.error(e);
      alert("Failed to load orders");
    } finally {
      setLoadingOrders(false);
    }
  };

  const cancelOrder = async (id) => {
    try {
      await fetch(`${API_BASE}/orders/${id}/cancel`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      loadOrders();
    } catch (e) {
      console.error(e);
      alert("Failed to cancel order");
    }
  };

  const placeOrder = async () => {
    if (!address.trim()) {
      alert("Please enter delivery address");
      return;
    }
    if (cart.length === 0) {
      alert("Cart is empty");
      return;
    }

    const body = {
      items: cart.map((c) => ({
        productId: c.id,
        quantity: c.qty,
      })),
      deliveryAddress: address,
      paymentMethod,
    };

    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        alert("Failed to place order");
        return;
      }
      setCart([]);
      setAddress("");
      setPaymentMethod("COD");
      setDiscountPercent(0);
      setAppliedCoupon(null);
      setCouponCode("");
      setActiveTab("success");
    } catch (e) {
      console.error(e);
      alert("Failed to place order");
    }
  };

  const renderTimeline = (status) => {
    const steps = ["PLACED", "PACKED", "SHIPPED", "DELIVERED"];
    let currentIndex = 0;
    if (status === "PLACED") currentIndex = 0;
    else if (status === "PACKED") currentIndex = 1;
    else if (status === "SHIPPED") currentIndex = 2;
    else if (status === "DELIVERED") currentIndex = 3;
    else if (status === "CANCELLED") currentIndex = -1;

    if (status === "CANCELLED") {
      return <p className="cancelled">Order Cancelled ❌</p>;
    }

    return (
      <div className="timeline">
        {steps.map((step, index) => (
          <div
            key={step}
            className={
              "timeline-step " +
              (index <= currentIndex ? "active-step" : "")
            }
          >
            <div className="bullet" />
            <span>{step}</span>
          </div>
        ))}
      </div>
    );
  };

  // ---------------- PROFILE ----------------
  useEffect(() => {
    if (email && !profileEmail) {
      setProfileEmail(email);
    }
    if (name && !profileName) {
      setProfileName(name);
    }
  }, [email, name, profileEmail, profileName]);

  const saveProfile = () => {
    alert("Profile updated locally (add backend API to persist).");
  };

  // ---------------- RATINGS ----------------
  const getProductRating = (productId) => ratings[productId] || null;

  const handleRating = (product, stars) => {
    setRatings((prev) => {
      const current = prev[product.id] || {
        average: 0,
        count: 0,
        userRating: 0,
      };
      const newCount = current.count + 1;
      const newAverage =
        (current.average * current.count + stars) / newCount;
      const updated = {
        ...prev,
        [product.id]: {
          average: newAverage,
          count: newCount,
          userRating: stars,
        },
      };
      saveRatingsToStorage(updated);
      return updated;
    });
  };

  const renderStars = (product) => {
    const productRating = getProductRating(product.id);
    const userRating = productRating?.userRating || 0;
    return (
      <div className="star-row">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={
              "star " + (star <= userRating ? "star-filled" : "")
            }
            onClick={() => handleRating(product, star)}
          >
            ★
          </span>
        ))}
        {productRating && (
          <span className="rating-small">
            {productRating.average.toFixed(1)} ({productRating.count})
          </span>
        )}
      </div>
    );
  };

  // ---------------- ADMIN: CREATE + DELETE PRODUCT ----------------
  const createProduct = async () => {
    if (!adminName.trim() || !adminPrice) {
      alert("Name and price are required");
      return;
    }
    const body = {
      name: adminName,
      description: adminDescription,
      price: Number(adminPrice),
      category: adminCategory,
      imageUrl: adminImageUrl,
    };

    try {
      const res = await fetch(`${API_BASE}/admin/products`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const text = await res.text();
        alert("Failed to create product: " + res.status + " " + text);
        return;
      }
      alert("Product created successfully");
      setAdminName("");
      setAdminDescription("");
      setAdminPrice("");
      setAdminCategory("");
      setAdminImageUrl("");
      await loadProducts();
    } catch (e) {
      console.error(e);
      alert("Error creating product");
    }
  };

  const deleteProduct = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${API_BASE}/admin/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const text = await res.text();
        alert("Failed to delete: " + res.status + " " + text);
        return;
      }
      await loadProducts();
    } catch (e) {
      console.error(e);
      alert("Error deleting product");
    }
  };

  // ---------------- FILTER & SORT LOGIC ----------------
  const getDisplayedProducts = () => {
    const searchLower = search.toLowerCase();
    const filterLower = filterCategory.toLowerCase();

    let filtered = products.filter((p) => {
      const matchesSearch = p.name
        .toLowerCase()
        .includes(searchLower);
      const matchesCategory =
        filterCategory === "ALL"
          ? true
          : p.category &&
            p.category.toLowerCase() === filterLower;

      return matchesSearch && matchesCategory;
    });

    if (sortOption === "PRICE_LOW_HIGH") {
      filtered = [...filtered].sort((a, b) => a.price - b.price);
    } else if (sortOption === "PRICE_HIGH_LOW") {
      filtered = [...filtered].sort((a, b) => b.price - a.price);
    }

    return filtered;
  };

  const displayedProducts = getDisplayedProducts();

  const selectCategoryFilter = (cat) => {
    setFilterCategory(cat);
    setSearch("");
    setAutoResults([]);
  };

  // ---------------- AUTH SCREENS ----------------
  if (!token) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          {activeTab === "login" ? (
            <>
              <h1>Welcome to BargainBay</h1>
              <p className="auth-subtitle">
                Sign in to start shopping smart ✨
              </p>
              <input
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button onClick={login}>Login</button>
              <p
                className="link"
                onClick={() => setActiveTab("register")}
              >
                New here? Create account
              </p>
            </>
          ) : (
            <>
              <h1>Create your BargainBay account</h1>
              <input
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button onClick={register}>Register</button>
              <p
                className="link"
                onClick={() => setActiveTab("login")}
              >
                Already have an account? Login
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  // ---------------- MAIN APP ----------------
  return (
    <div className="app-root">
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="nav-left">
          <h2 className="logo" onClick={() => setActiveTab("shop")}>
            🛍️ BargainBay
          </h2>
          <button onClick={() => setActiveTab("shop")}>Shop</button>
          <button onClick={() => setActiveTab("wishlist")}>
            Wishlist
          </button>
          <button onClick={() => setActiveTab("orders")}>
            My Orders
          </button>
          <button onClick={() => setActiveTab("profile")}>
            Profile
          </button>
          <button onClick={() => setActiveTab("support")}>
            Support
          </button>
          {role === "ROLE_ADMIN" && (
            <button onClick={() => setActiveTab("admin")}>Admin</button>
          )}
        </div>
        <div className="nav-right">
          <button onClick={logout}>Logout</button>
        </div>
      </nav>

      {/* SHOP */}
      {activeTab === "shop" && (
        <div className="container">
          {/* ColoShop-style hero */}
          <div className="hero-banner">
            <div className="hero-left">
              <p className="hero-kicker">SPRING / SUMMER 2025</p>
              <h1 className="hero-heading">
                Get up to <span>70% Off</span> New Arrivals
              </h1>
              <p className="hero-text">
                Shop the latest mobiles, electronics and fashion with
                lightning-fast delivery and secure payments.
              </p>
              <button
                className="hero-shop-btn"
                onClick={() => setActiveTab("shop")}
              >
                Shop Now
              </button>
            </div>

            <div className="hero-right">
              {/* feature badges on right of hero image */}
              <div className="hero-feature-list">
                <div className="hero-feature-item">
                  <span className="hero-feature-title">Free Shipping</span>
                  <span className="hero-feature-sub">
                    On orders above ₹999
                  </span>
                </div>
                <div className="hero-feature-item">
                  <span className="hero-feature-title">Secure Payments</span>
                  <span className="hero-feature-sub">
                    UPI, Cards & Wallets
                  </span>
                </div>
                <div className="hero-feature-item">
                  <span className="hero-feature-title">Easy Returns</span>
                  <span className="hero-feature-sub">
                    7-day hassle-free
                  </span>
                </div>
              </div>

              {/* overlay at bottom-left */}
              <div className="hero-image-overlay">
                <p className="hero-small-tag">Today&apos;s Hot Pick</p>
                <h3>Flagship Deals</h3>
                <p>Mobiles • TVs • Laptops</p>
              </div>
            </div>
          </div>

          {/* CATEGORY TILES UNDER HERO */}
          <div className="category-tiles">
            <div
              className="category-card cat-mobiles"
              onClick={() => selectCategoryFilter("MOBILE")}
            >
              <div className="category-overlay">
                <span className="category-tag">Mobiles</span>
                <span className="category-sub">
                  Latest smartphones & 5G phones
                </span>
              </div>
            </div>
            <div
              className="category-card cat-electronics"
              onClick={() => selectCategoryFilter("ELECTRONICS")}
            >
              <div className="category-overlay">
                <span className="category-tag">Electronics</span>
                <span className="category-sub">
                  TVs, speakers, laptops & more
                </span>
              </div>
            </div>
            <div
              className="category-card cat-fashion"
              onClick={() => selectCategoryFilter("FASHION")}
            >
              <div className="category-overlay">
                <span className="category-tag">Fashion</span>
                <span className="category-sub">
                  Clothes, shoes & accessories
                </span>
              </div>
            </div>
            <div
              className="category-card cat-home"
              onClick={() => selectCategoryFilter("HOME")}
            >
              <div className="category-overlay">
                <span className="category-tag">Home & Living</span>
                <span className="category-sub">
                  Furniture, décor & kitchen
                </span>
              </div>
            </div>
          </div>

          {/* slideshow + sidebar layout */}
          <div className="shop-top-layout">
            <div className="slideshow-wrapper">
              <div className="slideshow">
                <div className="slide">
                  <h2>{slides[currentSlide].title}</h2>
                  <p>{slides[currentSlide].subtitle}</p>
                </div>
                <div className="slide-controls">
                  <button
                    onClick={() =>
                      setCurrentSlide(
                        (currentSlide - 1 + slides.length) % slides.length
                      )
                    }
                  >
                    ◀
                  </button>
                  <button
                    onClick={() =>
                      setCurrentSlide((currentSlide + 1) % slides.length)
                    }
                  >
                    ▶
                  </button>
                </div>
              </div>
            </div>

            <div className="sidebar-box">
              <h3 className="sidebar-title">Top Categories</h3>
              <ul className="sidebar-list">
                <li onClick={() => selectCategoryFilter("MOBILE")}>
                  Mobiles &amp; Tablets
                </li>
                <li onClick={() => selectCategoryFilter("ELECTRONICS")}>
                  Electronics
                </li>
                <li onClick={() => selectCategoryFilter("FASHION")}>
                  Fashion &amp; Clothing
                </li>
                <li onClick={() => selectCategoryFilter("HOME")}>
                  Home &amp; Furniture
                </li>
                <li onClick={() => selectCategoryFilter("ALL")}>
                  View All Products
                </li>
              </ul>

              <div className="sidebar-section">
                <h3 className="sidebar-title">Trending Now</h3>
                <p className="sidebar-text">
                  iPhone 16 • Sony TV • Trendy Sneakers • Smartwatches
                </p>
              </div>

              <div className="sidebar-section">
                <h3 className="sidebar-title">Payment Offers</h3>
                <p className="sidebar-text">
                  💳 10% Cashback on UPI
                  <br />
                  🛍 Flat ₹150 OFF on Cards
                </p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="search-container">
            <input
              className="search-input"
              placeholder="Search for mobiles, laptops, fashion, etc..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          {autoResults.length > 0 && (
            <div className="suggestion-box">
              {autoResults.map((p) => (
                <div
                  key={p.id}
                  className="suggestion-item"
                  onClick={() => selectSuggestion(p)}
                >
                  {p.name}
                </div>
              ))}
            </div>
          )}

          {/* FILTER & SORT BAR */}
          <div className="filter-bar">
            <div className="filter-left">
              <span className="filter-label">Filter:</span>
              <button
                className={
                  "filter-pill " +
                  (filterCategory === "ALL" ? "filter-pill-active" : "")
                }
                onClick={() => selectCategoryFilter("ALL")}
              >
                All
              </button>
              <button
                className={
                  "filter-pill " +
                  (filterCategory === "MOBILE" ? "filter-pill-active" : "")
                }
                onClick={() => selectCategoryFilter("MOBILE")}
              >
                Mobiles
              </button>
              <button
                className={
                  "filter-pill " +
                  (filterCategory === "ELECTRONICS"
                    ? "filter-pill-active"
                    : "")
                }
                onClick={() => selectCategoryFilter("ELECTRONICS")}
              >
                Electronics
              </button>
              <button
                className={
                  "filter-pill " +
                  (filterCategory === "FASHION" ? "filter-pill-active" : "")
                }
                onClick={() => selectCategoryFilter("FASHION")}
              >
                Fashion
              </button>
              <button
                className={
                  "filter-pill " +
                  (filterCategory === "HOME" ? "filter-pill-active" : "")
                }
                onClick={() => selectCategoryFilter("HOME")}
              >
                Home
              </button>
            </div>

            <div className="filter-right">
              <span className="filter-label">Sort:</span>
              <select
                className="filter-select"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="RELEVANT">Relevance</option>
                <option value="PRICE_LOW_HIGH">Price: Low to High</option>
                <option value="PRICE_HIGH_LOW">Price: High to Low</option>
              </select>
            </div>
          </div>

          <h2 className="section-title">Products</h2>

          {loadingProducts ? (
            <p>Loading products...</p>
          ) : (
            <div className="products-grid">
              {displayedProducts.map((p) => (
                <div className="product-card" key={p.id}>
                  <div className="product-image-wrapper">
                    <img
                      src={p.imageUrl || DEFAULT_IMAGE}
                      alt={p.name}
                    />
                    {p.category && (
                      <span className="category-badge">
                        {p.category}
                      </span>
                    )}
                  </div>
                  <h3>{p.name}</h3>
                  <p className="product-description">
                    {p.description}
                  </p>
                  <p className="price">₹{p.price}</p>
                  {renderStars(p)}
                  <div className="product-actions">
                    <button
                      className="primary"
                      onClick={() => addToCart(p)}
                    >
                      Add to Cart
                    </button>
                    <button
                      className={
                        "wishlist-btn " +
                        (isInWishlist(p.id) ? "wish-active" : "")
                      }
                      onClick={() => toggleWishlist(p)}
                    >
                      {isInWishlist(p.id) ? "♥ Wishlisted" : "♡ Wishlist"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {cart.length > 0 && (
            <div className="cart-box">
              <h2>🛒 Your Cart</h2>
              {cart.map((c) => (
                <div className="cart-item" key={c.id}>
                  <span>
                    {c.name} – ₹{c.price} × {c.qty}
                  </span>
                  <div className="cart-controls">
                    <button onClick={() => changeQty(c.id, -1)}>-</button>
                    <button onClick={() => changeQty(c.id, 1)}>+</button>
                    <button onClick={() => removeCartItem(c.id)}>
                      ❌
                    </button>
                  </div>
                </div>
              ))}
              <h3>Subtotal: ₹{cartTotal.toFixed(2)}</h3>

              <div className="coupon-row">
                <input
                  placeholder="Have a coupon? e.g. SAVE10"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                <button onClick={applyCoupon}>Apply</button>
              </div>

              {appliedCoupon && (
                <p className="discount-text">
                  Coupon <b>{appliedCoupon}</b> applied: {discountPercent}% OFF
                </p>
              )}

              <h2>Payable: ₹{finalAmount.toFixed(2)}</h2>

              <button
                className="primary"
                onClick={() => setActiveTab("payment")}
              >
                Proceed to Payment
              </button>
            </div>
          )}
        </div>
      )}

      {/* WISHLIST */}
      {activeTab === "wishlist" && (
        <div className="container">
          <h1>My Wishlist ♥</h1>
          {wishlist.length === 0 ? (
            <p>No items in wishlist yet.</p>
          ) : (
            <div className="products-grid">
              {wishlist.map((p) => (
                <div className="product-card" key={p.id}>
                  <img
                    src={p.imageUrl || DEFAULT_IMAGE}
                    alt={p.name}
                  />
                  <h3>{p.name}</h3>
                  <p>{p.description}</p>
                  <p className="price">₹{p.price}</p>
                  {renderStars(p)}
                  <div className="product-actions">
                    <button
                      className="primary"
                      onClick={() => addToCart(p)}
                    >
                      Add to Cart
                    </button>
                    <button
                      className="wishlist-btn wish-active"
                      onClick={() => toggleWishlist(p)}
                    >
                      Remove from Wishlist
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PAYMENT */}
      {activeTab === "payment" && (
        <div className="container small">
          <h1>Payment</h1>
          <textarea
            placeholder="Delivery Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="COD">Cash on Delivery</option>
            <option value="UPI">UPI</option>
            <option value="CARD">Credit/Debit Card</option>
          </select>
          <button className="primary" onClick={placeOrder}>
            Pay &amp; Place Order
          </button>
        </div>
      )}

      {/* SUCCESS */}
      {activeTab === "success" && (
        <div className="success">
          <h1>🎉 Thank you for shopping with BargainBay!</h1>
          <h3>Your order has been placed successfully.</h3>
          <button
            className="primary"
            onClick={() => setActiveTab("shop")}
          >
            Continue Shopping
          </button>
        </div>
      )}

      {/* ORDERS */}
      {activeTab === "orders" && (
        <div className="container">
          <h1>My Orders</h1>
          <button className="primary" onClick={loadOrders}>
            Load Orders
          </button>
          {loadingOrders && <p>Loading orders...</p>}
          {orders.map((o) => (
            <div className="order-card" key={o.id}>
              <h3>Order #{o.id}</h3>
              <p>Total: ₹{o.totalAmount}</p>
              <p>Status: {o.status}</p>
              {renderTimeline(o.status)}
              {o.deliveryAddress && (
                <p className="order-address">
                  Delivering to: {o.deliveryAddress}
                </p>
              )}
              <p>Payment: {o.paymentMethod}</p>
              {o.status !== "CANCELLED" && (
                <button onClick={() => cancelOrder(o.id)}>
                  Cancel Order
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* PROFILE */}
      {activeTab === "profile" && (
        <div className="container small">
          <h1>My Profile</h1>
          <label>Name</label>
          <input
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
          />
          <label>Email</label>
          <input
            value={profileEmail}
            onChange={(e) => setProfileEmail(e.target.value)}
          />
          <button className="primary" onClick={saveProfile}>
            Save Profile
          </button>
          <p className="info-text">
            (Currently saved only on frontend. Add a backend API to persist
            changes permanently.)
          </p>
        </div>
      )}

      {/* SUPPORT */}
      {activeTab === "support" && (
        <div className="container small">
          <h1>Help &amp; Support</h1>
          <p>
            Need help with your orders, payments or account? We’re here for
            you. 💙
          </p>
          <p>
            <b>Email:</b>{" "}
            <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
          </p>
          <p>
            <b>Support Portal:</b>{" "}
            <a href={supportWebsite} target="_blank" rel="noreferrer">
              {supportWebsite}
            </a>
          </p>
          <p className="info-text">
            You can also add real-time chat or ticket system here later.
          </p>
        </div>
      )}

      {/* ADMIN */}
      {activeTab === "admin" && role === "ROLE_ADMIN" && (
        <div className="admin-wrapper">
          <div className="admin-card">
            <h1>Admin – Add Product</h1>
            <p className="admin-subtitle">
              Create new products for the BargainBay store.
            </p>

            <label>Product Name</label>
            <input
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
            />

            <label>Description</label>
            <textarea
              value={adminDescription}
              onChange={(e) => setAdminDescription(e.target.value)}
            />

            <label>Price (₹)</label>
            <input
              type="number"
              value={adminPrice}
              onChange={(e) => setAdminPrice(e.target.value)}
            />

            <label>Category</label>
            <input
              value={adminCategory}
              onChange={(e) => setAdminCategory(e.target.value)}
              placeholder="e.g. Electronics, Fashion"
            />

            <label>Image URL</label>
            <input
              value={adminImageUrl}
              onChange={(e) => setAdminImageUrl(e.target.value)}
              placeholder="https://..."
            />

            <button
              className="primary admin-save-btn"
              onClick={createProduct}
            >
              Save Product
            </button>
            <p className="info-text">
              This calls <code>POST /api/admin/products</code> with your JWT
              token. Adjust the URL if your backend uses a different path.
            </p>
          </div>

          <div className="admin-products-list">
            <h2>Existing Products</h2>
            {products.length === 0 ? (
              <p>No products found.</p>
            ) : (
              products.map((p) => (
                <div className="admin-product-row" key={p.id}>
                  <div className="admin-product-info">
                    <span className="admin-product-name">{p.name}</span>
                    {p.category && (
                      <span className="admin-product-category">
                        {p.category}
                      </span>
                    )}
                    <span className="admin-product-price">
                      ₹{p.price}
                    </span>
                  </div>
                  <button
                    className="admin-delete-btn"
                    onClick={() => deleteProduct(p.id)}
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
