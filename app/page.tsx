import Header from "@/components/Header";
import Hero from "@/components/Hero";

export default function Home() {
  return (
    <div 
      className="min-h-screen"
      style={{
        background: 'linear-gradient(124deg, rgba(255, 255, 255, 0.50) 29.93%, rgba(247, 244, 237, 0.50) 70.67%), linear-gradient(245deg, rgba(255, 255, 255, 0.50) 33.91%, rgba(247, 244, 237, 0.50) 83.92%), #FFF'
      }}
    >
      <Header />
      <main className="flex w-full flex-col items-center justify-center">
        <Hero />
        <div className="mt-4 w-full">
         
        </div>
      </main>
    </div>
  );
}
