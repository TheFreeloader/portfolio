import {
  setCardClicked,
  setModalOpen,
  isModalOpen,
  canCardBeClicked,
} from "../../store/store";

let globalModalZ = 2000;

export function initializeContact(cardId: string) {
  document.addEventListener("DOMContentLoaded", () => {
    const contactCard = document.getElementById("contactCard");
    const modalContainer = document.getElementById("contactModalOverlay");
    const closeModal = document.getElementById("contactCloseModal");
    const modalContent = document.getElementById("contactContainer");
    const modalHeader = document.getElementById("contactModalHeader");

    const cardElement = contactCard?.querySelector("[class*='card']");

    let isDragging = false;
    let currentX: number;
    let currentY: number;
    let initialX: number;
    let initialY: number;
    let xOffset = 0;
    let yOffset = 0;

    // Function to bring modal to front
    const bringToFront = () => {
      if (modalContainer) {
        modalContainer.style.zIndex = String(globalModalZ++);
      }
    };

    if (isModalOpen(cardId) && modalContainer) {
      modalContainer.style.display = "flex";
      modalContainer.style.zIndex = String(globalModalZ++);
    }

    if (contactCard && modalContainer && closeModal) {
      contactCard.addEventListener("click", (event) => {
        if (isModalOpen(cardId)) {
          // Bring this modal to front
          bringToFront();
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
        bringToFront();
        if (modalContent) {
          modalContent.style.transform = "translate(0px, 0px)";
          xOffset = 0;
          yOffset = 0;
        }
      });

      // Add event listeners for bringing modal to front on interaction
      modalContainer.addEventListener("click", bringToFront);
      modalContainer.addEventListener("touchstart", bringToFront);
      modalContainer.addEventListener("mousedown", bringToFront);

      closeModal.addEventListener("click", () => {
        setModalOpen(cardId, false);
        modalContainer.style.display = "none";
      });

      document.addEventListener("keydown", (event) => {
        if (
          event.key === "Escape" &&
          isModalOpen(cardId) &&
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

      if (
        (e.target instanceof Element && e.target.closest(".close_button")) ||
        (e.target instanceof Element && e.target.tagName === "INPUT") ||
        (e.target instanceof Element && e.target.tagName === "TEXTAREA") ||
        (e.target instanceof Element && e.target.tagName === "BUTTON") ||
        (e.target instanceof Element && e.target.closest("form"))
      ) {
        return;
      }

      // Bring modal to front when dragging starts
      bringToFront();

      if (modalContent) {
        modalContent.classList.add("dragging");
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