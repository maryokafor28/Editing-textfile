document.addEventListener("DOMContentLoaded", () => {
  const slides = Array.from(document.querySelectorAll(".invite-slide"));
  const wrapper = document.querySelector(".carousel-wrapper");
  const editTextElems = Array.from(document.querySelectorAll(".edit-text"));
  const textArea = document.getElementById("text");
  const editIcon = document.querySelector(".edit-icon");
  const editingPanel = document.querySelector(".editing");
  const fontSelect = document.getElementById("fontfamily");
  const fontStyle = document.getElementById("fontstyle");
  const fontSize = document.getElementById("fontsize");
  const colorOptions = document.getElementById("colorOptions");

  let currentIndex = 0;
  let activeElement = null;

  function showSlide(index) {
    currentIndex = (index + slides.length) % slides.length;
    wrapper.style.transform = `translateX(-${currentIndex * 100}%)`;

    const activeSlide = slides[currentIndex];
    const activeTextElement = activeSlide.querySelector(".edit-text");
    if (activeTextElement) {
      textArea.value = activeTextElement.textContent;
      activeElement = activeTextElement;
    } else {
      textArea.value = "";
      activeElement = null;
    }
  }

  window.nextSlide = function () {
    currentIndex = (currentIndex + 1) % slides.length;
    showSlide(currentIndex);
  };

  window.prevSlide = function () {
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    showSlide(currentIndex);
  };

  // clicking a slide's text makes it active (and navigates to that slide)
  editTextElems.forEach((el) => {
    el.style.position = el.style.position || "absolute";
    el.style.cursor = "grab";

    el.addEventListener("click", (ev) => {
      ev.stopPropagation();
      const parentSlide = el.closest(".invite-slide");
      const idx = slides.indexOf(parentSlide);
      if (idx >= 0 && idx !== currentIndex) showSlide(idx);
      textArea.focus();
      textArea.value = el.textContent;
      activeElement = el;
    });
  });

  // typing updates the current active element (visible slide)
  textArea.addEventListener("input", () => {
    if (activeElement) {
      activeElement.textContent = textArea.value;
    } else {
      // fallback: if no activeElement, update visible slide's text node if exists
      const activeSlide = slides[currentIndex];
      const el = activeSlide.querySelector(".edit-text");
      if (el) el.textContent = textArea.value;
    }
  });

  // hide editor controls
  function initEditor() {
    if (!editingPanel) return;
    const controls = editingPanel.querySelectorAll(
      ".language, .fonts, .text-controls, .animations"
    );
    controls.forEach((control) => (control.style.display = "none"));
    showSlide(currentIndex);
  }

  // toggle controls (preserve CSS flex by clearing inline style)
  if (editIcon && editingPanel) {
    editIcon.addEventListener("click", (e) => {
      e.stopPropagation();
      const controls = editingPanel.querySelectorAll(
        ".language, .fonts, .text-controls, .animations"
      );
      controls.forEach((control) => {
        control.style.display = control.style.display === "none" ? "" : "none";
      });
    });
  }

  // FONT FAMILY //
  if (fontSelect) {
    fontSelect.addEventListener("change", () => {
      const selectedFont = fontSelect.value;
      if (activeElement) {
        activeElement.style.fontFamily = selectedFont;
      } else {
        // current slide's edit-text
        const activeSlide = slides[currentIndex];
        const el = activeSlide.querySelector(".edit-text");
        if (el) el.style.fontFamily = selectedFont;
      }
    });
  }

  // FONT STYLE //
  if (fontStyle) {
    fontStyle.addEventListener("change", () => {
      const selectedStyle = fontStyle.value; // normal | italic | oblique
      if (activeElement) {
        activeElement.style.fontStyle = selectedStyle;
      } else {
        const el = slides[currentIndex].querySelector(".edit-text");
        if (el) el.style.fontStyle = selectedStyle;
      }
    });
  }

  // FONT SIZE//
  if (fontSize) {
    fontSize.addEventListener("change", () => {
      const selectedSize = fontSize.value; // 16px, 20px, 24px, 28px, 32px
      if (activeElement) {
        activeElement.style.fontSize = selectedSize;
      } else {
        const el = slides[currentIndex].querySelector(".edit-text");
        if (el) el.style.fontSize = selectedSize;
      }
    });
  }
  // COLOR PICKER//
  if (colorOptions) {
    colorOptions.addEventListener("click", (e) => {
      if (e.target.classList.contains("color-box")) {
        const selectedColor = e.target.getAttribute("data-color");
        if (activeElement) {
          activeElement.style.color = selectedColor;
        } else {
          const el = slides[currentIndex].querySelector(".edit-text");
          if (el) el.style.color = selectedColor;
        }

        // Visual feedback - highlight selected color
        const allColorBoxes = colorOptions.querySelectorAll(".color-box");
        allColorBoxes.forEach((box) => box.classList.remove("selected"));
        e.target.classList.add("selected");
      }
    });
  }

  // DRAGGING logic — constrain per slide
  editTextElems.forEach((textEl) => {
    textEl.style.touchAction = "none"; // prevent touch scrolling while dragging
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;
    const slideEl = textEl.closest(".invite-slide");
    if (slideEl) slideEl.style.position = slideEl.style.position || "relative";

    function startDrag(clientX, clientY) {
      isDragging = true;
      const textRect = textEl.getBoundingClientRect();
      offsetX = clientX - textRect.left;
      offsetY = clientY - textRect.top;
      textEl.style.cursor = "grabbing";
      textEl.style.zIndex = 999;
    }

    function moveDrag(clientX, clientY) {
      if (!isDragging) return;
      const slideRect = slideEl.getBoundingClientRect();
      const textRect = textEl.getBoundingClientRect();

      let x = clientX - slideRect.left - offsetX;
      let y = clientY - slideRect.top - offsetY;

      // clamp inside slide
      if (x < 0) x = 0;
      if (y < 0) y = 0;
      if (x + textRect.width > slideRect.width)
        x = slideRect.width - textRect.width;
      if (y + textRect.height > slideRect.height)
        y = slideRect.height - textRect.height;

      textEl.style.left = x + "px";
      textEl.style.top = y + "px";
    }

    function endDrag() {
      isDragging = false;
      textEl.style.cursor = "grab";
      textEl.style.zIndex = "";
    }

    // mouse
    textEl.addEventListener("mousedown", (e) => {
      e.preventDefault();
      startDrag(e.clientX, e.clientY);
    });
    document.addEventListener("mousemove", (e) =>
      moveDrag(e.clientX, e.clientY)
    );
    document.addEventListener("mouseup", endDrag);

    // touch
    textEl.addEventListener(
      "touchstart",
      (e) => {
        const t = e.touches[0];
        startDrag(t.clientX, t.clientY);
        e.preventDefault();
      },
      { passive: false }
    );
    document.addEventListener(
      "touchmove",
      (e) => {
        if (!isDragging) return;
        const t = e.touches[0];
        moveDrag(t.clientX, t.clientY);
        e.preventDefault();
      },
      { passive: false }
    );
    document.addEventListener("touchend", endDrag, { passive: true });
  });

  initEditor();
});
