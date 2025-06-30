import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ClienteSearch from "@/components/clientes/cliente-search";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    insertFacturaSchema,
    insertLineaFacturaSchema,
    type Cliente,
    type Producto,
} from "@shared/schema";
import { Plus, Save, Trash2, Search, Calculator, Loader2 } from "lucide-react";
import { z } from "zod";

interface FacturaFormProps {
    numeroFactura?: string;
}

const facturaFormSchema = z.object({
    clienteId: z.number({ required_error: "Selecciona un cliente" }),
    fechaVencimiento: z.string().optional(),
    notas: z.string().optional(),
    lineas: z
        .array(
            z.object({
                descripcion: z.string().min(1, "La descripción es requerida"),
                cantidad: z.number().min(1, "La cantidad debe ser mayor a 0"),
                precio: z
                    .number()
                    .min(0, "El precio debe ser mayor o igual a 0"),
                total: z.number(),
            })
        )
        .min(1, "Debe agregar al menos una línea"),
});

type FacturaFormData = z.infer<typeof facturaFormSchema>;

export default function FacturaForm({ numeroFactura }: FacturaFormProps) {
    const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(
        null
    );
    const [isClienteSearchOpen, setIsClienteSearchOpen] = useState(false);
    const [isProductSearchOpen, setIsProductSearchOpen] = useState(false);
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [, setLocation] = useLocation();

    // Queries
    const { data: productos = [] } = useQuery<Producto[]>({
        queryKey: ["/api/productos"],
    });

    const form = useForm<FacturaFormData>({
        resolver: zodResolver(facturaFormSchema),
        defaultValues: {
            clienteId: 0,
            fechaVencimiento: "",
            notas: "",
            lineas: [{ descripcion: "", cantidad: 1, precio: 0, total: 0 }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "lineas",
    });

    // Mutación para crear factura
    const createFacturaMutation = useMutation({
        mutationFn: async (data: FacturaFormData) => {
            const facturaData = {
                clienteId: data.clienteId,
                fechaVencimiento: data.fechaVencimiento || null,
                notas: data.notas || "",
                subtotal: calcularSubtotal(),
                iva: calcularIVA(),
                total: calcularTotal(),
            };

            const response = await apiRequest("POST", "/api/facturas", {
                factura: facturaData,
                lineas: data.lineas,
            });

            return response.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["/api/facturas"] });
            queryClient.invalidateQueries({ queryKey: ["/api/estadisticas"] });
            toast({
                title: "Factura creada",
                description: `La factura ${data.numero} ha sido creada correctamente.`,
            });
            setLocation("/ver-facturas");
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.message || "No se pudo crear la factura",
                variant: "destructive",
            });
        },
    });

    // Cálculos
    const calcularSubtotal = () => {
        return form
            .getValues("lineas")
            .reduce((sum, linea) => sum + linea.total, 0);
    };

    const calcularIVA = (subtotal?: number) => {
        const sub = subtotal ?? calcularSubtotal();
        return sub * 0.21; // IVA del 21%
    };

    const calcularTotal = () => {
        const subtotal = calcularSubtotal();
        return subtotal + calcularIVA(subtotal);
    };

    // Actualizar total de línea
    const actualizarTotalLinea = (index: number) => {
        const linea = form.getValues(`lineas.${index}`);
        const total = linea.cantidad * linea.precio;
        form.setValue(`lineas.${index}.total`, total);
    };

    // Agregar línea
    const agregarLinea = () => {
        append({ descripcion: "", cantidad: 1, precio: 0, total: 0 });
    };

    // Seleccionar cliente
    const handleClienteSelect = (cliente: Cliente) => {
        setSelectedCliente(cliente);
        form.setValue("clienteId", cliente.id);
        setIsClienteSearchOpen(false);
    };

    // Seleccionar producto
    const handleProductoSelect = (producto: Producto, lineaIndex: number) => {
        form.setValue(`lineas.${lineaIndex}.descripcion`, producto.nombre);
        form.setValue(
            `lineas.${lineaIndex}.precio`,
            parseFloat(producto.precio)
        );
        actualizarTotalLinea(lineaIndex);
        setIsProductSearchOpen(false);
    };

    const onSubmit = async (data: FacturaFormData) => {
        if (!selectedCliente) {
            toast({
                title: "Error",
                description: "Debes seleccionar un cliente",
                variant: "destructive",
            });
            return;
        }

        await createFacturaMutation.mutateAsync(data);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("es-ES", {
            style: "currency",
            currency: "EUR",
        }).format(amount);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Información del cliente */}
                <Card>
                    <CardHeader>
                        <CardTitle>Información del Cliente</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {selectedCliente ? (
                            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                                <div>
                                    <h4 className="font-medium text-gray-900">
                                        {selectedCliente.nombre}
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                        {selectedCliente.email &&
                                            `${selectedCliente.email} • `}
                                        {selectedCliente.nif &&
                                            `NIF: ${selectedCliente.nif}`}
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsClienteSearchOpen(true)}
                                >
                                    Cambiar Cliente
                                </Button>
                            </div>
                        ) : (
                            <Dialog
                                open={isClienteSearchOpen}
                                onOpenChange={setIsClienteSearchOpen}
                            >
                                <DialogTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full"
                                    >
                                        <Search className="mr-2 h-4 w-4" />
                                        Seleccionar Cliente
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>
                                            Buscar Cliente
                                        </DialogTitle>
                                    </DialogHeader>
                                    <ClienteSearch
                                        onSelect={handleClienteSelect}
                                    />
                                </DialogContent>
                            </Dialog>
                        )}

                        <FormField
                            control={form.control}
                            name="fechaVencimiento"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Fecha de Vencimiento</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="date"
                                            {...field}
                                            className="input-material"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* Líneas de factura */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Productos/Servicios</CardTitle>
                            <Button
                                type="button"
                                onClick={agregarLinea}
                                size="sm"
                                className="btn-primary"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Agregar Línea
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Descripción</TableHead>
                                        <TableHead className="w-24">
                                            Cantidad
                                        </TableHead>
                                        <TableHead className="w-32">
                                            Precio
                                        </TableHead>
                                        <TableHead className="w-32">
                                            Total
                                        </TableHead>
                                        <TableHead className="w-16">
                                            Acciones
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {fields.map((field, index) => (
                                        <TableRow key={field.id}>
                                            <TableCell>
                                                <div className="flex space-x-2">
                                                    <FormField
                                                        control={form.control}
                                                        name={`lineas.${index}.descripcion`}
                                                        render={({ field }) => (
                                                            <FormItem className="flex-1">
                                                                <FormControl>
                                                                    <Input
                                                                        placeholder="Descripción del producto/servicio"
                                                                        {...field}
                                                                        className="input-material"
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <Dialog
                                                        open={
                                                            isProductSearchOpen
                                                        }
                                                        onOpenChange={
                                                            setIsProductSearchOpen
                                                        }
                                                    >
                                                        <DialogTrigger asChild>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="icon"
                                                            >
                                                                <Search className="h-4 w-4" />
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="sm:max-w-md">
                                                            <DialogHeader>
                                                                <DialogTitle>
                                                                    Buscar
                                                                    Producto
                                                                </DialogTitle>
                                                            </DialogHeader>
                                                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                                                {productos?.map(
                                                                    (
                                                                        producto: Producto
                                                                    ) => (
                                                                        <Card
                                                                            key={
                                                                                producto.id
                                                                            }
                                                                            className="cursor-pointer hover:shadow-md transition-shadow"
                                                                            onClick={() =>
                                                                                handleProductoSelect(
                                                                                    producto,
                                                                                    index
                                                                                )
                                                                            }
                                                                        >
                                                                            <CardContent className="p-3">
                                                                                <div className="flex justify-between">
                                                                                    <div>
                                                                                        <h4 className="font-medium">
                                                                                            {
                                                                                                producto.nombre
                                                                                            }
                                                                                        </h4>
                                                                                        <p className="text-sm text-gray-600">
                                                                                            {
                                                                                                producto.descripcion
                                                                                            }
                                                                                        </p>
                                                                                    </div>
                                                                                    <div className="text-right">
                                                                                        <p className="font-medium">
                                                                                            {formatCurrency(
                                                                                                parseFloat(
                                                                                                    producto.precio
                                                                                                )
                                                                                            )}
                                                                                        </p>
                                                                                        {producto.categoria && (
                                                                                            <p className="text-xs text-gray-500">
                                                                                                {
                                                                                                    producto.categoria
                                                                                                }
                                                                                            </p>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            </CardContent>
                                                                        </Card>
                                                                    )
                                                                )}
                                                            </div>
                                                        </DialogContent>
                                                    </Dialog>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <FormField
                                                    control={form.control}
                                                    name={`lineas.${index}.cantidad`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    min="1"
                                                                    {...field}
                                                                    onChange={(
                                                                        e
                                                                    ) => {
                                                                        field.onChange(
                                                                            parseInt(
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            ) ||
                                                                                1
                                                                        );
                                                                        actualizarTotalLinea(
                                                                            index
                                                                        );
                                                                    }}
                                                                    className="input-material"
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <FormField
                                                    control={form.control}
                                                    name={`lineas.${index}.precio`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    step="0.01"
                                                                    min="0"
                                                                    {...field}
                                                                    onChange={(
                                                                        e
                                                                    ) => {
                                                                        field.onChange(
                                                                            parseFloat(
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            ) ||
                                                                                0
                                                                        );
                                                                        actualizarTotalLinea(
                                                                            index
                                                                        );
                                                                    }}
                                                                    className="input-material"
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">
                                                    {formatCurrency(
                                                        form.watch(
                                                            `lineas.${index}.total`
                                                        ) || 0
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {fields.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            remove(index)
                                                        }
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Totales */}
                <Card>
                    <CardContent className="p-6">
                        <div className="space-y-3 max-w-sm ml-auto">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Subtotal:</span>
                                <span className="font-medium">
                                    {formatCurrency(calcularSubtotal())}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">
                                    IVA (21%):
                                </span>
                                <span className="font-medium">
                                    {formatCurrency(calcularIVA())}
                                </span>
                            </div>
                            <div className="border-t pt-3">
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total:</span>
                                    <span className="text-primary">
                                        {formatCurrency(calcularTotal())}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Notas */}
                <Card>
                    <CardHeader>
                        <CardTitle>Notas Adicionales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FormField
                            control={form.control}
                            name="notas"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Condiciones de pago, observaciones..."
                                            {...field}
                                            className="input-material"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* Botones */}
                <div className="flex justify-end space-x-4 py-6">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setLocation("/facturas")}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        disabled={createFacturaMutation.isPending}
                        className="btn-primary"
                    >
                        {createFacturaMutation.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Crear Factura
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
