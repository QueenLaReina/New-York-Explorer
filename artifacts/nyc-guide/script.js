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
