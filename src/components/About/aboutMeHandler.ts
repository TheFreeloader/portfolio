import {
  setCardClicked,
  setModalOpen,
  isModalOpen,
  canCardBeClicked,
} from "../../store/store";

export function initializeAboutMe(cardId: string) {
  document.addEventListener("DOMContentLoaded", () => {
    const aboutCard = document.getElementById("aboutCard");
    const modalContainer = document.getElementById("modalOverlay");
    const closeModal = document.getElementById("closeModal");
    const modalContent = document.getElementById("aboutContainer");
    const modalHeader = document.getElementById("modalHeader");

    const cardElement = aboutCard?.querySelector("[class*='card']");

    let isDragging = false;
    let currentX: number;
    let currentY: number;
    let initialX: number;
    let initialY: number;
    let xOffset = 0;
    let yOffset = 0;
    if (isModalOpen(cardId) && modalContainer) {
      modalContainer.style.display = "flex";
    }

    if (aboutCard && modalContainer && closeModal) {
      aboutCard.addEventListener("click", (event) => {
        if (isModalOpen(cardId)) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        if (!canCardBeClicked(cardId)) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        setCardClicked(cardId, true);
        setModalOpen(cardId, true);

        if (cardElement) {
          cardElement.classList.add("card-clicked");
        }
        modalContainer.style.display = "flex";
        if (modalContent) {
          modalContent.style.transform = "translate(0px, 0px)";
          xOffset = 0;
          yOffset = 0;
        }
      });

      closeModal.addEventListener("click", () => {
        setModalOpen(cardId, false);
        modalContainer.style.display = "none";
      });

      document.addEventListener("keydown", (event) => {
        if (
          event.key === "Escape" &&
          getComputedStyle(modalContainer).display !== "none"
        ) {
          setModalOpen(cardId, false);
          modalContainer.style.display = "none";
        }
      });
    }
    function dragStart(e: MouseEvent | TouchEvent) {
      if (
        !(
          e.target === modalHeader ||
          (e.target instanceof Element && e.target.closest(".modal_header"))
        )
      ) {
        return;
      }

      if (modalContent) {
        modalContent.classList.add("dragging");
      }

      if (
        (e.target instanceof Element && e.target.closest(".close_button")) ||
        (e.target instanceof Element && e.target.tagName === "INPUT") ||
        (e.target instanceof Element && e.target.tagName === "TEXTAREA")
      ) {
        return;
      }

      if (e.type === "touchstart") {
        const touchEvent = e as TouchEvent;
        initialX = touchEvent.touches[0].clientX - xOffset;
        initialY = touchEvent.touches[0].clientY - yOffset;
      } else {
        const mouseEvent = e as MouseEvent;
        initialX = mouseEvent.clientX - xOffset;
        initialY = mouseEvent.clientY - yOffset;
      }

      isDragging = true;
    }

    function dragEnd() {
      isDragging = false;
      modalContent?.classList.remove("dragging");
    }

    function drag(e: MouseEvent | TouchEvent) {
      if (isDragging) {
        e.preventDefault();

        if (e.type === "touchmove") {
          const touchEvent = e as TouchEvent;
          currentX = touchEvent.touches[0].clientX - initialX;
          currentY = touchEvent.touches[0].clientY - initialY;
        } else {
          const mouseEvent = e as MouseEvent;
          currentX = mouseEvent.clientX - initialX;
          currentY = mouseEvent.clientY - initialY;
        }

        xOffset = currentX;
        yOffset = currentY;

        if (modalContent) {
          modalContent.style.transform = `translate(${currentX}px, ${currentY}px)`;
        }
      }
    }

    if (modalContent) {
      modalContent.addEventListener("mousedown", dragStart);
      modalContent.addEventListener("touchstart", dragStart, {
        passive: false,
      });
      document.addEventListener("mouseup", dragEnd);
      document.addEventListener("touchend", dragEnd);
      document.addEventListener("mousemove", drag);
      document.addEventListener("touchmove", drag, { passive: false });
    }
  });
}
