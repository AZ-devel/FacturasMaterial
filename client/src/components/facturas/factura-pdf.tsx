import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { downloadFacturaPDF, previewFacturaPDF } from "@/lib/pdf-generator";
import { useToast } from "@/hooks/use-toast";
import { Download, Eye, Loader2 } from "lucide-react";
import type { FacturaCompleta } from "@shared/schema";

interface FacturaPDFProps {
  factura: FacturaCompleta;
  variant?: "preview" | "download" | "both";
  size?: "sm" | "md" | "lg";
}

export default function FacturaPDF({ 
  factura, 
  variant = "both",
  size = "md" 
}: FacturaPDFProps) {
  const { toast } = useToast();

  // Obtener configuración de empresa para el PDF
  const { data: configuracionEmpresa, isLoading } = useQuery({
    queryKey: ["/api/configuracion-empresa"],
  });

  const handlePreview = () => {
    try {
      previewFacturaPDF({ factura, configuracionEmpresa });
      toast({
        title: "PDF generado",
        description: "El PDF se ha abierto en una nueva ventana.",
      });
    } catch (error) {
      console.error("Error generando PDF:", error);
      toast({
        title: "Error",
        description: "No se pudo generar el PDF",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    try {
      downloadFacturaPDF({ factura, configuracionEmpresa });
      toast({
        title: "PDF descargado",
        description: "El PDF se ha descargado correctamente.",
      });
    } catch (error) {
      console.error("Error descargando PDF:", error);
      toast({
        title: "Error",
        description: "No se pudo descargar el PDF",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-gray-500">Cargando...</span>
      </div>
    );
  }

  const buttonSize = size === "sm" ? "sm" : size === "lg" ? "lg" : "default";

  return (
    <div className="flex space-x-2">
      {(variant === "preview" || variant === "both") && (
        <Button
          variant="outline"
          size={buttonSize}
          onClick={handlePreview}
          className="text-primary hover:text-primary"
        >
          <Eye className="h-4 w-4 mr-2" />
          {size !== "sm" && "Vista Previa"}
        </Button>
      )}

      {(variant === "download" || variant === "both") && (
        <Button
          variant="outline"
          size={buttonSize}
          onClick={handleDownload}
          className="text-green-600 hover:text-green-700"
        >
          <Download className="h-4 w-4 mr-2" />
          {size !== "sm" && "Descargar"}
        </Button>
      )}
    </div>
  );
}
