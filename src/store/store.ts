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

export function getOpenModalId(): string | null {
  const states = cardStatesStore.get();
  for (const [cardId, state] of Object.entries(states)) {
    if (state.isModalOpen) {
      return cardId;
    }
  }
  return null;
}

export function canCardBeClicked(cardId: string): boolean {
  const openModalId = getOpenModalId();
  return !openModalId || openModalId === cardId;
}
