const slides = document.querySelectorAll(".invite-slide");
const wrapper = document.querySelector(".carousel-wrapper");
const editText = document.querySelectorAll(".edit-text");
const textArea = document.getElementById("text");
const editIcon = document.querySelector(".edit-icon");
const editingPanel = document.querySelector(".editing");

// FOR CAROUSEL //
let currentIndex = 0;

function showSlide(index) {
  slides.forEach((slide, i) => {
    slide.style.transform = `translateX(${100 * (i - index)}%)`;
  });

  const activeSlide = slides[index];
  const activeTextElement = activeSlide.querySelector(".edit-text");
  if (activeTextElement) {
    textArea.value = activeTextElement.textContent;
  }
}

function nextSlide() {
  currentIndex = (currentIndex + 1) % slides.length;
  showSlide(currentIndex);
}

// Go previous
function prevSlide() {
  currentIndex = (currentIndex - 1 + slides.length) % slides.length;
  showSlide(currentIndex);
}

// FOR EDIT TEXT //
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

// INIT EDITOR //
function initEditor() {
  // On load → hide controls, but keep textarea visible
  const controls = editingPanel.querySelectorAll(
    ".language, .fonts, .text-controls, .animations"
  );
  controls.forEach((control) => (control.style.display = "none"));
  showSlide(currentIndex);
}

// Toggle editor controls with icon
if (editIcon) {
  editIcon.addEventListener("click", (e) => {
    e.stopPropagation();
    const controls = editingPanel.querySelectorAll(
      ".language, .fonts, .text-controls, .animations"
    );
    controls.forEach((control) => {
      if (control.style.display === "none") {
        // clear inline style so CSS flex kicks in
        control.style.display = "";
      } else {
        control.style.display = "none";
      }
    });
  });
}

// Hide controls again if clicked outside (keep textarea visible)
document.addEventListener("click", (e) => {
  if (!editingPanel.contains(e.target) && !editIcon.contains(e.target)) {
    const controls = editingPanel.querySelectorAll(
      ".language, .fonts, .text-controls, .animations"
    );
    controls.forEach((control) => (control.style.display = "none"));
  }
});

// Initialize on page load
initEditor();
