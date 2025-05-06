
import FeatureSection from "@/components/FeatureSection";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import PricingSection from "@/components/PricingSection";
import TestimonialSection from "@/components/TestimonialSection";

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <FeatureSection />
        <TestimonialSection />
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
