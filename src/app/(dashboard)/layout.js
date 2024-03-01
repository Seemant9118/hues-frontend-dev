import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

export default function RootLayout({ children }) {
  return (
    <>
      <Header />
      <div className="flex px-10 items-center">
        <h3 className="text-2xl font-bold text-[#121212]">Profile</h3>
      </div>
      <section className="px-10 grid grid-cols-[250px,_1fr] gap-5 flex-grow pb-5">
        <Sidebar />
        <main className="bg-white rounded-xl shadow-[0_4px_6px_0_#3288ED1A] p-4">
          {children}
        </main>
      </section>
    </>
  );
}
