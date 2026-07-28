import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import Testimonials from "@/components/landing/Testimonials";
import FAQ from "@/components/landing/FAQ";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-clip bg-[#071126]">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}