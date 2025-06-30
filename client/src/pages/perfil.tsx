import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatUserName, getUserInitials } from "@/lib/auth";
import { User, Building, Save, Loader2, Camera } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertConfiguracionEmpresaSchema } from "@shared/schema";
import { z } from "zod";

const perfilSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  apellido: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
});

export default function Perfil() {
  const { usuario } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUpdatingPerfil, setIsUpdatingPerfil] = useState(false);

  // Query para obtener configuración de empresa
  const { data: configuracionEmpresa, isLoading: loadingConfig } = useQuery({
    queryKey: ["/api/configuracion-empresa"],
  });

  // Formulario de perfil de usuario
  const perfilForm = useForm({
    resolver: zodResolver(perfilSchema),
    defaultValues: {
      nombre: usuario?.nombre || "",
      apellido: usuario?.apellido || "",
      email: usuario?.email || "",
    },
  });

  // Formulario de configuración de empresa
  const empresaForm = useForm({
    resolver: zodResolver(insertConfiguracionEmpresaSchema.omit({ usuarioId: true })),
    defaultValues: {
      nombre: configuracionEmpresa?.nombre || "",
      direccion: configuracionEmpresa?.direccion || "",
      telefono: configuracionEmpresa?.telefono || "",
      email: configuracionEmpresa?.email || "",
      nif: configuracionEmpresa?.nif || "",
      logo: configuracionEmpresa?.logo || "",
    },
  });

  // Actualizar valores por defecto cuando cargen los datos
  if (configuracionEmpresa && !empresaForm.formState.isDirty) {
    empresaForm.reset({
      nombre: configuracionEmpresa.nombre || "",
      direccion: configuracionEmpresa.direccion || "",
      telefono: configuracionEmpresa.telefono || "",
      email: configuracionEmpresa.email || "",
      nif: configuracionEmpresa.nif || "",
      logo: configuracionEmpresa.logo || "",
    });
  }

  // Mutación para actualizar perfil
  const updatePerfilMutation = useMutation({
    mutationFn: async (data: z.infer<typeof perfilSchema>) => {
      await apiRequest("PUT", `/api/usuarios/${usuario?.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Perfil actualizado",
        description: "Tu información personal ha sido actualizada correctamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el perfil",
        variant: "destructive",
      });
    },
  });

  // Mutación para guardar configuración de empresa
  const saveEmpresaMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/configuracion-empresa", {
        ...data,
        usuarioId: usuario?.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/configuracion-empresa"] });
      toast({
        title: "Configuración guardada",
        description: "La información de la empresa ha sido actualizada correctamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar la configuración",
        variant: "destructive",
      });
    },
  });

  const onSubmitPerfil = async (data: z.infer<typeof perfilSchema>) => {
    setIsUpdatingPerfil(true);
    try {
      await updatePerfilMutation.mutateAsync(data);
    } finally {
      setIsUpdatingPerfil(false);
    }
  };

  const onSubmitEmpresa = async (data: any) => {
    await saveEmpresaMutation.mutateAsync(data);
  };

  if (!usuario) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center">
          <span className="text-primary-foreground text-xl font-bold">
            {getUserInitials(usuario)}
          </span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
          <p className="text-gray-600">{formatUserName(usuario)}</p>
          <p className="text-sm text-gray-500 capitalize">{usuario.rol}</p>
        </div>
      </div>

      {/* Contenido en pestañas */}
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="personal" className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Información Personal</span>
          </TabsTrigger>
          <TabsTrigger value="empresa" className="flex items-center space-x-2">
            <Building className="h-4 w-4" />
            <span>Empresa</span>
          </TabsTrigger>
        </TabsList>

        {/* Información Personal */}
        <TabsContent value="personal">
          <Card className="card-material">
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...perfilForm}>
                <form onSubmit={perfilForm.handleSubmit(onSubmitPerfil)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={perfilForm.control}
                      name="nombre"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre</FormLabel>
                          <FormControl>
                            <Input placeholder="Tu nombre" {...field} className="input-material" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={perfilForm.control}
                      name="apellido"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Apellido</FormLabel>
                          <FormControl>
                            <Input placeholder="Tu apellido" {...field} className="input-material" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={perfilForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="tu@email.com" type="email" {...field} className="input-material" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={isUpdatingPerfil || !perfilForm.formState.isDirty}
                      className="btn-primary"
                    >
                      {isUpdatingPerfil ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Guardar Cambios
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuración de Empresa */}
        <TabsContent value="empresa">
          <Card className="card-material">
            <CardHeader>
              <CardTitle>Información de la Empresa</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingConfig ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <Form {...empresaForm}>
                  <form onSubmit={empresaForm.handleSubmit(onSubmitEmpresa)} className="space-y-6">
                    <FormField
                      control={empresaForm.control}
                      name="nombre"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre de la Empresa</FormLabel>
                          <FormControl>
                            <Input placeholder="Nombre de tu empresa" {...field} className="input-material" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={empresaForm.control}
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

                    <FormField
                      control={empresaForm.control}
                      name="direccion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dirección</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Dirección completa de la empresa"
                              {...field}
                              className="input-material"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={empresaForm.control}
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

                      <FormField
                        control={empresaForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Corporativo</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="contacto@empresa.com" 
                                type="email" 
                                {...field} 
                                className="input-material" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={empresaForm.control}
                      name="logo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Logo (URL)</FormLabel>
                          <FormControl>
                            <div className="flex space-x-2">
                              <Input 
                                placeholder="https://ejemplo.com/logo.png" 
                                {...field} 
                                className="input-material flex-1" 
                              />
                              <Button type="button" variant="outline" size="icon">
                                <Camera className="h-4 w-4" />
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={saveEmpresaMutation.isPending}
                        className="btn-primary"
                      >
                        {saveEmpresaMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Guardando...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Guardar Configuración
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
