import { cardStatesStore, isModalOpen } from "../../store/store";
import styles from "./Card.module.css";

export function initializeCard(cardId: string) {
  document.addEventListener("DOMContentLoaded", () => {
    const card = document.querySelector(`[data-card-id="${cardId}"]`);

    if (card) {
      // Store the original class
      const baseClass = styles.card;
      const clickedClass = styles.card_clicked;

      // Get inner containers
      const iconContainer = card.querySelector(`.${styles.cardIconContainer}`);
      const contentContainer = card.querySelector(`.${styles.cardContent}`);

      // Store original container classes
      const baseIconClass = styles.cardIconContainer;
      const clickedIconClass = styles.cardIconContainer_clicked;
      const baseContentClass = styles.cardContent;
      const clickedContentClass = styles.cardContent_clicked;

      cardStatesStore.subscribe((states) => {
        const state = states[cardId];
        const anyOtherModalOpen = Object.entries(states).some(
          ([id, s]) => id !== cardId && s.isModalOpen
        );
        const modalIsOpen = isModalOpen(cardId);

        if (state?.isClicked && modalIsOpen) {
          card.className = clickedClass;
          card.setAttribute("data-card-id", cardId);
          (card as HTMLElement).style.pointerEvents = "auto";

          // Update inner containers
          if (iconContainer) iconContainer.className = clickedIconClass;
          if (contentContainer)
            contentContainer.className = clickedContentClass;
        } else {
          card.className = baseClass;
          card.setAttribute("data-card-id", cardId);
          (card as HTMLElement).style.pointerEvents = anyOtherModalOpen
            ? "none"
            : "auto";

          // Reset inner containers
          if (iconContainer) iconContainer.className = baseIconClass;
          if (contentContainer) contentContainer.className = baseContentClass;
        }

        // Disable interaction when another modal is open
        if (anyOtherModalOpen && !state?.isClicked) {
          (card as HTMLElement).style.pointerEvents = "none";
        }
      });
    }
  });
}
