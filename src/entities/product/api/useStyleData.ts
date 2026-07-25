"use client";

import { useEffect, useState } from "react";
import { fetchStyles } from "@/entities/product/api/fetchStyles";
import { StyleData } from "@/entities/product/model/styleData";

/**
 * Carga una sola vez los datos de estilo/formato del backend (el mismo origen
 * que usa el catálogo vía `fetchStyles`) y los expone para cruzar por
 * `shopifyHandle`. Devuelve `null` mientras carga; best-effort, sin bloquear el
 * render (los consumidores caen a un fallback plano cuando aún es `null`).
 */
export function useStyleData(): StyleData | null {
  const [styleData, setStyleData] = useState<StyleData | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const data = await fetchStyles();
      if (active) setStyleData(data);
    })();
    return () => {
      active = false;
    };
  }, []);

  return styleData;
}
