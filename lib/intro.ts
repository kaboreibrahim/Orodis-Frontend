// Écran de bienvenue, une fois par session : le script du <head> décide avant l'affichage,
// pour éviter qu'il clignote chez un visiteur qui l'a déjà vu.

export const INTRO_STORAGE_KEY = "orodis-intro-vue";

/** Décalage des animations du héros quand l'écran de bienvenue joue (il se referme vers 2,5 s). */
export const INTRO_OFFSET = 2.7;

/** Pose data-intro="play" sur <html> pour une première visite, "seen" sinon. */
export const INTRO_SCRIPT = `try{var r=document.documentElement,s=sessionStorage.getItem("${INTRO_STORAGE_KEY}"),m=matchMedia("(prefers-reduced-motion: reduce)").matches;r.dataset.intro=s||m?"seen":"play"}catch(e){}`;
