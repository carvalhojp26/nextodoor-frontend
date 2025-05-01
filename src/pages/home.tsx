import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export const Home = () => {
    return (
        <div>
            <Header></Header>

        {/* HERO */}
      <section className="bg-[#F5F7FA] px-6 md:px-24 py-20 flex flex-col-reverse md:flex-row items-center justify-between gap-10">
        <div className="flex-1">
          <h1 className="text-4xl md:text-5xl font-bold text-[#4D4D4D]">
            Ajude a vizinhança e<br />
            ganhe <span className="text-[#4CAF4F]">recompensas</span>
          </h1>
          <p className="text-[#717171] mt-4">Crie ou realize tarefas, ajuste à sua necessidade</p>
          <button className="mt-6 bg-[#4CAF4F] text-white px-6 py-3 rounded hover:bg-[#439A45] transition">
            Entrar
          </button>
        </div>
        <div className="flex-1">
          <img src="/hero.svg" alt="Vizinhaça" className="w-full max-w-md mx-auto" />
        </div>
      </section>

      {/* PARCEIROS */}
      <section className="text-center py-14 px-6">
        <h3 className="text-lg text-[#4CAF4F] font-semibold mb-1">Nossos Parceiros</h3>
        <p className="text-[#717171] mb-6">Trabalhamos em parceria com 50+ estabelecimentos</p>
        <div className="flex justify-center flex-wrap gap-8 max-w-4xl mx-auto">
          <img src="/logo1.svg" alt="Parceiro 1" className="h-8" />
          <img src="/logo2.svg" alt="Parceiro 2" className="h-8" />
          <img src="/logo3.svg" alt="Parceiro 3" className="h-8" />
          <img src="/logo4.svg" alt="Parceiro 4" className="h-8" />
          <img src="/logo5.svg" alt="Parceiro 5" className="h-8" />
        </div>
      </section>

      {/* QUEM SOMOS / O QUE FAZEMOS */}
      <section id="sobre-nos" className="px-6 md:px-24 py-20 grid md:grid-cols-2 gap-16 items-start">
        <div>
          <img src="/section1.svg" alt="Sobre" className="w-full max-w-sm mx-auto" />
          <h3 className="text-2xl font-bold text-[#4D4D4D] mt-6">O que fazemos?</h3>
          <p className="text-[#717171] mt-3">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed sit amet justo ipsum.
            Sed accumsan quam vitae est varius fringilla. Pellentesque placerat vestibulum lorem sed porta.
          </p>
        </div>
        <div>
          <img src="/section2.svg" alt="Quem somos" className="w-full max-w-sm mx-auto" />
          <h3 className="text-2xl font-bold text-[#4D4D4D] mt-6">Quem somos nós?</h3>
          <p className="text-[#717171] mt-3">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed sit amet justo ipsum.
            Sed accumsan quam vitae est varius fringilla. Pellentesque placerat vestibulum lorem sed porta.
          </p>
        </div>
      </section>

            <Footer></Footer>
        </div>
    )
}