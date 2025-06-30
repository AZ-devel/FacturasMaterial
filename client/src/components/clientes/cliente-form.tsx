import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertClienteSchema, type Cliente } from "@shared/schema";
import { Loader2, Save, X } from "lucide-react";
import { z } from "zod";

interface ClienteFormProps {
  cliente?: Cliente | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const clienteFormSchema = insertClienteSchema.omit({ usuarioId: true });

export default function ClienteForm({ cliente, onSuccess, onCancel }: ClienteFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(clienteFormSchema),
    defaultValues: {
      nombre: cliente?.nombre || "",
      email: cliente?.email || "",
      telefono: cliente?.telefono || "",
      direccion: cliente?.direccion || "",
      ciudad: cliente?.ciudad || "",
      codigoPostal: cliente?.codigoPostal || "",
      pais: cliente?.pais || "España",
      nif: cliente?.nif || "",
      activo: cliente?.activo ?? true,
    },
  });

  // Mutación para crear/actualizar cliente
  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof clienteFormSchema>) => {
      if (cliente) {
        return await apiRequest("PUT", `/api/clientes/${cliente.id}`, data);
      } else {
        return await apiRequest("POST", "/api/clientes", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clientes"] });
      toast({
        title: cliente ? "Cliente actualizado" : "Cliente creado",
        description: cliente 
          ? "El cliente ha sido actualizado correctamente."
          : "El cliente ha sido creado correctamente.",
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar el cliente",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: z.infer<typeof clienteFormSchema>) => {
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
                <FormLabel>Nombre *</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre del cliente o empresa" {...field} className="input-material" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="cliente@email.com" type="email" {...field} className="input-material" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="telefono"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <Input placeholder="+34 123 456 789" {...field} className="input-material" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="nif"
            render={({ field }) => (
              <FormItem>
                <FormLabel>NIF/CIF</FormLabel>
                <FormControl>
                  <Input placeholder="12345678A" {...field} className="input-material" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Dirección */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Dirección</h3>
          
          <FormField
            control={form.control}
            name="direccion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dirección</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Calle, número, piso..."
                    {...field}
                    className="input-material"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="ciudad"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ciudad</FormLabel>
                  <FormControl>
                    <Input placeholder="Madrid" {...field} className="input-material" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="codigoPostal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código Postal</FormLabel>
                  <FormControl>
                    <Input placeholder="28001" {...field} className="input-material" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pais"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>País</FormLabel>
                  <FormControl>
                    <Input placeholder="España" {...field} className="input-material" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
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
                {cliente ? "Actualizando..." : "Creando..."}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {cliente ? "Actualizar" : "Crear"} Cliente
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
