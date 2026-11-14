"use client";
import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Anima todo `.gs-reveal` ao entrar na tela: sobe, aparece e sai do desfoque
 * (o desfoque é o toque do tirvu.com.br). Ao terminar, limpa o filter inline
 * pra não deixar uma camada de composição à toa em cada bloco.
 */
export default function RevealOnScroll() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const tweens = gsap.utils.toArray<HTMLElement>(".gs-reveal").map((el) =>
      gsap.fromTo(el, { filter: "blur(10px)" }, {
        y: 0, opacity: 1, filter: "blur(0px)", duration: 1.2, ease: "power4.out",
        clearProps: "filter",
        scrollTrigger: { trigger: el, start: "top 90%" },
      })
    );
    return () => { tweens.forEach((t) => { t.scrollTrigger?.kill(); t.kill(); }); };
  }, []);
  return null;
}
