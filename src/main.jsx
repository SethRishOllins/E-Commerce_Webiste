import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Search,
  ShoppingBag,
  ArrowRight,
  Star,
  Minus,
  Plus,
  X,
  Check,
  Package,
  ShieldCheck,
  Truck,
  UserRound,
  LogOut,
  Heart,
  SlidersHorizontal,
  MapPin,
  LayoutDashboard,
  Trash2,
} from "lucide-react";
import "./styles.css";
import "./interactive.css";
const money = (n) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(n || 0),
  saved = (k, d) => {
    try {
      return JSON.parse(localStorage.getItem(k)) ?? d;
    } catch {
      return d;
    }
  },
  api = async (p, o = {}) => {
    let t = localStorage.getItem("novea_token"),
      r = await fetch(p, {
        ...o,
        headers: {
          "Content-Type": "application/json",
          ...(t ? { Authorization: `Bearer ${t}` } : {}),
        },
      }),
      d = r.status === 204 ? null : await r.json();
    if (!r.ok) throw Error(d.message || "Request failed");
    return d;
  };
function Auth({ close, done }) {
  let [m, setM] = useState("login"),
    [f, setF] = useState({ name: "", email: "", password: "" }),
    [e, setE] = useState("");
  return (
    <div className="modal">
      <button className="modal-x" onClick={close}>
        <X />
      </button>
      <p className="eyebrow">Welcome to Novea</p>
      <h2>{m === "login" ? "Sign in" : "Create account"}</h2>
      <form
        onSubmit={async (x) => {
          x.preventDefault();
          try {
            let d = await api(
              "/api/auth/" + (m === "login" ? "login" : "register"),
              { method: "POST", body: JSON.stringify(f) },
            );
            localStorage.setItem("novea_token", d.token);
            localStorage.setItem("novea_user", JSON.stringify(d.user));
            done(d.user);
            close();
          } catch (x) {
            setE(x.message);
          }
        }}
      >
        {m === "register" && (
          <label>
            Name
            <input
              required
              onChange={(x) => setF({ ...f, name: x.target.value })}
            />
          </label>
        )}
        <label>
          Email
          <input
            type="email"
            required
            onChange={(x) => setF({ ...f, email: x.target.value })}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            minLength="6"
            required
            onChange={(x) => setF({ ...f, password: x.target.value })}
          />
        </label>
        {e && <p className="form-error">{e}</p>}
        <button>{m === "login" ? "Sign in" : "Create account"}</button>
      </form>
      <p className="switch">
        {m === "login" ? "New here?" : "Already have an account?"}{" "}
        <button onClick={() => setM(m === "login" ? "register" : "login")}>
          {m === "login" ? "Create one" : "Sign in"}
        </button>
      </p>
    </div>
  );
}
function Detail({ p, close, add, fav, onFav }) {
  let [q, setQ] = useState(1),
    [tab, setTab] = useState("details"),
    date = new Date(Date.now() + 3 * 864e5).toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  return (
    <div className="modal product-modal">
      <button className="modal-x" onClick={close}>
        <X />
      </button>
      <div className="product-detail">
        <img src={p.image} />
        <div>
          <p className="eyebrow">{p.category}</p>
          <h2>{p.name}</h2>
          <div className="detail-rating">
            <Star size={15} fill="currentColor" /> 4.9 <span>· 24 reviews</span>
          </div>
          <h3>{money(p.price)}</h3>
          <p>{p.description}</p>
          <div className="detail-tabs">
            <button
              className={tab === "details" ? "active" : ""}
              onClick={() => setTab("details")}
            >
              Details
            </button>
            <button
              className={tab === "reviews" ? "active" : ""}
              onClick={() => setTab("reviews")}
            >
              Reviews
            </button>
          </div>
          {tab === "details" ? (
            <div className="delivery">
              <span>
                <Truck size={18} />
                <b>Delivery by {date}</b>
                <small>Free shipping over $150</small>
              </span>
              <span>
                <Package size={18} />
                <b>30-day returns</b>
                <small>Simple, considered returns</small>
              </span>
            </div>
          ) : (
            <div className="reviews">
              {[
                [
                  "A perfect reading chair",
                  "The texture is lovely and it arrived beautifully packed.",
                  "Maya R.",
                ],
                ["Thoughtful details", "Exactly as pictured.", "Arjun S."],
              ].map((r) => (
                <article key={r[2]}>
                  <div>★★★★★</div>
                  <b>{r[0]}</b>
                  <p>“{r[1]}”</p>
                  <small>{r[2]}</small>
                </article>
              ))}
            </div>
          )}
          <div className="detail-actions">
            <div className="quantity">
              <button onClick={() => setQ(Math.max(1, q - 1))}>
                <Minus size={14} />
              </button>
              <span>{q}</span>
              <button onClick={() => setQ(Math.min(p.inventory, q + 1))}>
                <Plus size={14} />
              </button>
            </div>
            <button
              className="primary"
              disabled={!p.inventory}
              onClick={() => {
                add(p, q);
                close();
              }}
            >
              {p.inventory ? "Add to bag" : "Out of stock"}
            </button>
            <button className={"heart " + (fav ? "saved" : "")} onClick={onFav}>
              <Heart size={19} fill={fav ? "currentColor" : "none"} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
function Checkout({ cart, close, complete }) {
  let [f, setF] = useState({}),
    [e, setE] = useState(""),
    [receipt, setReceipt] = useState(null),
    total = cart.reduce((a, x) => a + x.price * x.qty, 0);
  if (receipt)
    return (
      <div className="modal receipt-modal">
        <button className="modal-x" onClick={close}>
          <X />
        </button>
        <Check size={34} />
        <p className="eyebrow">Demo order confirmed</p>
        <h2>Thank you, {receipt.firstName}.</h2>
        <p>
          Your practice order <b>#{receipt.id}</b> is confirmed. No payment
          has been taken and no real order has been created.
        </p>
        <div className="receipt-total">
          <span>Demo order total</span>
          <b>{money(total)}</b>
        </div>
        <button className="primary" onClick={close}>
          Continue shopping
        </button>
      </div>
    );
  return (
    <div className="modal">
      <button className="modal-x" onClick={close}>
        <X />
      </button>
      <p className="eyebrow">Almost yours</p>
      <h2>Checkout</h2>
      <form
        onSubmit={(x) => {
          x.preventDefault();
          setE("");
          const order = {
            id: `NV-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
            firstName: f.firstName,
            total,
            createdAt: new Date().toISOString(),
          };
          const orders = saved("novea_demo_orders", []);
          localStorage.setItem("novea_demo_orders", JSON.stringify([order, ...orders]));
          complete(order);
          setReceipt(order);
        }}
      >
        <p className="demo-note">Demo checkout — no payment is collected.</p>
        <label>
          Email
          <input
            type="email"
            required
            onChange={(x) => setF({ ...f, email: x.target.value })}
          />
        </label>
        <div className="two">
          <label>
            First name
            <input
              required
              onChange={(x) => setF({ ...f, firstName: x.target.value })}
            />
          </label>
          <label>
            Last name
            <input
              required
              onChange={(x) => setF({ ...f, lastName: x.target.value })}
            />
          </label>
        </div>
        <label>
          Delivery address
          <input
            required
            onChange={(x) => setF({ ...f, address: x.target.value })}
          />
        </label>
        <div className="two">
          <label>
            City
            <input
              required
              onChange={(x) => setF({ ...f, city: x.target.value })}
            />
          </label>
          <label>
            Postal code
            <input
              required
              onChange={(x) => setF({ ...f, postalCode: x.target.value })}
            />
          </label>
        </div>
        {e && <p className="form-error">{e}</p>}
        <button>Place order · {money(total)}</button>
      </form>
    </div>
  );
}
function Orders({ close }) {
  let [o, setO] = useState([]),
    [e, setE] = useState("");
  useEffect(() => {
    api("/api/orders/my")
      .then(setO)
      .catch((x) => setE(x.message));
  }, []);
  return (
    <div className="modal orders-modal">
      <button className="modal-x" onClick={close}>
        <X />
      </button>
      <p className="eyebrow">Your purchases</p>
      <h2>Order history</h2>
      {e ? (
        <p className="form-error">{e}</p>
      ) : o.length ? (
        <div className="order-list">
          {o.map((x) => (
            <div key={x._id}>
              <b>
                #{x._id.slice(-6).toUpperCase()} · {money(x.total)}
              </b>
              <small>
                {new Date(x.createdAt).toLocaleDateString()} · {x.status}
              </small>
            </div>
          ))}
        </div>
      ) : (
        <p className="empty">You have not placed an order yet.</p>
      )}
    </div>
  );
}
function Guide({ shop, cart, checkout }) {
  const steps = [
    ["01", "Browse the collection", "Use search, categories, price filtering, and sorting to find a product."],
    ["02", "View the product", "Open View details to see product information, reviews, delivery timing, and stock."],
    ["03", "Add it to your bag", "Choose a quantity, add the item, then review the bag total and delivery progress."],
    ["04", "Complete demo checkout", "Enter practice contact and delivery information. No payment is collected."],
    ["05", "Receive confirmation", "Novea generates a practice order number; the cart is cleared and no real order is placed."],
  ];
  return <main className="guide-page"><p className="eyebrow">A simple guide</p><h1>How to order with Novea.</h1><p className="guide-intro">This is a demonstration store. You can explore the full shopping journey safely—there are no charges or real deliveries.</p><div className="guide-steps">{steps.map(([number,title,body])=><article key={number}><span>{number}</span><div><h2>{title}</h2><p>{body}</p></div></article>)}</div><div className="guide-actions"><button className="primary" onClick={shop}>Start shopping <ArrowRight size={17}/></button>{cart > 0 && <button className="plain" onClick={checkout}>Continue to demo checkout</button>}</div></main>;
}
function App() {
  let [p, setP] = useState([]),
    [cart, setCart] = useState(() => saved("novea_cart", [])),
    [favs, setFavs] = useState(() => saved("novea_favourites", [])),
    [q, setQ] = useState(""),
    [cat, setCat] = useState("All"),
    [price, setPrice] = useState(300),
    [sort, setSort] = useState("featured"),
    [filters, setFilters] = useState(false),
    [drawer, setDrawer] = useState(false),
    [modal, setModal] = useState(null),
    [detail, setDetail] = useState(null),
    [note, setNote] = useState(""),
    [user, setUser] = useState(() => saved("novea_user", null)),
    [email, setEmail] = useState(""),
    [page, setPage] = useState("home"),
    [err, setErr] = useState("");
  let load = async () => {
    try {
      setP(
        await api(
          "/api/products?search=" + encodeURIComponent(q) + "&category=" + cat,
        ),
      );
      setErr("");
    } catch {
      setErr(
        "Store unavailable. Start the API server and MongoDB, then refresh.",
      );
    }
  };
  useEffect(() => {
    let t = setTimeout(load, 180);
    return () => clearTimeout(t);
  }, [q, cat]);
  useEffect(
    () => localStorage.setItem("novea_cart", JSON.stringify(cart)),
    [cart],
  );
  useEffect(
    () => localStorage.setItem("novea_favourites", JSON.stringify(favs)),
    [favs],
  );
  let shown = useMemo(
      () =>
        p
          .filter((x) => x.price <= price)
          .sort((a, b) =>
            sort === "low"
              ? a.price - b.price
              : sort === "high"
                ? b.price - a.price
                : sort === "name"
                  ? a.name.localeCompare(b.name)
                  : 0,
          ),
      [p, price, sort],
    ),
    cats = ["All", ...new Set(p.map((x) => x.category))],
    count = cart.reduce((a, x) => a + x.qty, 0),
    total = cart.reduce((a, x) => a + x.qty * x.price, 0),
    say = (x) => {
      setNote(x);
      setTimeout(() => setNote(""), 2600);
    },
    add = (x, n = 1) => {
      if (!x.inventory) return say("This item is out of stock.");
      setCart((c) =>
        c.some((i) => i._id === x._id)
          ? c.map((i) =>
              i._id === x._id
                ? { ...i, qty: Math.min(i.qty + n, x.inventory) }
                : i,
            )
          : [...c, { ...x, qty: n }],
      );
      say(x.name + " added to your bag");
    },
    change = (id, n) =>
      setCart((c) =>
        c.flatMap((x) =>
          x._id === id && x.qty + n < 1
            ? []
            : x._id === id
              ? [{ ...x, qty: Math.min(x.qty + n, x.inventory) }]
              : [x],
        ),
      ),
    toggle = (id) => {
      let yes = favs.includes(id);
      setFavs((s) => (yes ? s.filter((x) => x !== id) : [...s, id]));
      say(yes ? "Removed from favourites" : "Saved to favourites");
    };
  return (
    <>
      <header>
        <a className="brand" href="#top">
          novea<span>°</span>
        </a>
        <nav>
          <button onClick={() => setPage("home")}>Shop</button>
          <button onClick={() => setPage("guide")}>How to order</button>
          <a href="#journal">Journal</a>
        </nav>
        <div className="actions">
          {user ? (
            <>
              <button className="account" onClick={() => setModal("orders")}>
                <UserRound size={18} />
                {user.name.split(" ")[0]}
              </button>
              <button
                className="icon"
                onClick={() => {
                  localStorage.removeItem("novea_token");
                  localStorage.removeItem("novea_user");
                  setUser(null);
                  say("Signed out");
                }}
              >
                <LogOut size={19} />
              </button>
            </>
          ) : (
            <button className="account" onClick={() => setModal("auth")}>
              <UserRound size={18} />
              Sign in
            </button>
          )}
          <button className="icon favourite-nav" title="Favourites">
            <Heart size={19} fill={favs.length ? "currentColor" : "none"} />
            <b>{favs.length}</b>
          </button>
          <button className="bag" onClick={() => setDrawer(true)}>
            <ShoppingBag size={19} />
            <b>{count}</b>
          </button>
        </div>
      </header>
      {page === "guide" ? <Guide shop={() => setPage("home")} cart={count} checkout={() => setModal("checkout")} /> : <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">The art of everyday</p>
            <h1>
              Objects for a<br />
              <em>considered</em> life.
            </h1>
            <p className="lede">
              Thoughtfully selected pieces that bring warmth, character and ease
              to the spaces you call home.
            </p>
            <a className="cta" href="#shop">
              Explore the collection <ArrowRight size={18} />
            </a>
          </div>
          <div className="hero-image">
            <img src="https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1500&q=90" />
            <div className="float-card">
              <span>01 — The living edit</span>
              <b>Made for lingering</b>
            </div>
          </div>
        </section>
        <section className="perks">
          <span>
            <Truck /> Complimentary delivery over $150
          </span>
          <span>
            <ShieldCheck /> Designed to last
          </span>
          <span>
            <Package /> 30-day easy returns
          </span>
        </section>
        <section id="shop" className="collection">
          <div className="section-head">
            <div>
              <p className="eyebrow">Curated for you</p>
              <h2>Find your new favourite.</h2>
            </div>
            <small>{shown.length} pieces</small>
          </div>
          <div className="toolbar">
            <div className="search">
              <Search size={17} />
              <input
                placeholder="Search the collection"
                value={q}
                onChange={(x) => setQ(x.target.value)}
              />
            </div>
            <div className="chips">
              {cats.map((x) => (
                <button
                  className={cat === x ? "active" : ""}
                  onClick={() => setCat(x)}
                  key={x}
                >
                  {x}
                </button>
              ))}
            </div>
            <button className="filter" onClick={() => setFilters(!filters)}>
              <SlidersHorizontal size={17} />
              Filter
            </button>
          </div>
          {filters && (
            <div className="filters">
              <label>
                Up to {money(price)}
                <input
                  type="range"
                  min="50"
                  max="300"
                  step="10"
                  value={price}
                  onChange={(x) => setPrice(+x.target.value)}
                />
              </label>
              <label>
                Sort
                <select value={sort} onChange={(x) => setSort(x.target.value)}>
                  <option value="featured">Featured</option>
                  <option value="low">Price: low to high</option>
                  <option value="high">Price: high to low</option>
                  <option value="name">Name: A–Z</option>
                </select>
              </label>
              <button
                className="plain"
                onClick={() => {
                  setPrice(300);
                  setSort("featured");
                  setQ("");
                  setCat("All");
                }}
              >
                Reset
              </button>
            </div>
          )}
          {err ? (
            <div className="empty">{err}</div>
          ) : (
            <div className="grid">
              {shown.map((x) => (
                <article className="product" key={x._id}>
                  <div className="product-img">
                    <img src={x.image} />
                    {x.tag && <span>{x.tag}</span>}
                    <button
                      className={
                        "card-heart " + (favs.includes(x._id) ? "saved" : "")
                      }
                      onClick={() => toggle(x._id)}
                    >
                      <Heart
                        size={17}
                        fill={favs.includes(x._id) ? "currentColor" : "none"}
                      />
                    </button>
                    <button onClick={() => add(x)} disabled={!x.inventory}>
                      {x.inventory ? "Quick add" : "Out of stock"}
                    </button>
                  </div>
                  <div className="product-info">
                    <div>
                      <h3 onClick={() => setDetail(x)}>{x.name}</h3>
                      <p>{x.category}</p>
                    </div>
                    <strong>{money(x.price)}</strong>
                  </div>
                  <div className="rating">
                    <Star size={13} fill="currentColor" />
                    4.9 <small>In stock: {x.inventory}</small>
                    <button onClick={() => setDetail(x)}>View details</button>
                  </div>
                </article>
              ))}
            </div>
          )}{" "}
          {!err && !shown.length && (
            <div className="empty">No pieces match those filters.</div>
          )}
        </section>
        <section id="story" className="story">
          <img src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=85" />
          <div>
            <p className="eyebrow">Our philosophy</p>
            <h2>Less, but better.</h2>
            <p>
              We believe the things around us should earn their place. Novea
              brings together enduring materials, timeless forms, and makers
              with a point of view.
            </p>
            <button
              className="story-link"
              onClick={() => say("Maker stories are coming soon.")}
            >
              Meet our makers <ArrowRight size={16} />
            </button>
          </div>
        </section>
        <section className="orders-teaser">
          <MapPin size={23} />
          <p className="eyebrow">Your Novea</p>
          <h2>Orders, saved securely.</h2>
          <p>Sign in to place orders and view your order history.</p>
          <button
            className="primary"
            onClick={() => setModal(user ? "orders" : "auth")}
          >
            {user ? "View my orders" : "Sign in to continue"}
          </button>
        </section>
      </main>}
      <footer id="journal">
        <div className="brand">
          novea<span>°</span>
        </div>
        <p>Good design, delivered occasionally.</p>
        <form
          className="subscribe"
          onSubmit={(x) => {
            x.preventDefault();
            setEmail("");
            say("You’re on the Novea list — welcome.");
          }}
        >
          <input
            type="email"
            required
            placeholder="Your email address"
            value={email}
            onChange={(x) => setEmail(x.target.value)}
          />
          <button>Subscribe</button>
        </form>
        <small>© 2026 Novea. Made for the considered home.</small>
      </footer>
      {note && (
        <div className="toast">
          <Check size={17} />
          {note}
        </div>
      )}
      {drawer && (
        <>
          <aside className="drawer">
            <div className="drawer-head">
              <h2>
                Your bag <small>({count})</small>
              </h2>
              <button onClick={() => setDrawer(false)}>
                <X />
              </button>
            </div>
            {cart.length ? (
              <>
                <div className="cart-list">
                  {cart.map((x) => (
                    <div className="cart-item" key={x._id}>
                      <img src={x.image} />
                      <div>
                        <h3>{x.name}</h3>
                        <p>{money(x.price)}</p>
                        <div className="quantity">
                          <button onClick={() => change(x._id, -1)}>
                            <Minus size={14} />
                          </button>
                          <span>{x.qty}</span>
                          <button onClick={() => change(x._id, 1)}>
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                      <strong>{money(x.qty * x.price)}</strong>
                    </div>
                  ))}
                </div>
                <div className="checkout">
                  <div>
                    <span>Subtotal</span>
                    <b>{money(total)}</b>
                  </div>
                  <small>
                    {total >= 150
                      ? "You qualify for complimentary delivery."
                      : "Add " +
                        money(150 - total) +
                        " for complimentary delivery."}
                  </small>
                  <button
                    onClick={() => {
                      setDrawer(false);
                      setModal("checkout");
                    }}
                  >
                    Secure checkout <ArrowRight size={18} />
                  </button>
                </div>
              </>
            ) : (
              <div className="cart-empty">
                <ShoppingBag size={36} />
                <h3>Your bag is waiting</h3>
                <p>Add something lovely from the collection.</p>
              </div>
            )}
          </aside>
          <div className="scrim" onClick={() => setDrawer(false)} />
        </>
      )}
      {modal === "auth" && (
        <>
          <div className="scrim" onClick={() => setModal(null)} />
          <Auth close={() => setModal(null)} done={setUser} />
        </>
      )}
      {modal === "orders" && (
        <>
          <div className="scrim" onClick={() => setModal(null)} />
          <Orders close={() => setModal(null)} />
        </>
      )}
      {modal === "checkout" && (
        <>
          <div className="scrim" onClick={() => setModal(null)} />
          <Checkout
            cart={cart}
            close={() => setModal(null)}
            complete={() => {
              setCart([]);
              say("Order placed — thank you!");
              load();
            }}
          />
        </>
      )}
      {detail && (
        <>
          <div className="scrim" onClick={() => setDetail(null)} />
          <Detail
            p={detail}
            close={() => setDetail(null)}
            add={add}
            fav={favs.includes(detail._id)}
            onFav={() => toggle(detail._id)}
          />
        </>
      )}
    </>
  );
}
createRoot(document.getElementById("root")).render(<App />);
