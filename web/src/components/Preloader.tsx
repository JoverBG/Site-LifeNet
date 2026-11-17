/**
 * Abertura curta (o `#preloader` do tirvu.com.br): o anel se desenha em volta
 * do logo e o nome entra. Só na primeira visita da sessão e só com movimento
 * liberado: quem decide é o script do <head> no layout, que põe `html.preload`.
 * Sem essa classe o bloco nem aparece (display: none).
 *
 * Quem tira é o Effects, assim que a página hidrata. Se o JS demorar, a
 * animação `preloader-failsafe` do CSS some com ele sozinha em ~2,6 s.
 */
export default function Preloader() {
  return (
    <div id="preloader" aria-hidden="true">
      <div className="relative grid h-[168px] w-[168px] place-items-center">
        <svg className="preloader-ring absolute inset-0 h-full w-full" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" pathLength={1} />
        </svg>
        <img src="/arte/logo-icone.webp" alt="" className="preloader-logo" />
      </div>
      <span className="preloader-word">
        Conexão que <span className="rotating-word-static">transforma</span>
      </span>
    </div>
  );
}
