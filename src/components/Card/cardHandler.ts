import { cardStatesStore } from "../../store/store";

export function initializeCard(cardId: string) {
  document.addEventListener("DOMContentLoaded", () => {
    const card = document.querySelector(`[data-card-id="${cardId}"]`);

    if (card) {
      cardStatesStore.subscribe((states) => {
        const state = states[cardId];
        if (state?.isClicked) {
          card.classList.add("card-clicked");
        } else {
          card.classList.remove("card-clicked");
        }
        const anyOtherModalOpen = Object.entries(states).some(
          ([id, s]) => id !== cardId && s.isModalOpen
        );

        if (anyOtherModalOpen) {
          card.classList.add("card-disabled");
          (card as HTMLElement).style.pointerEvents = "none";
        } else {
          card.classList.remove("card-disabled");
          (card as HTMLElement).style.pointerEvents = "auto";
        }
      });
    }
  });
}
