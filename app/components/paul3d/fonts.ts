import { Montserrat, Roboto_Slab } from "next/font/google";

// Tipografías del estampado de la camiseta ("PAUL" con serifa y "ZARUMA").
// Se dibujan en un canvas, así que solo necesitamos el nombre de la familia;
// sin preload porque se piden con document.fonts.load() al crear el personaje.
export const printSlab = Roboto_Slab({ weight: "900", subsets: ["latin"], display: "swap", preload: false });
export const printSans = Montserrat({ weight: ["700"], subsets: ["latin"], display: "swap", preload: false });
