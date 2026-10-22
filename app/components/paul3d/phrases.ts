import type { PaulSay } from "@/app/components/paul3d/createPaulScene";

// Lo que dice el personaje en el globo de diálogo según el momento.
export const PHRASES: Record<PaulSay, string[]> = {
  // Al hacerle clic
  click: [
    "¡Qué fue, crack! ¿Armamos tu app?",
    "¡Qué hubo, mi pro! ¿Qué programamos hoy?",
    "¡Qué más, pana! Cero bugs hoy, de una.",
    "¡Ve, crack! ¿Automatizamos algo?",
    "¡Qué nota verte! Tienes pinta de senior.",
    "¡Elé, qué pro! ¿Ya hiciste deploy?",
    "¡Mi llave! Tu idea merece producción.",
    "¡Qué bestia! Compilas a la primera.",
    "¡De ley tu proyecto sale bacán!",
    "¡Simón, crack! Eso lo programo al toque.",
    "¡Pana, tú sí cachas de código!",
    "¡Qué fue, ñaño! ¿Le damos al camello?",
    "¡Full bacán verte por aquí, crack!",
    "¡Hola, mi pro! Hoy no hay bug que nos gane.",
    "¡Chévere, crack! Tú y yo, cero errores 404.",
    "¡Qué fue, loco! ¿Hablamos de tu proyecto?",
  ],
  // Al bajar con el scroll
  bye: [
    "¡Chao, pana! Ahí te veo abajo.",
    "¡Ahí hablamos, crack!",
    "¡Ya, mi pro! No te pierdas.",
  ],
  // Al volver arriba
  hello: [
    "¡Volviste, crack!",
    "¡Qué fue, ñaño! Ya te extrañaba.",
    "¡Otra vez por aquí, mi pro! De ley.",
  ],
};

/** Frase al azar del grupo, sin repetir la anterior. */
export function pickPhrase(kind: PaulSay, last?: string) {
  const list = PHRASES[kind];
  const options = list.length > 1 ? list.filter((p) => p !== last) : list;
  return options[Math.floor(Math.random() * options.length)];
}
