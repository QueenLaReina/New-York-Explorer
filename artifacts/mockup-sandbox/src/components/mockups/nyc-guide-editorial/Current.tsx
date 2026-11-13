import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import "./_group.css";

type DishSubmission = {
  id: number;
  title: string;
  caption: string;
  inspectorNote: string | null;
  createdAt: string;
  imageUrl: string;
};

/**
 * Extracted from the live NYC guide as a visual baseline for this redesign.
 * The original copy, images, and interactions are preserved here.
 */
export function Current() {
  const [draft, setDraft] = useState("");
  const [likes, setLikes] = useState<string[]>([]);
  const [fluttering, setFluttering] = useState(false);
  const [dishTitle, setDishTitle] = useState("");
  const [dishCaption, setDishCaption] = useState("");
  const [dishFile, setDishFile] = useState<File | null>(null);
  const [dishStatus, setDishStatus] = useState("");
  const [communityDishes, setCommunityDishes] = useState<DishSubmission[]>([]);
  const [dishListStatus, setDishListStatus] = useState("");
  const [isSubmittingDish, setIsSubmittingDish] = useState(false);

  useEffect(() => {
    async function loadDishes() {
      try {
        const res = await fetch("/api/dishes");
        if (!res.ok) {
          throw new Error("Recent community plates could not be loaded.");
        }
        const data = (await res.json()) as { dishes: DishSubmission[] };
        setCommunityDishes(data.dishes.slice(0, 3));
      } catch (error) {
        setDishListStatus(
          error instanceof Error ? error.message : "Recent community plates could not be loaded.",
        );
      }
    }
    void loadDishes();
  }, []);

  function addLike(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const note = draft.trim();
    if (!note) return;
    setLikes((currentLikes) => [...currentLikes, note]);
    setDraft("");
  }

  function flutterBird() {
    setFluttering(false);
    window.requestAnimationFrame(() => setFluttering(true));
  }

  async function resizeImage(file: File): Promise<string> {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      throw new Error("Only JPEG, PNG, or WebP images are supported.");
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const maxDimension = 1280;
          let width = img.width;
          let height = img.height;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const context = canvas.getContext("2d");
          if (!context) {
            reject(new Error("Could not load your photo."));
            return;
          }

          context.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL(file.type, 0.88));
        };
        img.onerror = () => reject(new Error("Could not read your photo."));
        img.src = String(reader.result);
      };
      reader.onerror = () => reject(new Error("Could not open your photo."));
      reader.readAsDataURL(file);
    });
  }

  async function submitDish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!dishTitle.trim() || !dishFile) {
      setDishStatus("Add a dish name and upload a photo first.");
      return;
    }

    try {
      setIsSubmittingDish(true);
      setDishStatus("");
      const image = await resizeImage(dishFile);
      const res = await fetch("/api/dishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: dishTitle.trim(),
          caption: dishCaption.trim(),
          image,
        }),
      });

      const data = (await res.json()) as { dish?: DishSubmission; error?: string };
      if (!res.ok) {
        throw new Error(data.error || "The dish could not be shared.");
      }
      if (!data.dish) {
        throw new Error("The server did not return the saved dish.");
      }

      const savedDish = data.dish;
      setCommunityDishes((current) => [savedDish, ...current].slice(0, 3));
      setDishTitle("");
      setDishCaption("");
      setDishFile(null);
      setDishStatus("Added to the community table.");
      const input = document.getElementById("dish-photo") as HTMLInputElement | null;
      if (input) input.value = "";
    } catch (error) {
      setDishStatus(error instanceof Error ? error.message : "The dish could not be shared.");
    } finally {
      setIsSubmittingDish(false);
    }
  }

  function handleDishFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setDishFile(file);
    setDishStatus("");
  }

  return (
    <div className="page-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Little Guide to NYC, home">
          <span className="brand-mark" aria-hidden="true">NY</span>
          <span className="brand-copy">
            <strong>Little Guide to NYC</strong>
            <small>FIELD NOTES · NO. 001</small>
          </span>
        </a>
        <nav className="nav-links" aria-label="Main navigation">
          <a href="#facts">Quick facts</a>
          <a href="#local">Local notes</a>
          <a href="#likes">Your list</a>
          <a href="#community-plate">Community plate</a>
        </nav>
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="hero-title">
          <div>
            <p className="eyebrow">A pocket-size city primer</p>
            <h1 id="hero-title">
              So, you&apos;re
              <br />
              new to <em>New York.</em>
            </h1>
            <p className="hero-intro">
              Start with the things locals talk about: a few city facts, a very good
              slice, and the small details that make this place feel like nowhere else.
            </p>
            <a className="hero-link" href="#facts">
              Take a look around <span aria-hidden="true">→</span>
            </a>
          </div>
          <div className="hero-art">
            <span className="hero-stamp" aria-hidden="true">
              Five<br />boroughs<br />one city
            </span>
            <img
              src="/__mockup/images/nyc-dusk-skyline.png"
              alt="Lower Manhattan skyline glowing at dusk, with One World Trade Center above the river and violet-blue clouds across the sky"
            />
            <span className="hero-caption">Dusk over Lower Manhattan</span>
          </div>
        </section>

        <section className="facts-section section-rule" id="facts" aria-labelledby="facts-title">
          <div className="section-heading">
            <div>
              <p className="section-kicker">01 / Get your bearings</p>
              <h2 id="facts-title">Quick facts</h2>
            </div>
            <p>A few good things to know before you go.</p>
          </div>
          <div className="facts-layout">
            <p className="facts-note">
              New York City is big, busy, and full of little surprises. These are the
              easy starting points.
            </p>
            <ul className="facts-list">
              <li><span className="fact-number">01</span><strong>The Big Apple</strong></li>
              <li>
                <span className="fact-number">02</span>
                <strong>About 8.48 million people call NYC home (2024 estimate)</strong>
              </li>
              <li>
                <span className="fact-number">03</span>
                <strong>New York became a state in 1788</strong>
              </li>
            </ul>
          </div>
        </section>

        <section className="leader-section section-rule" aria-labelledby="leader-title">
          <div>
            <p className="section-kicker">A note from City Hall</p>
            <h2 id="leader-title">City leader</h2>
          </div>
          <div className="leader-line">
            <strong>Zohran Mamdani</strong>
            <span>Mayor of New York City</span>
          </div>
        </section>

        <section className="feature-grid" id="local" aria-label="Local notes">
          <article className="feature food-copy" aria-labelledby="food-title">
            <p className="section-kicker">02 / An essential bite</p>
            <div className="food-visual">
              <img
                src="/__mockup/images/nyc-pizza.svg"
                alt="Illustration of a New York-style pizza slice with tomato sauce, melted cheese, and basil"
              />
              <span className="food-tag">Fold it, don&apos;t overthink it</span>
            </div>
            <h2 id="food-title">New York pizza</h2>
            <p>
              Thin, wide, and made for walking. Pick up a slice, fold it lengthwise,
              and let the crisp edge do the work. There&apos;s no wrong time for a
              neighborhood pizzeria.
            </p>
          </article>

          <article className="feature bird-copy" aria-labelledby="bird-title">
            <p className="section-kicker">03 / A little nature</p>
            <div className="bird-stage">
              <button
                className="bird-button"
                type="button"
                aria-label="Make the eastern bluebird flutter"
                onClick={flutterBird}
              >
                <img
                  className={`bird${fluttering ? " is-shaking" : ""}`}
                  src="/__mockup/images/eastern-bluebird.svg"
                  alt="Eastern bluebird, New York State's state bird, with vivid blue wings and a warm orange breast"
                  onAnimationEnd={() => setFluttering(false)}
                />
              </button>
            </div>
            <h2 id="bird-title">State bird</h2>
            <p>
              The eastern bluebird is New York&apos;s state bird. Look for its bright
              blue feathers and rusty-orange chest in open fields and parks.
            </p>
            <p className="bird-hint">Tap the bird to see it flutter</p>
          </article>
        </section>

        <section className="likes-section" id="likes" aria-labelledby="likes-title">
          <div className="likes-heading">
            <p className="section-kicker">04 / Your field notes</p>
            <h2 id="likes-title">Things I like</h2>
            <p>
              Make this guide yours. Add a spot, a snack, or something you want to
              remember.
            </p>
          </div>
          <div>
            <form className="list-form" onSubmit={addLike}>
              <label htmlFor="like-input">Add a thing you like in New York</label>
              <input
                id="like-input"
                name="like"
                type="text"
                placeholder="A tiny bookstore in the West Village…"
                autoComplete="off"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
              />
              <button type="submit">Add to list</button>
            </form>
            <ul className="likes-list" aria-label="Things I like list">
              {likes.length === 0 ? (
                <li className="list-empty">Your list is waiting for its first note.</li>
              ) : (
                likes.map((like, index) => <li key={`${like}-${index}`}>{like}</li>)
              )}
            </ul>
          </div>
        </section>

        <section className="community-section" id="community-plate" aria-labelledby="community-title">
          <div className="community-copy">
            <p className="section-kicker">05 / The community plate</p>
            <h2 id="community-title">
              Show us
              <span>your plate.</span>
            </h2>
            <p>
              Share your New York favorite: a classic slice, Chinatown dumplings, a bodega
              sandwich, or whatever keeps your neighborhood buzzing. Add it to the community
              table and give other curious New Yorkers a new place to start.
            </p>
          </div>

          <div className="community-card">
            <div className="community-accent" aria-hidden="true" />
            <form className="community-form" onSubmit={submitDish}>
              <div className="community-field">
                <div className="community-row">
                  <label htmlFor="dish-name">Dish name</label>
                  <span>Required</span>
                </div>
                <input
                  id="dish-name"
                  type="text"
                  value={dishTitle}
                  onChange={(event) => setDishTitle(event.target.value)}
                  placeholder="A classic slice in Brooklyn"
                  required
                  maxLength={80}
                />
              </div>

              <div className="community-field">
                <div className="community-row">
                  <label htmlFor="dish-caption">Caption</label>
                  <span>Optional</span>
                </div>
                <textarea
                  id="dish-caption"
                  value={dishCaption}
                  onChange={(event) => setDishCaption(event.target.value)}
                  placeholder="Where you found it, why it stuck with you..."
                  maxLength={280}
                />
              </div>

              <div className="community-field">
                <div className="community-row">
                  <label htmlFor="dish-photo">Photo</label>
                  <span>Jpeg, png or webp, up to 3 mb</span>
                </div>
                <div className="community-upload">
                  <input
                    id="dish-photo"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleDishFileChange}
                    required
                  />
                  <span className="upload-button">
                    {dishFile ? dishFile.name : "choose a photo"}
                  </span>
                </div>
              </div>

              <button type="submit" className="community-submit" disabled={isSubmittingDish}>
                {isSubmittingDish ? "Sharing..." : "Share this dish"}
                <span aria-hidden="true">→</span>
              </button>

              {dishStatus && <p className="community-status" aria-live="polite">{dishStatus}</p>}
            </form>
          </div>
          <div className="community-gallery">
            <div className="community-gallery-heading">
              <p className="section-kicker">Fresh from the five boroughs</p>
              <h3>On the community table</h3>
            </div>
            {dishListStatus && <p className="community-status" role="status">{dishListStatus}</p>}
            {communityDishes.length > 0 ? (
              <div className="community-gallery-grid">
                {communityDishes.map((dish) => (
                  <article key={dish.id} className="community-dish-card">
                    <div className="community-dish-accent" aria-hidden="true" />
                    <img className="community-dish-image" src={dish.imageUrl} alt={dish.title} />
                    <div className="community-dish-copy">
                      <p className="community-dish-kicker">A New York food note</p>
                      <h4>{dish.title}</h4>
                      {dish.caption && <p className="community-dish-caption">{dish.caption}</p>}
                      <div className="community-dish-footer">
                        <time dateTime={dish.createdAt}>
                          {new Date(dish.createdAt).toLocaleDateString()}
                        </time>
                        {dish.inspectorNote && <span>Reviewed</span>}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              !dishListStatus && (
                <p className="community-gallery-empty">
                  The table is set. Share a favorite New York bite to start the collection.
                </p>
              )
            )}
          </div>
        </section>
      </main>

      <footer className="footer">
        <strong>Little Guide to NYC</strong>
        <span>Made for curious first-timers · Keep looking up</span>
      </footer>
    </div>
  );
}
