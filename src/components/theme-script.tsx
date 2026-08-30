/** Aplica a classe `dark` antes da hidratação para evitar flash de tema. */
export function ThemeScript() {
  const codigo =
    "(function(){try{var t=localStorage.getItem('finan:tema');" +
    "var d=t?t==='escuro':matchMedia('(prefers-color-scheme: dark)').matches;" +
    "if(d)document.documentElement.classList.add('dark');}catch(e){}})();";
  return <script dangerouslySetInnerHTML={{ __html: codigo }} />;
}
