import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TrustedBy from "@/components/TrustedBy";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <Hero />
      <TrustedBy />

      <div className="flex items-center justify-center h-[80vh]">
        <h1 className="text-4xl font-bold">
          Navbar Test
        </h1>
      </div>
    </main>
  );
}