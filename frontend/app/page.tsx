import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="flex items-center justify-center h-[80vh]">
        <h1 className="text-4xl font-bold">
          Navbar Test
        </h1>
      </div>
    </main>
  );
}