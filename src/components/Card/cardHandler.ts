import { cardStatesStore, isModalOpen } from "../../store/store";

export function initializeCard(cardId: string) {
  document.addEventListener("DOMContentLoaded", () => {
    const card = document.querySelector(`[data-card-id="${cardId}"]`);

    if (card) {
      const baseClasses =
        "flex flex-col bg-[#1c1c25] justify-evenly overflow-hidden border-b-10 hover:border-b-0 hover:bg-[#2a2a30] w-full md:flex-1 min-h-[250px] max-h-[250px] rounded-2xl shadow-[0_16px_32px_0_rgba(16,16,22,1),3px_0_6px_0_rgba(0,0,0,0.2),-3px_0_6px_0_rgba(0,0,0,0.2)] border border-[rgba(0,0,0,0.5)] hover:border-[rgba(250,249,246,0.5)] hover:shadow-[0_2px_6px_rgba(16,16,22,0.6)] hover:translate-y-[8px] active:translate-y-[4px] active:shadow-sm select-none justify-between transition-all duration-150 ease-in-out cursor-pointer";

      const clickedClasses =
        "flex flex-col bg-[#1c1c25] justify-evenly overflow-hidden w-full md:flex-1 min-h-[250px] max-h-[250px] rounded-xl border border-[rgba(250,249,246,0.5)] shadow-sm translate-y-[4px] select-none justify-between transition-all duration-150 ease-in-out cursor-pointer hover:border-[rgba(250,249,246,0.5)] hover:shadow-sm hover:translate-y-[4px] active:border-[rgba(250,249,246,0.5)] active:shadow-sm active:translate-y-[4px]";

      cardStatesStore.subscribe((states) => {
        const state = states[cardId];
        const anyOtherModalOpen = Object.entries(states).some(
          ([id, s]) => id !== cardId && s.isModalOpen
        );
        const modalIsOpen = isModalOpen(cardId);

        if (state?.isClicked && modalIsOpen) {
          card.className = clickedClasses;
          card.setAttribute("data-card-id", cardId);
          (card as HTMLElement).style.pointerEvents = "auto";
        } else {
          card.className = baseClasses;
          card.setAttribute("data-card-id", cardId);
          (card as HTMLElement).style.pointerEvents = "auto";
        }
      });
    }
  });
}
