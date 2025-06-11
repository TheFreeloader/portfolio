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

export function canCardBeClicked(cardId: string): boolean {
  if (isModalOpen(cardId)) {
    return false;
  }
  return true;
}

export function getOpenModalCount(): number {
  return getOpenModalIds().length;
}

export function shouldCardBeDisabled(cardId: string): boolean {
  return isModalOpen(cardId);
}
