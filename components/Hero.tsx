import Link from "next/link";

export function Hero() {
  const slides = [
    {
      imagem:
        "https://images.unsplash.com/photo-1561489396-888724a1543d?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      titulo: "Todos os seus eventos em um só lugar",
      subtitulo:
        "A plataforma completa para organizar e participar de eventos",
    },
    {
      imagem:
        "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1920",
      titulo: "Crie eventos incríveis",
      subtitulo: "Organize tudo em poucos cliques",
    },
    {
      imagem:
        "https://images.unsplash.com/photo-1627556704290-2b1f5853ff78?w=1920",
      titulo: "Receba seu certificado digital",
      subtitulo: "Emitido automaticamente após o check-in",
    },
  ];

  return (
    <section className="bg-white py-12">
      <div className="max-w-6xl mx-auto px-6 space-y-8">
        {slides.map((slide, index) => (
          <div
            key={index}
            className="relative h-[500px] rounded-lg overflow-hidden"
          >
            {/* Imagem de fundo */}
            <img
              src={slide.imagem}
              alt={slide.titulo}
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Overlay escuro */}
            <div className="absolute inset-0 bg-black/40" />

            {/* Texto */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                {slide.titulo}
              </h2>
              <p className="text-lg text-white/90 mt-4 max-w-2xl">
                {slide.subtitulo}
              </p>
            </div>
          </div>
        ))}

        {/* Botão "Explorar Eventos" */}
        <div className="text-center pt-8">
          <Link
            href="/eventos"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-md font-medium text-lg transition"
          >
            Explorar Eventos
          </Link>
        </div>
      </div>
    </section>
  );
}