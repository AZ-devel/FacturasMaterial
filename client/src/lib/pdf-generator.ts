import jsPDF from 'jspdf';
import type { FacturaCompleta, ConfiguracionEmpresa } from "@shared/schema";

interface PdfOptions {
  factura: FacturaCompleta;
  configuracionEmpresa?: ConfiguracionEmpresa;
}

export function generateFacturaPDF({ factura, configuracionEmpresa }: PdfOptions): jsPDF {
  const doc = new jsPDF();
  
  // Configuración de fuentes y colores
  const primaryColor = '#1976d2';
  const darkGray = '#333333';
  const lightGray = '#666666';
  
  let currentY = 20;
  
  // Encabezado de la empresa
  if (configuracionEmpresa) {
    doc.setFontSize(20);
    doc.setTextColor(primaryColor);
    doc.text(configuracionEmpresa.nombre, 20, currentY);
    currentY += 10;
    
    doc.setFontSize(10);
    doc.setTextColor(lightGray);
    if (configuracionEmpresa.direccion) {
      doc.text(configuracionEmpresa.direccion, 20, currentY);
      currentY += 5;
    }
    if (configuracionEmpresa.telefono || configuracionEmpresa.email) {
      const contactInfo = [configuracionEmpresa.telefono, configuracionEmpresa.email]
        .filter(Boolean)
        .join(' | ');
      doc.text(contactInfo, 20, currentY);
      currentY += 5;
    }
    if (configuracionEmpresa.nif) {
      doc.text(`NIF: ${configuracionEmpresa.nif}`, 20, currentY);
      currentY += 10;
    }
  }
  
  // Título de la factura
  doc.setFontSize(24);
  doc.setTextColor(darkGray);
  doc.text('FACTURA', 20, currentY);
  
  // Número de factura y fecha (lado derecho)
  doc.setFontSize(12);
  doc.setTextColor(primaryColor);
  doc.text(`Número: ${factura.numero}`, 120, currentY - 10);
  doc.setTextColor(lightGray);
  doc.text(`Fecha: ${new Date(factura.fecha!).toLocaleDateString('es-ES')}`, 120, currentY - 5);
  if (factura.fechaVencimiento) {
    doc.text(`Vencimiento: ${new Date(factura.fechaVencimiento).toLocaleDateString('es-ES')}`, 120, currentY);
  }
  
  currentY += 20;
  
  // Información del cliente
  doc.setFontSize(14);
  doc.setTextColor(primaryColor);
  doc.text('FACTURAR A:', 20, currentY);
  currentY += 8;
  
  doc.setFontSize(11);
  doc.setTextColor(darkGray);
  doc.text(factura.cliente.nombre, 20, currentY);
  currentY += 5;
  
  if (factura.cliente.direccion) {
    doc.text(factura.cliente.direccion, 20, currentY);
    currentY += 5;
  }
  
  if (factura.cliente.ciudad) {
    const ubicacion = [
      factura.cliente.codigoPostal,
      factura.cliente.ciudad,
      factura.cliente.pais
    ].filter(Boolean).join(', ');
    doc.text(ubicacion, 20, currentY);
    currentY += 5;
  }
  
  if (factura.cliente.nif) {
    doc.text(`NIF: ${factura.cliente.nif}`, 20, currentY);
    currentY += 5;
  }
  
  if (factura.cliente.email) {
    doc.text(`Email: ${factura.cliente.email}`, 20, currentY);
    currentY += 5;
  }
  
  if (factura.cliente.telefono) {
    doc.text(`Teléfono: ${factura.cliente.telefono}`, 20, currentY);
    currentY += 5;
  }
  
  currentY += 15;
  
  // Tabla de productos/servicios
  const tableStartY = currentY;
  
  // Encabezados de la tabla
  doc.setFillColor(240, 240, 240);
  doc.rect(20, currentY, 170, 8, 'F');
  
  doc.setFontSize(10);
  doc.setTextColor(darkGray);
  doc.text('DESCRIPCIÓN', 22, currentY + 5);
  doc.text('CANT.', 120, currentY + 5);
  doc.text('PRECIO', 140, currentY + 5);
  doc.text('TOTAL', 170, currentY + 5);
  
  currentY += 10;
  
  // Líneas de la factura
  doc.setFontSize(9);
  factura.lineas.forEach((linea, index) => {
    const y = currentY + (index * 6);
    
    // Alternating row colors
    if (index % 2 === 1) {
      doc.setFillColor(250, 250, 250);
      doc.rect(20, y - 2, 170, 6, 'F');
    }
    
    doc.setTextColor(darkGray);
    
    // Descripción (con texto envuelto si es necesario)
    const descripcion = linea.descripcion;
    if (descripcion.length > 40) {
      const lines = doc.splitTextToSize(descripcion, 90);
      doc.text(lines[0], 22, y + 2);
      if (lines.length > 1) {
        doc.text('...', 22, y + 4);
      }
    } else {
      doc.text(descripcion, 22, y + 2);
    }
    
    // Cantidad
    doc.text(linea.cantidad.toString(), 122, y + 2);
    
    // Precio unitario
    doc.text(`€${parseFloat(linea.precio).toFixed(2)}`, 142, y + 2);
    
    // Total
    doc.text(`€${parseFloat(linea.total).toFixed(2)}`, 172, y + 2);
  });
  
  currentY += (factura.lineas.length * 6) + 10;
  
  // Línea separadora
  doc.setLineWidth(0.5);
  doc.setDrawColor(200, 200, 200);
  doc.line(20, currentY, 190, currentY);
  currentY += 10;
  
  // Totales
  const totalsX = 140;
  doc.setFontSize(10);
  doc.setTextColor(lightGray);
  
  doc.text('Subtotal:', totalsX, currentY);
  doc.text(`€${parseFloat(factura.subtotal).toFixed(2)}`, 175, currentY, undefined, 'right');
  currentY += 6;
  
  doc.text('IVA:', totalsX, currentY);
  doc.text(`€${parseFloat(factura.iva).toFixed(2)}`, 175, currentY, undefined, 'right');
  currentY += 10;
  
  // Total final
  doc.setFontSize(12);
  doc.setTextColor(primaryColor);
  doc.text('TOTAL:', totalsX, currentY);
  doc.text(`€${parseFloat(factura.total).toFixed(2)}`, 175, currentY, undefined, 'right');
  
  // Estado de la factura
  currentY += 15;
  doc.setFontSize(10);
  const estadoColor = getEstadoColor(factura.estado);
  doc.setTextColor(estadoColor);
  doc.text(`Estado: ${factura.estado.toUpperCase()}`, 20, currentY);
  
  // Notas (si existen)
  if (factura.notas && factura.notas.trim() !== '') {
    currentY += 15;
    doc.setFontSize(10);
    doc.setTextColor(darkGray);
    doc.text('Notas:', 20, currentY);
    currentY += 5;
    
    doc.setTextColor(lightGray);
    const notasLines = doc.splitTextToSize(factura.notas, 170);
    doc.text(notasLines, 20, currentY);
  }
  
  // Pie de página
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setTextColor(lightGray);
  doc.text(
    'Gracias por su confianza',
    105,
    pageHeight - 20,
    undefined,
    'center'
  );
  
  return doc;
}

function getEstadoColor(estado: string): string {
  switch (estado) {
    case 'pagada':
      return '#059669'; // green-600
    case 'pendiente':
      return '#d97706'; // amber-600
    case 'vencida':
      return '#dc2626'; // red-600
    case 'cancelada':
      return '#6b7280'; // gray-500
    default:
      return '#6b7280';
  }
}

export function downloadFacturaPDF(options: PdfOptions, filename?: string) {
  const doc = generateFacturaPDF(options);
  const defaultFilename = filename || `factura-${options.factura.numero}.pdf`;
  doc.save(defaultFilename);
}

export function previewFacturaPDF(options: PdfOptions) {
  const doc = generateFacturaPDF(options);
  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  window.open(pdfUrl, '_blank');
}
