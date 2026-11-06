import { type FormEvent, useState } from "react";
import "./_group.css";
import "./TwilightEditorial.css";

/**
 * A twilight-led editorial variant of the NYC pocket guide.
 * The guide copy and its in-memory interactions remain faithful to Current.
 */
export function TwilightEditorial() {
  const [draft, setDraft] = useState("");
  const [likes, setLikes] = useState<string[]>([]);
  const [fluttering, setFluttering] = useState(false);

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

  return (
    <div className="twilight-guide">
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
              <ul className="likes-list" aria-label="Things I like list" aria-live="polite">
                {likes.length === 0 ? (
                  <li className="list-empty">Your list is waiting for its first note.</li>
                ) : (
                  likes.map((like, index) => <li key={`${like}-${index}`}>{like}</li>)
                )}
              </ul>
            </div>
          </section>
        </main>

        <footer className="footer">
          <strong>Little Guide to NYC</strong>
          <span>Made for curious first-timers · Keep looking up</span>
        </footer>
      </div>
    </div>
  );
}
