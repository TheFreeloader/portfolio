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

  if (isModalOpen(cardId) && modalContainer) {
    modalContainer.classList.remove("hidden");
    modalContainer.classList.add("visible");
    modalContainer.style.zIndex = String(globalModalZ++);
  }

  if (cardElement && modalContainer && closeModal) {
    cardElement.addEventListener("click", (event) => {
      if (isModalOpen(cardId)) {
        bringToFront();
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

      if (cardInnerElement) {
        cardInnerElement.classList.add("card-clicked");
      }

      modalContainer.classList.remove("hidden");
      modalContainer.classList.add("visible");
      bringToFront();

      if (modalContent) {
        modalContent.style.transform = "translate(0px, 0px)";
        xOffset = 0;
        yOffset = 0;
      }

      event.preventDefault();
      event.stopPropagation();
    });

    modalContainer.addEventListener("click", (event) => {
      bringToFront();
      event.stopPropagation();
    });

    modalContainer.addEventListener(
      "touchstart",
      (event) => {
        bringToFront();
        event.stopPropagation();
      },
      { passive: true }
    );

    modalContainer.addEventListener("mousedown", (event) => {
      bringToFront();
      event.stopPropagation();
    });

    closeModal.addEventListener("click", (event) => {
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

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && isModalOpen(cardId)) {
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

    if (e.type === "mousedown" || (e.type === "touchstart" && e.cancelable)) {
      e.preventDefault();
    }
    e.stopPropagation();
  }

  function dragEnd(e: MouseEvent | TouchEvent) {
    isDragging = false;
    modalContent?.classList.remove("dragging");
    e.stopPropagation();
  }

  function drag(e: MouseEvent | TouchEvent) {
    if (isDragging) {
      if (e.cancelable) {
        e.preventDefault();
      }
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
    document.addEventListener("touchend", dragEnd, { passive: true });
    document.addEventListener("mousemove", drag);
    document.addEventListener("touchmove", drag, { passive: false });
  }
}
