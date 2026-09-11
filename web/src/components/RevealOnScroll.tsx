"use client";
import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/** Anima todo `.gs-reveal` ao entrar na tela — mesma curva e duração do PHP. */
export default function RevealOnScroll() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const tweens = gsap.utils.toArray<HTMLElement>(".gs-reveal").map((el) =>
      gsap.to(el, {
        y: 0, opacity: 1, duration: 1.2, ease: "power4.out",
        scrollTrigger: { trigger: el, start: "top 90%" },
      })
    );
    return () => { tweens.forEach((t) => { t.scrollTrigger?.kill(); t.kill(); }); };
  }, []);
  return null;
}
