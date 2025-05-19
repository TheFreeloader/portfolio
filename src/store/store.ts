import { map } from "nanostores";

interface CardState {
  isClicked: boolean;
  isModalOpen: boolean;
}

export const cardStatesStore = map<Record<string, CardState>>({
  about: { isClicked: false, isModalOpen: false },
  projects: { isClicked: false, isModalOpen: false },
  skills: { isClicked: false, isModalOpen: false },
  contact: { isClicked: false, isModalOpen: false },
  docs: { isClicked: false, isModalOpen: false },
  recommendations: { isClicked: false, isModalOpen: false },
});

// Helper functions to work with the store
export function setCardClicked(cardId: string, isClicked: boolean) {
  const currentState = cardStatesStore.get()[cardId] || {
    isClicked: false,
    isModalOpen: false,
  };
  cardStatesStore.setKey(cardId, { ...currentState, isClicked });
}

export function isCardClicked(cardId: string): boolean {
  return cardStatesStore.get()[cardId]?.isClicked || false;
}

export function setModalOpen(cardId: string, isOpen: boolean) {
  const currentState = cardStatesStore.get()[cardId] || {
    isClicked: false,
    isModalOpen: false,
  };
  cardStatesStore.setKey(cardId, { ...currentState, isModalOpen: isOpen });

  // Log which modal was opened or closed
  if (isOpen) {
    console.log(`Modal opened: ${cardId}`);
  } else {
    console.log(`Modal closed: ${cardId}`);
  }

  // Log all currently open modals
  const openModals = Object.entries(cardStatesStore.get())
    .filter(([_, state]) => state.isModalOpen)
    .map(([id, _]) => id);

  if (openModals.length > 0) {
    console.log(`Currently open modals: ${openModals.join(", ")}`);
  } else {
    console.log("No modals currently open");
  }
}

export function isModalOpen(cardId: string): boolean {
  return cardStatesStore.get()[cardId]?.isModalOpen || false;
}

export function isAnyModalOpen(): boolean {
  const states = cardStatesStore.get();
  return Object.values(states).some((state) => state.isModalOpen);
}

export function toggleCardClicked(cardId: string) {
  const currentState = isCardClicked(cardId);
  setCardClicked(cardId, !currentState);
}

export function getOpenModalIds(): string[] {
  const states = cardStatesStore.get();
  return Object.entries(states)
    .filter(([_, state]) => state.isModalOpen)
    .map(([cardId, _]) => cardId);
}

export function getOpenModalId(): string | null {
  const openModalIds = getOpenModalIds();
  return openModalIds.length > 0 ? openModalIds[0] : null;
}

// Updated to allow multiple unique modals to be open
export function canCardBeClicked(cardId: string): boolean {
  // If this card's modal is already open, don't allow clicking
  if (isModalOpen(cardId)) {
    return false;
  }

  // Otherwise, any card can be clicked to open its modal
  return true;
}

// Get count of open modals
export function getOpenModalCount(): number {
  return getOpenModalIds().length;
}

// Check if card should be disabled (for UI purposes)
export function shouldCardBeDisabled(cardId: string): boolean {
  // A card should be disabled if its own modal is already open
  return isModalOpen(cardId);
}
