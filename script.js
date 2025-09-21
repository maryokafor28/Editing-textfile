const slides = document.querySelectorAll(".invite-slide");
const wrapper = document.querySelector(".carousel-wrapper");
const editText = document.querySelectorAll(".edit-text");
const textArea = document.getElementById("text");

let currentIndex = 0;

function updateSlide() {
  wrapper.style.transform = `translateX(-${currentIndex * 100}%)`;
}

function nextSlide() {
  currentIndex = (currentIndex + 1) % slides.length;
  updateSlide();
}

function prevSlide() {
  currentIndex = (currentIndex - 1 + slides.length) % slides.length;
  updateSlide();
}
let activeElement = null;
editText.forEach((el) => {
  el.addEventListener("click", () => {
    textArea.value = el.textContent;
    activeElement = el;
  });
});
textArea.addEventListener("input", () => {
  if (activeElement) {
    activeElement.textContent = textArea.value;
  }
});
