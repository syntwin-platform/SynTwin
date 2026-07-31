"use client";

import { useEffect, useRef } from "react";

/**
 * Attach to a container ref. When the element enters the viewport,
 * the class `is-visible` is added; when it leaves, it is removed.
 *
 * @param options.threshold  0–1, how much of the element must be visible (default 0.12)
 * @param options.once       if true, animate in once and never reset (default false)
 */
export function useScrollReveal<T extends HTMLElement = HTMLElement>(options?: {
    threshold?: number;
    once?: boolean;
}) {
    const ref = useRef<T>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const threshold = options?.threshold ?? 0.12;
        const once = options?.once ?? false;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    el.classList.add("is-visible");
                    if (once) observer.disconnect();
                } else {
                    if (!once) el.classList.remove("is-visible");
                }
            },
            { threshold }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [options?.threshold, options?.once]);

    return ref;
}
