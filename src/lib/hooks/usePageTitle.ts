"use client";

import { useEffect } from "react";

/** Set the browser tab title for client-rendered pages. */
export function usePageTitle(title: string) {
  useEffect(() => {
    const prev = document.title;
    document.title = `${title} | 心电学堂`;
    return () => {
      document.title = prev;
    };
  }, [title]);
}
