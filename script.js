document.addEventListener("DOMContentLoaded", () => {
  const slides = Array.from(document.querySelectorAll(".invite-slide"));
  const wrapper = document.querySelector(".carousel-wrapper");
  const editTextElems = Array.from(document.querySelectorAll(".edit-text"));
  const textArea = document.getElementById("text");
  const editIcon = document.querySelector(".edit-icon");
  const editingPanel = document.querySelector(".editing");

  let currentIndex = 0;
  let activeElement = null;

  function showSlide(index) {
    // normalize index
    currentIndex = (index + slides.length) % slides.length;
    // move whole wrapper (percent works when each slide is 100% width)
    wrapper.style.transform = `translateX(-${currentIndex * 100}%)`;

    // sync textarea to visible slide
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

  // expose for inline onclicks
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
    // make editable headings easier to spot / drag
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

  // init/hide editor controls
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

  // clicking outside hides controls
  document.addEventListener("click", (e) => {
    if (!editingPanel || !editIcon) return;
    if (!editingPanel.contains(e.target) && !editIcon.contains(e.target)) {
      const controls = editingPanel.querySelectorAll(
        ".language, .fonts, .text-controls, .animations"
      );
      controls.forEach((control) => (control.style.display = "none"));
    }
  });

  // DRAGGING logic — constrain per slide (works with absolute-positioned .edit-text)
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
}); // DOMContentLoaded end
