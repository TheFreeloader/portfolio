(function () {
  let globalModalZ = 2000;

  function initializeModal(config) {
    var cardId = config.cardId;
    var cardElementId = config.cardElementId;
    var modalOverlayId = config.modalOverlayId;
    var closeModalId = config.closeModalId;
    var modalContentId = config.modalContentId;
    var modalHeaderId = config.modalHeaderId;
    var excludeFromDrag = config.excludeFromDrag || [];

    var cardElement = document.getElementById(cardElementId);
    var modalContainer = document.getElementById(modalOverlayId);
    var closeModal = document.getElementById(closeModalId);
    var modalContent = document.getElementById(modalContentId);
    var modalHeader = document.getElementById(modalHeaderId);

    var cardInnerElement =
      cardElement && cardElement.querySelector("[class*='card']");

    var isDragging = false;
    var currentX, currentY, initialX, initialY;
    var xOffset = 0,
      yOffset = 0;

    function bringToFront() {
      if (modalContainer) {
        modalContainer.style.zIndex = String(globalModalZ++);
      }
    }

    if (window.isModalOpen && window.isModalOpen(cardId) && modalContainer) {
      modalContainer.classList.remove("hidden");
      modalContainer.classList.add("visible");
      modalContainer.style.zIndex = String(globalModalZ++);
    }

    if (cardElement && modalContainer && closeModal) {
      // Long press logic
      var pressTimer = null;
      var isLongPress = false;
      var longPressDuration = 500;

      function openModal(event) {
        if (window.isModalOpen && window.isModalOpen(cardId)) {
          bringToFront();
          event.preventDefault();
          event.stopPropagation();
          return;
        }

        if (window.canCardBeClicked && !window.canCardBeClicked(cardId)) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }

        window.setCardClicked && window.setCardClicked(cardId, true);
        window.setModalOpen && window.setModalOpen(cardId, true);

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
      }

      function startPress(event) {
        if (pressTimer) clearTimeout(pressTimer);
        isLongPress = false;
        pressTimer = setTimeout(function () {
          isLongPress = true;
          openModal(event);
        }, longPressDuration);
      }

      function cancelPress(event) {
        if (pressTimer) clearTimeout(pressTimer);
      }
      
      // Touch devices: long press to open
      cardElement.addEventListener("touchstart", startPress, { passive: false });
      cardElement.addEventListener("touchend", cancelPress);
      cardElement.addEventListener("touchmove", cancelPress);
      
      // Desktop: instant click to open
      cardElement.addEventListener("click", function (e) {
        // Only trigger on desktop (non-touch)
        if (!("ontouchstart" in window)) {
          openModal(e);
        }
      });

      modalContainer.addEventListener("click", function (event) {
        bringToFront();
        event.stopPropagation();
      });

      modalContainer.addEventListener(
        "touchstart",
        function (event) {
          bringToFront();
          event.stopPropagation();
        },
        { passive: true }
      );

      modalContainer.addEventListener("mousedown", function (event) {
        bringToFront();
        event.stopPropagation();
      });

      closeModal.addEventListener("click", function (event) {
        window.setCardClicked && window.setCardClicked(cardId, false);
        window.setModalOpen && window.setModalOpen(cardId, false);
        modalContainer.classList.add("hidden");
        modalContainer.classList.remove("visible");

        if (cardInnerElement) {
          cardInnerElement.classList.remove("card-clicked");
        }

        event.preventDefault();
        event.stopPropagation();
      });

      document.addEventListener("keydown", function (event) {
        if (
          event.key === "Escape" &&
          window.isModalOpen &&
          window.isModalOpen(cardId)
        ) {
          var allModals = document.querySelectorAll(
            '[id*="modalOverlay"]:not(.hidden)'
          );
          var isTopmost = true;
          var currentZIndex = parseInt(modalContainer.style.zIndex || "0");

          allModals.forEach(function (modal) {
            var zIndex = parseInt(modal.style.zIndex || "0");
            if (zIndex > currentZIndex) {
              isTopmost = false;
            }
          });

          if (isTopmost) {
            window.setCardClicked && window.setCardClicked(cardId, false);
            window.setModalOpen && window.setModalOpen(cardId, false);
            modalContainer.classList.add("hidden");
            modalContainer.classList.remove("visible");

            if (cardInnerElement) {
              cardInnerElement.classList.remove("card-clicked");
            }
          }
        }
      });
    }

    function dragStart(e) {
      if (
        !(
          e.target === modalHeader ||
          (e.target instanceof Element && e.target.closest(".modal_header"))
        )
      ) {
        return;
      }

      var defaultExclusions = [".close_button", "INPUT", "TEXTAREA", "BUTTON"];
      var allExclusions = defaultExclusions.concat(excludeFromDrag);

      for (var i = 0; i < allExclusions.length; i++) {
        var exclusion = allExclusions[i];
        if (e.target instanceof Element) {
          if (exclusion.charAt(0) === ".") {
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
        initialX = e.touches[0].clientX - xOffset;
        initialY = e.touches[0].clientY - yOffset;
      } else {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
      }

      isDragging = true;

      if (e.type === "mousedown" || (e.type === "touchstart" && e.cancelable)) {
        e.preventDefault();
      }
      e.stopPropagation();
    }

    function dragEnd(e) {
      isDragging = false;
      if (modalContent) modalContent.classList.remove("dragging");
      e.stopPropagation();
    }

    function drag(e) {
      if (isDragging) {
        if (e.cancelable) {
          e.preventDefault();
        }
        e.stopPropagation();

        if (e.type === "touchmove") {
          currentX = e.touches[0].clientX - initialX;
          currentY = e.touches[0].clientY - initialY;
        } else {
          currentX = e.clientX - initialX;
          currentY = e.clientY - initialY;
        }

        xOffset = currentX;
        yOffset = currentY;

        if (modalContent) {
          modalContent.style.transform =
            "translate(" + currentX + "px, " + currentY + "px)";
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

  window.initializeModal = initializeModal;
})();
