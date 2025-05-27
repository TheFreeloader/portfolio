import { cardStatesStore, isModalOpen } from "../../store/store";

export function initializeCard(cardId: string) {
  document.addEventListener("DOMContentLoaded", () => {
    const card = document.querySelector(`[data-card-id="${cardId}"]`);

    if (card) {
      // Base Tailwind classes for card
      const baseClasses =
        "flex flex-col justify-between transition-[transform,box-shadow] duration-200 ease-in-out overflow-hidden bg-[#766257] min-w-[200px] max-w-[200px] min-h-[200px] max-h-[200px] rounded-xl border border-white select-none hover:translate-y-[-5px] hover:shadow-[0_10px_20px_rgba(0,0,0,0.2)]";

      // Clicked state classes - using CSS for background image since Tailwind has issues with relative paths
      const clickedClasses =
        "flex flex-col justify-between min-w-[200px] max-w-[200px] min-h-[200px] max-h-[200px] overflow-hidden rounded-xl select-none card-clicked";

      // Get inner containers
      const iconContainer = card.querySelector(".icon-container");
      const contentContainer = card.querySelector(".content-container");

      // Base container classes
      const baseIconClasses =
        "flex justify-center items-center h-20 rounded-t-xl p-4";
      const baseContentClasses =
        "flex justify-center items-center bg-[#362b14] px-4 h-[120px]";

      // Clicked container classes
      const clickedIconClasses =
        "flex justify-center items-center rounded-t-xl h-20 p-4 border-r border-white";
      const clickedContentClasses =
        "flex justify-center items-center bg-[#362b14] px-4 h-[120px] border-b border-l border-r border-white rounded-b-xl";

      // Get subtract background from data attribute
      const subtractBg = card.getAttribute("data-subtract-bg");

      cardStatesStore.subscribe((states) => {
        const state = states[cardId];
        const anyOtherModalOpen = Object.entries(states).some(
          ([id, s]) => id !== cardId && s.isModalOpen
        );
        const modalIsOpen = isModalOpen(cardId);

        if (state?.isClicked && modalIsOpen) {
          // Apply clicked state
          card.className = clickedClasses;
          card.setAttribute("data-card-id", cardId);
          (card as HTMLElement).style.pointerEvents = "auto";

          // Set background image for clicked state
          if (subtractBg) {
            (card as HTMLElement).style.backgroundImage = `url(${subtractBg})`;
            (card as HTMLElement).style.backgroundSize = "contain";
            (card as HTMLElement).style.backgroundRepeat = "no-repeat";
            (card as HTMLElement).style.backgroundColor = "transparent";
            (card as HTMLElement).style.border = "none";
          }

          // Update inner containers
          if (iconContainer) iconContainer.className = clickedIconClasses;
          if (contentContainer)
            contentContainer.className = clickedContentClasses;
        } else {
          // Apply base state
          card.className = baseClasses;
          card.setAttribute("data-card-id", cardId);
          (card as HTMLElement).style.pointerEvents = anyOtherModalOpen
            ? "none"
            : "auto";

          // Reset background styles
          (card as HTMLElement).style.backgroundImage = "";
          (card as HTMLElement).style.backgroundSize = "";
          (card as HTMLElement).style.backgroundRepeat = "";
          (card as HTMLElement).style.backgroundColor = "";
          (card as HTMLElement).style.border = "";

          // Reset inner containers
          if (iconContainer) iconContainer.className = baseIconClasses;
          if (contentContainer) contentContainer.className = baseContentClasses;
        }

        // Disable interaction when another modal is open
        if (anyOtherModalOpen && !state?.isClicked) {
          (card as HTMLElement).style.pointerEvents = "none";
        }
      });
    }
  });
}
