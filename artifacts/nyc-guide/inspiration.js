const picks = [
  {
    title: "Snack your way through Queens",
    borough: "Jackson Heights · Queens",
    description:
      "Share a few small bites from neighborhood counters, then see how many flavors you can discover on one Queens food crawl.",
    tip: "Best shared with friends",
    image: new URL("./images/queens-small-bites.jpg", import.meta.url).href,
    imageAlt: "A colorful spread of small bites at a neighborhood food stall",
    imageSource:
      "https://images.unsplash.com/photo-1778057522012-0071acdce1dc?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
  },
  {
    title: "Chinatown soup dumplings",
    borough: "Chinatown · Manhattan",
    description:
      "Follow the Chinatown dumpling trail for delicate soup dumplings, pan-fried bites, and a wander through the surrounding food shops.",
    tip: "Bring a hungry crew",
    image: new URL("./images/chinatown-soup-dumplings.jpg", import.meta.url).href,
    imageAlt: "Soup dumplings served in a bamboo steamer",
    imageSource:
      "https://tarasmulticulturaltable.com/wp-content/uploads/2018/04/Xiao-Long-Bao-Chinese-Soup-Dumplings-7-of-8-1024x681.jpg",
  },
  {
    title: "Do the morning bagel run",
    borough: "Queens · Brooklyn",
    description:
      "A golden, blistered New York everything bagel generously packed with chunky scallion schmear—pure morning deli energy.",
    tip: "Start before noon",
    image: new URL("./images/nyc-everything-bagel.jpg", import.meta.url).href,
    imageAlt: "Everything bagel generously filled with scallion cream cheese",
    imageSource:
      "https://www.eitanbernath.com/wp-content/uploads/2021/04/New-York-Style-Everything-Bagel-With-Scallion-Cream-Cheese-4x5-3-819x1024.jpg",
  },
  {
    title: "Take the classic slice tour",
    borough: "Manhattan · Brooklyn",
    description:
      "Compare a crisp cheese slice in two neighborhoods. Fold it lengthwise, then pick your favorite.",
    tip: "A New York essential",
  },
  {
    title: "Build a bodega breakfast",
    borough: "Your neighborhood",
    description:
      "Order a bacon, egg, and cheese on a roll, grab a coffee, and find a bench for a proper New York morning.",
    tip: "The corner-store classic",
  },
  {
    title: "Make room for a street-cart dog",
    borough: "Manhattan · All five boroughs",
    description:
      "Take a hot dog with the works on a park stroll. The best picnic table might be closer than you think.",
    tip: "A walk-and-eat favorite",
  },
  {
    title: "Chase something sweet",
    borough: "The Bronx · Queens",
    description:
      "Pick a neighborhood bakery, split a fresh pastry, and let the next stop be whatever catches your eye.",
    tip: "Save room for dessert",
  },
  {
    title: "Try a chopped-cheese run",
    borough: "Harlem · The Bronx",
    description:
      "Find a neighborhood deli serving this bodega favorite, then take your sandwich to a nearby park.",
    tip: "A Harlem-born favorite",
  },
  {
    title: "Have a square-slice showdown",
    borough: "Brooklyn · Queens",
    description:
      "Compare a Sicilian or grandma slice with a classic round slice and decide which one gets the blue ribbon.",
    tip: "Two styles, one winner",
  },
];

const loading = document.querySelector("#inspiration-loading");
const cards = document.querySelector("#inspiration-cards");
const spinButton = document.querySelector("#refresh-inspiration-btn");
const spinLabel = spinButton.querySelector("span:nth-child(2)");
let previousPicks = [];

function choosePicks() {
  const available = picks.filter((pick) => !previousPicks.includes(pick.title));
  const pool = available.length >= 3 ? available : picks;

  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [pool[index], pool[swapIndex]] = [pool[swapIndex], pool[index]];
  }

  const selected = pool.slice(0, 3);
  previousPicks = selected.map((pick) => pick.title);
  return selected;
}

function createPickCard(pick, index) {
  const card = document.createElement("article");
  card.className = "nyc-fair-card";

  const number = document.createElement("span");
  number.className = "nyc-fair-card-number";
  number.textContent = `PICK 0${index + 1}`;

  if (pick.image) {
    const image = document.createElement("img");
    image.className = "nyc-fair-card-image";
    image.src = pick.image;
    image.alt = pick.imageAlt;
    image.loading = "lazy";

    const source = document.createElement("a");
    source.className = "nyc-fair-card-image-source";
    source.href = pick.imageSource;
    source.target = "_blank";
    source.rel = "noopener noreferrer";
    source.textContent = "Photo source";

    const imageWrap = document.createElement("div");
    imageWrap.className = "nyc-fair-card-image-wrap";
    imageWrap.append(image, source);
    card.append(number, imageWrap);
  } else {
    card.append(number);
  }

  const title = document.createElement("h3");
  title.textContent = pick.title;

  const borough = document.createElement("p");
  borough.className = "nyc-fair-card-borough";
  borough.textContent = pick.borough;

  const description = document.createElement("p");
  description.className = "nyc-fair-card-description";
  description.textContent = pick.description;

  const tip = document.createElement("span");
  tip.className = "nyc-fair-card-tip";
  tip.textContent = pick.tip;

  card.append(title, borough, description, tip);
  return card;
}

function renderPicks(initialPicks) {
  spinButton.disabled = true;
  spinButton.setAttribute("aria-busy", "true");
  spinLabel.textContent = "Spinning...";
  cards.setAttribute("aria-busy", "true");
  loading.hidden = false;

  window.setTimeout(() => {
    const selected = initialPicks || choosePicks();
    previousPicks = selected.map((pick) => pick.title);
    cards.replaceChildren(...selected.map(createPickCard));
    loading.hidden = true;
    cards.setAttribute("aria-busy", "false");
    spinButton.removeAttribute("aria-busy");
    spinButton.disabled = false;
    spinLabel.textContent = "Spin for Fresh Picks";
  }, 350);
}

spinButton.addEventListener("click", () => renderPicks());
renderPicks(picks.slice(0, 3));
