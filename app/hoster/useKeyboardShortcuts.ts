import { useEffect } from "react";

interface Store {
  undo: () => void;
  redo: () => void;
}

type UpdateFunction = () => void;

export function useKeyboardShortcuts(store: Store, update: UpdateFunction) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const key = event.key.toLowerCase();

      if (
        (isMac && event.metaKey && key === "s") ||
        (!isMac && event.ctrlKey && key === "s")
      ) {
        event.preventDefault();
        update();
      }
      if (
        (isMac && event.metaKey && key === "z" && !event.shiftKey) ||
        (!isMac && event.ctrlKey && key === "z" && !event.shiftKey)
      ) {
        event.preventDefault();
        store.undo();
      }
      if (
        (isMac && event.metaKey && key === "z" && event.shiftKey) ||
        (!isMac && event.ctrlKey && key === "y")
      ) {
        event.preventDefault();
        store.redo();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [store, update]);
}
