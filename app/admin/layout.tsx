import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AnimatedContainer } from "@/components/ui/motion/animated-container";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if ((session.user as any)?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="flex h-screen bg-[#020617] overflow-hidden">
      {/* Sidebar - Desktop */}
      <div className="hidden md:flex h-full">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header user={session.user as any} />

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto no-scrollbar bg-[#020617] p-4 md:p-8">
          <AnimatedContainer direction="up" className="max-w-7xl mx-auto h-full">
            {children}
          </AnimatedContainer>
        </main>
      </div>
    </div>
  );
}
