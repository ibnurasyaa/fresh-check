import { useState, useRef } from "react";
import {
  Camera,
  Upload,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AnalysisResult {
  isSafe: boolean;
  confidence: "low" | "medium" | "high";
  reasoning: string;
  recommendations: string;
}

export const FoodAnalyzer = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImage(file);
    }
  };

  const processImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setSelectedImage(result);
      setAnalysisResult(null);
    };
    reader.readAsDataURL(file);
  };

  const analyzeFood = async () => {
    if (!selectedImage) {
      toast.error("Silakan pilih foto terlebih dahulu");
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-food", {
        body: { imageBase64: selectedImage },
      });

      if (error) throw error;

      setAnalysisResult(data);
      toast.success("Analisa selesai!");
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Gagal menganalisa foto. Silakan coba lagi.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setSelectedImage(null);
    setAnalysisResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case "high":
        return "text-primary";
      case "medium":
        return "text-accent";
      case "low":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  const getConfidenceText = (confidence: string) => {
    switch (confidence) {
      case "high":
        return "Tinggi";
      case "medium":
        return "Sedang";
      case "low":
        return "Rendah";
      default:
        return confidence;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {!selectedImage ? (
        <Card className="p-8 bg-gradient-to-br from-card to-secondary/20 shadow-[var(--shadow-smooth)] border-2 border-dashed border-primary/20 hover:border-primary/40 transition-all duration-300">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
              <Upload className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold">Upload Foto Makanan</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Pilih foto makanan dari kamera atau file untuk menganalisa apakah
              makanan tersebut layak dimakan
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                size="lg"
                onClick={() => cameraInputRef.current?.click()}
                className="gap-2 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Camera className="w-5 h-5" />
                Ambil Foto
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2 border-2 border-primary/30 hover:bg-primary/5 hover:border-primary transition-all duration-300"
              >
                <Upload className="w-5 h-5" />
                Upload File
              </Button>
            </div>
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="user"
              onChange={handleFileSelect}
              className="hidden"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="m-8 mx-auto text-red-600 text-xs max-w-lg">
              Perlu Dicatat: Fitur Pengambilan Foto dari Kamera Belum Di Support
              Melalui Laptop Karena Tidak Semua Browser Support Kamera
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="overflow-hidden shadow-[var(--shadow-smooth)]">
            <div className="relative">
              <img
                src={selectedImage}
                alt="Foto makanan"
                className="w-full h-96 object-cover"
              />
              <div className="absolute top-4 right-4">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={resetAnalysis}
                  className="shadow-lg"
                >
                  Ganti Foto
                </Button>
              </div>
            </div>

            {!analysisResult && (
              <div className="p-6 text-center">
                <Button
                  size="lg"
                  onClick={analyzeFood}
                  disabled={isAnalyzing}
                  className="gap-2 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 min-w-[200px]"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Menganalisa...
                    </>
                  ) : (
                    "Analisa Makanan"
                  )}
                </Button>
              </div>
            )}
          </Card>

          {analysisResult && (
            <Card className="p-6 shadow-[var(--shadow-smooth)] bg-gradient-to-br from-card to-secondary/10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div
                    className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center ${
                      analysisResult.isSafe
                        ? "bg-primary/10"
                        : "bg-destructive/10"
                    }`}
                  >
                    {analysisResult.isSafe ? (
                      <CheckCircle2 className="w-8 h-8 text-primary" />
                    ) : (
                      <XCircle className="w-8 h-8 text-destructive" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2">
                      {analysisResult.isSafe
                        ? "Aman Dikonsumsi"
                        : "Tidak Aman Dikonsumsi"}
                    </h3>
                    <div className="flex items-center gap-2 text-sm">
                      <AlertCircle
                        className={`w-4 h-4 ${getConfidenceColor(analysisResult.confidence)}`}
                      />
                      <span className="text-muted-foreground">
                        Tingkat Keyakinan:{" "}
                        <span
                          className={`font-semibold ${getConfidenceColor(analysisResult.confidence)}`}
                        >
                          {getConfidenceText(analysisResult.confidence)}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-background/50 rounded-lg p-4 border border-border/50">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                      Analisa
                    </h4>
                    <p className="text-muted-foreground leading-relaxed">
                      {analysisResult.reasoning}
                    </p>
                  </div>

                  <div className="bg-background/50 rounded-lg p-4 border border-border/50">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                      Rekomendasi
                    </h4>
                    <p className="text-muted-foreground leading-relaxed">
                      {analysisResult.recommendations}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={resetAnalysis}
                  variant="outline"
                  className="w-full border-2 hover:bg-primary/5 hover:border-primary transition-all duration-300"
                >
                  Analisa Foto Lain
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

