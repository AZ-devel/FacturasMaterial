import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { insertProductoSchema, type Producto } from "@shared/schema";
import { Loader2, Save, X } from "lucide-react";
import { z } from "zod";

interface ProductoFormProps {
  producto?: Producto | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const productoFormSchema = insertProductoSchema.omit({ usuarioId: true });

export default function ProductoForm({ producto, onSuccess, onCancel }: ProductoFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(productoFormSchema),
    defaultValues: {
      nombre: producto?.nombre || "",
      descripcion: producto?.descripcion || "",
      precio: producto?.precio || "",
      categoria: producto?.categoria || "",
      codigo: producto?.codigo || "",
      stock: producto?.stock || 0,
      activo: producto?.activo ?? true,
    },
  });

  // Mutación para crear/actualizar producto
  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof productoFormSchema>) => {
      if (producto) {
        return await apiRequest("PUT", `/api/productos/${producto.id}`, data);
      } else {
        return await apiRequest("POST", "/api/productos", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/productos"] });
      toast({
        title: producto ? "Producto actualizado" : "Producto creado",
        description: producto 
          ? "El producto ha sido actualizado correctamente."
          : "El producto ha sido creado correctamente.",
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar el producto",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: z.infer<typeof productoFormSchema>) => {
    await mutation.mutateAsync(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Información básica */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Información Básica</h3>
          
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del Producto *</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre del producto o servicio" {...field} className="input-material" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="descripcion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Descripción detallada del producto o servicio"
                    {...field}
                    className="input-material"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="codigo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código/SKU</FormLabel>
                  <FormControl>
                    <Input placeholder="SKU001" {...field} className="input-material" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <FormControl>
                    <Input placeholder="Productos, Servicios, etc." {...field} className="input-material" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Precio y stock */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Precio y Inventario</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="precio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio (€) *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="0.00"
                      type="number"
                      step="0.01"
                      min="0"
                      {...field}
                      className="input-material"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="0"
                      type="number"
                      min="0"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      className="input-material"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Estado */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="activo"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Producto Activo</FormLabel>
                  <div className="text-sm text-gray-600">
                    Permite que este producto aparezca en las facturas
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={mutation.isPending}
          >
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
          
          <Button
            type="submit"
            disabled={mutation.isPending}
            className="btn-primary"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {producto ? "Actualizando..." : "Creando..."}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {producto ? "Actualizar" : "Crear"} Producto
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
