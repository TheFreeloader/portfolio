import {
  setCardClicked,
  setModalOpen,
  isModalOpen,
  canCardBeClicked,
} from "../store/store";

let globalModalZ = 2000;

interface ModalConfig {
  cardId: string;
  cardElementId: string;
  modalOverlayId: string;
  closeModalId: string;
  modalContentId: string;
  modalHeaderId: string;
  excludeFromDrag?: string[];
}

export function initializeModal(config: ModalConfig) {
  const {
    cardId,
    cardElementId,
    modalOverlayId,
    closeModalId,
    modalContentId,
    modalHeaderId,
    excludeFromDrag = [],
  } = config;

  const cardElement = document.getElementById(cardElementId);
  const modalContainer = document.getElementById(modalOverlayId);
  const closeModal = document.getElementById(closeModalId);
  const modalContent = document.getElementById(modalContentId);
  const modalHeader = document.getElementById(modalHeaderId);

  const cardInnerElement = cardElement?.querySelector("[class*='card']");

  let isDragging = false;
  let currentX: number;
  let currentY: number;
  let initialX: number;
  let initialY: number;
  let xOffset = 0;
  let yOffset = 0;

  const bringToFront = () => {
    if (modalContainer) {
      modalContainer.style.zIndex = String(globalModalZ++);
    }
  };

  // Check if modal should be open on initialization
  if (isModalOpen(cardId) && modalContainer) {
    modalContainer.classList.remove("hidden");
    modalContainer.classList.add("visible");
    modalContainer.style.zIndex = String(globalModalZ++);
  }

  if (cardElement && modalContainer && closeModal) {
    cardElement.addEventListener("click", (event) => {
      console.log(`Card clicked: ${cardId}`);
      console.log(`Can card be clicked: ${canCardBeClicked(cardId)}`);
      console.log(`Is modal open: ${isModalOpen(cardId)}`);

      // If THIS modal is already open, just bring it to front
      if (isModalOpen(cardId)) {
        console.log(`Modal ${cardId} already open, bringing to front`);
        bringToFront();
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      // Check if THIS specific card can be clicked
      if (!canCardBeClicked(cardId)) {
        console.log(`Card ${cardId} cannot be clicked`);
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      console.log(`Opening modal: ${cardId}`);

      // Open this modal
      setCardClicked(cardId, true);
      setModalOpen(cardId, true);

      if (cardInnerElement) {
        cardInnerElement.classList.add("card-clicked");
      }

      modalContainer.classList.remove("hidden");
      modalContainer.classList.add("visible");
      bringToFront();

      // Reset position
      if (modalContent) {
        modalContent.style.transform = "translate(0px, 0px)";
        xOffset = 0;
        yOffset = 0;
      }

      // Prevent event bubbling to avoid interference with other modals
      event.preventDefault();
      event.stopPropagation();
    });

    // Bring modal to front when clicked
    modalContainer.addEventListener("click", (event) => {
      bringToFront();
      event.stopPropagation(); // Prevent interference with other modals
    });

    modalContainer.addEventListener("touchstart", (event) => {
      bringToFront();
      event.stopPropagation();
    });

    modalContainer.addEventListener("mousedown", (event) => {
      bringToFront();
      event.stopPropagation();
    });

    // Close modal
    closeModal.addEventListener("click", (event) => {
      console.log(`Closing modal: ${cardId}`);
      setCardClicked(cardId, false);
      setModalOpen(cardId, false);
      modalContainer.classList.add("hidden");
      modalContainer.classList.remove("visible");

      if (cardInnerElement) {
        cardInnerElement.classList.remove("card-clicked");
      }

      event.preventDefault();
      event.stopPropagation();
    });

    // Handle ESC key - only close if this modal is the topmost
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && isModalOpen(cardId)) {
        // Check if this modal is the topmost by comparing z-index
        const allModals = document.querySelectorAll(
          '[id*="modalOverlay"]:not(.hidden)'
        );
        let isTopmost = true;
        let currentZIndex = parseInt(modalContainer.style.zIndex || "0");

        allModals.forEach((modal) => {
          const zIndex = parseInt((modal as HTMLElement).style.zIndex || "0");
          if (zIndex > currentZIndex) {
            isTopmost = false;
          }
        });

        if (isTopmost) {
          console.log(`Closing modal via ESC: ${cardId}`);
          setCardClicked(cardId, false);
          setModalOpen(cardId, false);
          modalContainer.classList.add("hidden");
          modalContainer.classList.remove("visible");

          if (cardInnerElement) {
            cardInnerElement.classList.remove("card-clicked");
          }
        }
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

    const defaultExclusions = [".close_button", "INPUT", "TEXTAREA", "BUTTON"];
    const allExclusions = [...defaultExclusions, ...excludeFromDrag];

    for (const exclusion of allExclusions) {
      if (e.target instanceof Element) {
        if (exclusion.startsWith(".")) {
          if (e.target.closest(exclusion)) return;
        } else {
          if (e.target.tagName === exclusion) return;
        }
      }
    }

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

    // Prevent event bubbling during drag
    e.preventDefault();
    e.stopPropagation();
  }

  function dragEnd(e: MouseEvent | TouchEvent) {
    isDragging = false;
    modalContent?.classList.remove("dragging");

    // Prevent event bubbling
    e.preventDefault();
    e.stopPropagation();
  }

  function drag(e: MouseEvent | TouchEvent) {
    if (isDragging) {
      e.preventDefault();
      e.stopPropagation();

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
}
