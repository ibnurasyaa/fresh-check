import { FoodAnalyzer } from "@/components/FoodAnalyzer";
import heroImage from "@/assets/hero-food.jpg";
import { Utensils } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-green-50" />

        <div className="relative container mx-auto px-4 flex flex-col justify-center items-center py-20 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 backdrop-blur-sm mb-6 animate-in zoom-in duration-500">
            <Utensils className="w-10 h-10 text-primary" />
          </div>

          <h1 className="text-5xl md:text-6xl max-w-2xl font-bold mb-6 animate-in slide-in-from-bottom duration-700 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            FreshCheck: Analisa Keamanan Makanan
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-in slide-in-from-bottom duration-700 delay-100">
            Gunakan kekuatan AI untuk menganalisa foto makanan dan menentukan
            apakah makanan tersebut aman untuk dikonsumsi
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 animate-in fade-in bg-green-50 slide-in-from-bottom duration-1000 delay-300">
        <FoodAnalyzer />
      </main>

      {/* Footer */}
      <footer className="mt-20 py-8 border-t border-border/50">
        <div className="container mx-auto px-4 text-center text-sm bg-green-50 text-muted-foreground">
          <p>
            © 2025 Food Safety Analyzer. Analisa keamanan makanan dengan AI.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

