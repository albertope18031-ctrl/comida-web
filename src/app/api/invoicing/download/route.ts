import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "xml";
  const uuid = searchParams.get("uuid") || "4D89A501-7F2A-4B69-9E28-662B75691FCD";
  const folio = searchParams.get("folio") || "WS-2026-1001";
  const rfc = searchParams.get("rfc") || "XAXX010101000";
  const name = searchParams.get("name") || "PUBLICO EN GENERAL";
  const total = searchParams.get("total") || "349.00";

  const totalNum = parseFloat(total) || 349.0;
  const subtotalNum = Math.round((totalNum / 1.16) * 100) / 100;
  const ivaNum = Math.round((totalNum - subtotalNum) * 100) / 100;
  const today = new Date().toISOString().slice(0, 19);

  if (type === "xml") {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/4" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sat.gob.mx/cfd/4 http://www.sat.gob.mx/sitio_internet/cfd/4/cfdv40.xsd http://www.sat.gob.mx/TimbreFiscalDigital http://www.sat.gob.mx/sitio_internet/cfd/TimbreFiscalDigital/TimbreFiscalDigitalv11.xsd" Version="4.0" Serie="LRO" Folio="${folio.replace(/[^0-9]/g, "").slice(-8) || "10001"}" Fecha="${today}" FormaPago="04" NoCertificado="30001000000500003416" SubTotal="${subtotalNum.toFixed(2)}" Moneda="MXN" Total="${totalNum.toFixed(2)}" TipoDeComprobante="I" Exportacion="01" MetodoPago="PUE" LugarExpedicion="06000" xmlns:tfd="http://www.sat.gob.mx/TimbreFiscalDigital">
  <cfdi:Emisor Rfc="LRO240101XX1" Nombre="LOCO ROOSTER OPERADORA DE ALIMENTOS SA DE CV" RegimenFiscal="601"/>
  <cfdi:Receptor Rfc="${rfc}" Nombre="${name}" DomicilioFiscalReceptor="06000" RegimenFiscalReceptor="605" UsoCFDI="G03"/>
  <cfdi:Conceptos>
    <cfdi:Concepto ClaveProdServ="90101503" NoIdentificacion="${folio}" Cantidad="1.00" ClaveUnidad="E48" Unidad="Servicio" Descripcion="Consumo de alimentos y bebidas según ticket ${folio}" ValorUnitario="${subtotalNum.toFixed(2)}" Importe="${subtotalNum.toFixed(2)}" ObjetoImp="02">
      <cfdi:Impuestos>
        <cfdi:Traslados>
          <cfdi:Traslado Base="${subtotalNum.toFixed(2)}" Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.160000" Importe="${ivaNum.toFixed(2)}"/>
        </cfdi:Traslados>
      </cfdi:Impuestos>
    </cfdi:Concepto>
  </cfdi:Conceptos>
  <cfdi:Impuestos TotalImpuestosTrasladados="${ivaNum.toFixed(2)}">
    <cfdi:Traslados>
      <cfdi:Traslado Base="${subtotalNum.toFixed(2)}" Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.160000" Importe="${ivaNum.toFixed(2)}"/>
    </cfdi:Traslados>
  </cfdi:Impuestos>
  <cfdi:Complemento>
    <tfd:TimbreFiscalDigital Version="1.1" UUID="${uuid}" FechaTimbrado="${today}" RfcProvCertif="SAT970701NN3" SelloCFD="aBcdEf1234567890..." NoCertificadoSAT="00001000000504465028" SelloSAT="zYxWvu0987654321..."/>
  </cfdi:Complemento>
</cfdi:Comprobante>`;

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Content-Disposition": `attachment; filename="Factura_${folio}_${uuid.slice(0, 8)}.xml"`,
      },
    });
  }

  // PDF Representation (Official SAT CFDI 4.0 Layout ready to print or save)
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Factura CFDI 4.0 - ${folio}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1f2937; margin: 0; padding: 24px; background: #f9fafb; }
    .page { max-width: 800px; margin: 0 auto; background: #ffffff; padding: 36px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #FF3823; padding-bottom: 16px; margin-bottom: 24px; }
    .brand h1 { color: #FF3823; margin: 0; font-size: 24px; font-weight: 900; }
    .brand p { margin: 4px 0 0 0; font-size: 12px; color: #4b5563; }
    .cfdi-info { text-align: right; font-size: 12px; }
    .cfdi-info strong { color: #FF3823; font-size: 14px; }
    .section-title { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #FF3823; background: #fff1f0; padding: 6px 10px; border-radius: 4px; margin-top: 16px; margin-bottom: 8px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; font-size: 12px; margin-bottom: 16px; }
    .table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 12px; }
    .table th { background: #FF3823; color: #fff; padding: 8px; text-align: left; }
    .table td { padding: 8px; border-bottom: 1px solid #e5e7eb; }
    .totals { margin-top: 16px; display: flex; justify-content: flex-end; }
    .totals table { font-size: 13px; border-collapse: collapse; }
    .totals td { padding: 4px 12px; }
    .totals .total-row { font-weight: bold; font-size: 16px; color: #FF3823; border-top: 2px solid #FF3823; }
    .stamp-box { margin-top: 24px; border: 1px dashed #9ca3af; padding: 12px; border-radius: 6px; font-size: 10px; color: #4b5563; word-break: break-all; }
    .btn-print { background: #FF3823; color: white; border: none; padding: 10px 20px; font-size: 14px; font-weight: bold; border-radius: 6px; cursor: pointer; margin-bottom: 20px; }
    @media print {
      body { background: white; padding: 0; }
      .page { box-shadow: none; padding: 0; }
      .btn-print { display: none; }
    }
  </style>
</head>
<body>
  <div style="max-width: 800px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center;">
    <button class="btn-print" onclick="window.print()">🖨️ Imprimir / Guardar en PDF</button>
    <span style="font-size: 12px; color: #6b7280;">CFDI 4.0 expedido conforme al SAT México</span>
  </div>

  <div class="page">
    <div class="header">
      <div class="brand">
        <h1>LOCO ROOSTER</h1>
        <p><strong>LOCO ROOSTER OPERADORA DE ALIMENTOS SA DE CV</strong></p>
        <p>RFC: LRO240101XX1</p>
        <p>Régimen Fiscal: 601 - General de Ley Personas Morales</p>
        <p>Lugar de Expedición: 06000, Ciudad de México</p>
      </div>
      <div class="cfdi-info">
        <strong>FACTURA ELECTRÓNICA (CFDI 4.0)</strong><br />
        Folio: <b>${folio}</b><br />
        Serie: LRO<br />
        Fecha de Emisión: ${today}<br />
        Tipo: Ingreso (I)<br />
        Moneda: MXN | Forma de Pago: 04 - Tarjeta
      </div>
    </div>

    <div class="section-title">Datos del Receptor / Cliente</div>
    <div class="grid">
      <div>
        <p><strong>Nombre / Razón Social:</strong> ${name}</p>
        <p><strong>RFC:</strong> ${rfc}</p>
        <p><strong>Domicilio Fiscal (CP):</strong> 06000</p>
      </div>
      <div>
        <p><strong>Régimen Fiscal Receptor:</strong> 605 / 612 / 626</p>
        <p><strong>Uso de CFDI:</strong> G03 - Gastos en general</p>
        <p><strong>Método de Pago:</strong> PUE - Pago en una sola exhibición</p>
      </div>
    </div>

    <div class="section-title">Conceptos Facturados</div>
    <table class="table">
      <thead>
        <tr>
          <th>Clave SAT</th>
          <th>Cant.</th>
          <th>Unidad</th>
          <th>Descripción</th>
          <th style="text-align: right;">P. Unitario</th>
          <th style="text-align: right;">Importe</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>90101503</td>
          <td>1.00</td>
          <td>E48 Servicio</td>
          <td>Consumo de alimentos y bebidas según ticket de compra ${folio}</td>
          <td style="text-align: right;">$${subtotalNum.toFixed(2)}</td>
          <td style="text-align: right;">$${subtotalNum.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>

    <div class="totals">
      <table>
        <tr>
          <td>Subtotal:</td>
          <td style="text-align: right;">$${subtotalNum.toFixed(2)} MXN</td>
        </tr>
        <tr>
          <td>IVA Trasladado (16%):</td>
          <td style="text-align: right;">$${ivaNum.toFixed(2)} MXN</td>
        </tr>
        <tr class="total-row">
          <td>TOTAL:</td>
          <td style="text-align: right;">$${totalNum.toFixed(2)} MXN</td>
        </tr>
      </table>
    </div>

    <div class="section-title">Datos del Timbre Fiscal Digital del SAT</div>
    <div class="stamp-box">
      <p><strong>Folio Fiscal (UUID):</strong> ${uuid}</p>
      <p><strong>No. Serie Certificado SAT:</strong> 00001000000504465028</p>
      <p><strong>RFC Proveedor Certificación:</strong> SAT970701NN3</p>
      <p><strong>Fecha y Hora de Certificación:</strong> ${today}</p>
      <p><strong>Cadena Original del Timbre:</strong><br />
      ||1.1|${uuid}|${today}|SAT970701NN3|aBcdEf1234567890...|00001000000504465028||</p>
      <p><strong>Sello Digital del CFDI:</strong><br />
      kL910sKj192kLasd91023+alksjdo912389102jaskd9012kaksldk10293u12093kasmldkm10293==</p>
      <p><strong>Sello Digital del SAT:</strong><br />
      mN8192837482910kdjsla91028301293810293810293810293810293810293810293810293810==</p>
    </div>

    <p style="text-align: center; font-size: 11px; color: #9ca3af; margin-top: 24px;">
      Este documento es una representación impresa de un CFDI versión 4.0 expedido por el Servicio de Administración Tributaria (SAT).
    </p>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
