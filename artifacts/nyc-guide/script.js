// Keep this list in page memory only; refreshing starts a fresh field guide.
const likesForm = document.querySelector("#likes-form");
const likeInput = document.querySelector("#like-input");
const likesList = document.querySelector("#likes-list");
const emptyMessage = document.querySelector("#list-empty");
const formStatus = document.querySelector("#form-status");

likesForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const note = likeInput.value.trim();

  // Ignore blank and whitespace-only notes.
  if (!note) {
    return;
  }

  emptyMessage?.remove();
  const item = document.createElement("li");
  item.textContent = note;
  likesList.append(item);
  likeInput.value = "";
  formStatus.textContent = "Added to your field notes.";
  likeInput.focus();
});

const birdButton = document.querySelector("#bird-button");
const birdImage = document.querySelector("#bluebird");

function flutterBird() {
  birdImage.classList.remove("is-shaking");
  // Reflow lets the animation play again on every click.
  void birdImage.offsetWidth;
  birdImage.classList.add("is-shaking");
}

birdButton.addEventListener("click", flutterBird);
birdImage.addEventListener("animationend", () => {
  birdImage.classList.remove("is-shaking");
});

// Keep the full navigation visible on larger screens and collapsible on phones.
const siteHeader = document.querySelector(".topbar");
const mainNavigation = document.querySelector("#main-nav");
const menuToggle = document.querySelector("#menu-toggle");
const desktopNavigation = window.matchMedia("(min-width: 761px)");

function setNavigationForViewport() {
  const isDesktop = desktopNavigation.matches;
  siteHeader.classList.toggle("menu-closed", !isDesktop);
  menuToggle.setAttribute("aria-expanded", String(isDesktop));
  menuToggle.setAttribute("aria-label", isDesktop ? "Hide navigation" : "Open navigation");
}

setNavigationForViewport();
desktopNavigation.addEventListener("change", setNavigationForViewport);

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  const nextOpen = !isOpen;
  siteHeader.classList.toggle("menu-closed", !nextOpen);
  menuToggle.setAttribute("aria-expanded", String(nextOpen));
  menuToggle.setAttribute("aria-label", nextOpen ? "Hide navigation" : "Open navigation");
});

mainNavigation.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement && !desktopNavigation.matches) {
    siteHeader.classList.add("menu-closed");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
  }
});
