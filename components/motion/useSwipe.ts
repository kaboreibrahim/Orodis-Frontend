"use client";

// Glissement horizontal au doigt et à la souris (pointer events), pour l'anneau et le CouvertureFlow.
// Au-delà de 6 px, le geste devient un glissement et le clic qui suit est ignoré.
import { useCallback, useMemo, useRef } from "react";
import type { MouseEvent, PointerEvent } from "react";

type SwipeOptions = {
  /** Pendant le glissement : décalage en px depuis le point de départ. */
  onMove?: (dx: number) => void;
  /** Fin du glissement : décalage total et vitesse (px/ms, positive vers la droite). */
  onEnd?: (dx: number, velocity: number) => void;
  /** Distance avant de considérer qu'il s'agit d'un glissement. */
  threshold?: number;
};

export function useSwipe({ onMove, onEnd, threshold = 6 }: SwipeOptions = {}) {
  const state = useRef({ pointerId: -1, startX: 0, lastX: 0, lastT: 0, velocity: 0, dragging: false, justDragged: false });
  const callbacks = useRef({ onMove, onEnd });
  callbacks.current = { onMove, onEnd };

  const finish = useCallback((e: PointerEvent<HTMLElement>, cancelled: boolean) => {
    const s = state.current;
    if (e.pointerId !== s.pointerId) return;
    s.pointerId = -1;
    if (!s.dragging) return;
    s.dragging = false;
    s.justDragged = true;
    // Le clic arrive juste après pointerup : on le laisse être ignoré, puis on réarme.
    setTimeout(() => (s.justDragged = false), 0);
    callbacks.current.onEnd?.(cancelled ? 0 : e.clientX - s.startX, cancelled ? 0 : s.velocity);
  }, []);

  const handlers = useMemo(
    () => ({
      onPointerDown(e: PointerEvent<HTMLElement>) {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        const s = state.current;
        Object.assign(s, { pointerId: e.pointerId, startX: e.clientX, lastX: e.clientX, lastT: e.timeStamp, velocity: 0, dragging: false });
      },
      onPointerMove(e: PointerEvent<HTMLElement>) {
        const s = state.current;
        if (e.pointerId !== s.pointerId) return;
        const dx = e.clientX - s.startX;
        if (!s.dragging) {
          if (Math.abs(dx) <= threshold) return;
          s.dragging = true;
          try {
            e.currentTarget.setPointerCapture(e.pointerId);
          } catch {
            // Pointeur déjà relâché : rien à capturer.
          }
        }
        const dt = e.timeStamp - s.lastT;
        if (dt > 0) s.velocity = (e.clientX - s.lastX) / dt;
        s.lastX = e.clientX;
        s.lastT = e.timeStamp;
        callbacks.current.onMove?.(dx);
      },
      onPointerUp(e: PointerEvent<HTMLElement>) {
        finish(e, false);
      },
      onPointerCancel(e: PointerEvent<HTMLElement>) {
        finish(e, true);
      },
      onClickCapture(e: MouseEvent<HTMLElement>) {
        if (state.current.justDragged) {
          e.preventDefault();
          e.stopPropagation();
        }
      },
    }),
    [finish, threshold],
  );

  /** true pendant un glissement (pour couper les transitions CSS, par exemple). */
  const isDragging = useCallback(() => state.current.dragging, []);

  return { handlers, isDragging };
}
