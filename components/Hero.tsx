export function Hero() {
  return (
    <section className="relative h-screen">
      {/* Imagem de fundo (absoluta, cobre tudo) */}
      <img
        src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920"
        alt="Evento"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay escuro (por cima da imagem, por baixo do texto) */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Texto (por cima de tudo) */}
      <div className="relative z-10 flex items-center justify-center h-full text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-white">
          Todos os seus eventos em um só lugar
        </h1>
      </div>
    </section>
  );
}