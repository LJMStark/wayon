export type CarouselDirection = "next" | "prev";

export function getStepFromDirection(direction: CarouselDirection): number {
  if (direction === "next") {
    return 1;
  }

  return -1;
}

export function getScrollOffset(
  direction: CarouselDirection,
  amount: number
): number {
  return getStepFromDirection(direction) * amount;
}

export function getWrappedIndex(
  currentIndex: number,
  totalItems: number,
  direction: CarouselDirection
): number {
  return (currentIndex + getStepFromDirection(direction) + totalItems) % totalItems;
}

export function scrollContainerByDirection(
  container: HTMLDivElement | null,
  direction: CarouselDirection,
  amount: number
): void {
  if (!container) {
    return;
  }

  container.scrollBy({
    left: getScrollOffset(direction, amount),
    behavior: "smooth",
  });
}
