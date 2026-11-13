const form = document.querySelector("#dish-upload-form");
const titleInput = document.querySelector("#dish-name");
const captionInput = document.querySelector("#dish-caption");
const fileInput = document.querySelector("#dish-photo");
const fileName = document.querySelector("#dish-file-name");
const submitButton = document.querySelector("#dish-submit");
const formStatus = document.querySelector("#dish-status");
const galleryStatus = document.querySelector("#dish-gallery-status");
const gallery = document.querySelector("#dish-gallery");

fileInput.addEventListener("change", () => {
  fileName.textContent = fileInput.files?.[0]?.name || "Pick a snapshot";
  formStatus.textContent = "";
});

async function resizeImageToDataUrl(file, maxDimension = 1280) {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Choose a JPEG, PNG, or WebP photo.");
  }

  const source = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read the selected photo."));
    reader.readAsDataURL(file);
  });

  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("The selected photo could not be opened."));
    img.src = source;
  });

  let { width, height } = image;
  if (width > maxDimension || height > maxDimension) {
    const scale = maxDimension / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Could not prepare the selected photo.");
  }
  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL(file.type, 0.88);
}

function renderDish(dish) {
  const card = document.createElement("article");
  card.className = "nyc-gallery-card";

  const accent = document.createElement("div");
  accent.className = "nyc-gallery-card-accent";
  accent.setAttribute("aria-hidden", "true");

  const image = document.createElement("img");
  image.className = "nyc-gallery-card-image";
  image.src = dish.imageUrl;
  image.alt = dish.title;
  image.loading = "lazy";

  const body = document.createElement("div");
  body.className = "nyc-gallery-card-copy";

  const kicker = document.createElement("p");
  kicker.className = "nyc-gallery-card-kicker";
  kicker.textContent = "A neighborhood champion";

  const title = document.createElement("h4");
  title.textContent = dish.title;

  body.append(kicker, title);
  if (dish.caption) {
    const caption = document.createElement("p");
    caption.className = "nyc-gallery-card-caption";
    caption.textContent = dish.caption;
    body.append(caption);
  }

  const footer = document.createElement("div");
  footer.className = "nyc-gallery-card-footer";
  const date = document.createElement("time");
  date.dateTime = dish.createdAt;
  date.textContent = new Date(dish.createdAt).toLocaleDateString();
  footer.append(date);
  if (dish.inspectorNote) {
    const note = document.createElement("p");
    note.className = "nyc-gallery-card-note";
    note.textContent = dish.inspectorNote;
    body.append(note);
  }
  body.append(footer);
  card.append(accent, image, body);
  return card;
}

async function loadDishes() {
  galleryStatus.textContent = "Loading community plates...";
  try {
    const response = await fetch("/api/dishes");
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Community plates could not be loaded.");
    }

    gallery.replaceChildren(...data.dishes.map(renderDish));
    galleryStatus.hidden = data.dishes.length > 0;
    galleryStatus.textContent = data.dishes.length
      ? ""
      : "— The booths are open! Drop your favorite local bite above to crown our first neighborhood champion.";
  } catch (error) {
    galleryStatus.hidden = false;
    galleryStatus.textContent =
      error instanceof Error ? error.message : "Community plates could not be loaded.";
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const file = fileInput.files?.[0];
  if (!file) {
    formStatus.textContent = "Pick a snapshot to pin your dish to the board.";
    return;
  }
  if (file.size > 3 * 1024 * 1024) {
    formStatus.textContent = "That photo is too large. Choose a photo under 3 MB.";
    return;
  }

  submitButton.disabled = true;
  formStatus.textContent = "Preparing your photo...";
  try {
    const image = await resizeImageToDataUrl(file);
    const response = await fetch("/api/dishes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: titleInput.value.trim(),
        caption: captionInput.value.trim(),
        image,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      const message = data.reason ? `${data.error} ${data.reason}` : data.error;
      throw new Error(message || "The dish could not be shared.");
    }

    const card = renderDish(data.dish);
    gallery.prepend(card);
    while (gallery.children.length > 3) {
      gallery.lastElementChild.remove();
    }
    galleryStatus.hidden = true;
    form.reset();
    fileName.textContent = "Pick a snapshot";
    formStatus.textContent = "Your pick is pinned to the board.";
  } catch (error) {
    formStatus.textContent =
      error instanceof Error ? error.message : "The dish could not be shared.";
  } finally {
    submitButton.disabled = false;
  }
});

void loadDishes();
