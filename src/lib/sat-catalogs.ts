export interface SatRegimenFiscal {
  code: string;
  name: string;
  appliesTo: "fisica" | "moral" | "ambas";
}

export interface SatUsoCFDI {
  code: string;
  name: string;
  appliesTo: "fisica" | "moral" | "ambas";
}

export const SAT_REGIMENES_FISCALES: SatRegimenFiscal[] = [
  {
    code: "601",
    name: "601 - General de Ley Personas Morales",
    appliesTo: "moral",
  },
  {
    code: "603",
    name: "603 - Personas Morales con Fines no Lucrativos",
    appliesTo: "moral",
  },
  {
    code: "605",
    name: "605 - Sueldos y Salarios e Ingresos Asimilados a Salarios",
    appliesTo: "fisica",
  },
  {
    code: "606",
    name: "606 - Arrendamiento",
    appliesTo: "fisica",
  },
  {
    code: "612",
    name: "612 - Personas Físicas con Actividades Empresariales y Profesionales",
    appliesTo: "fisica",
  },
  {
    code: "621",
    name: "621 - Incorporación Fiscal",
    appliesTo: "fisica",
  },
  {
    code: "625",
    name: "625 - Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas",
    appliesTo: "fisica",
  },
  {
    code: "626",
    name: "626 - Régimen Simplificado de Confianza (RESICO)",
    appliesTo: "ambas",
  },
];

export const SAT_USOS_CFDI: SatUsoCFDI[] = [
  {
    code: "G03",
    name: "G03 - Gastos en general",
    appliesTo: "ambas",
  },
  {
    code: "G01",
    name: "G01 - Adquisición de mercancías",
    appliesTo: "ambas",
  },
  {
    code: "S01",
    name: "S01 - Sin efectos fiscales",
    appliesTo: "ambas",
  },
  {
    code: "CP01",
    name: "CP01 - Pagos",
    appliesTo: "ambas",
  },
];

const RFC_FISICA_REGEX =
  /^[A-ZÑ&]{4}\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])[A-Z0-9]{3}$/;
const RFC_MORAL_REGEX =
  /^[A-ZÑ&]{3}\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])[A-Z0-9]{3}$/;

export function validateRFC(rawRfc: string): {
  isValid: boolean;
  type: "fisica" | "moral" | "generico" | null;
  formatted: string;
  error?: string;
} {
  const formatted = rawRfc.trim().toUpperCase();

  if (!formatted) {
    return { isValid: false, type: null, formatted, error: "El RFC es obligatorio" };
  }

  if (formatted === "XAXX010101000" || formatted === "XEXX010101000") {
    return { isValid: true, type: "generico", formatted };
  }

  if (formatted.length === 12) {
    if (RFC_MORAL_REGEX.test(formatted)) {
      return { isValid: true, type: "moral", formatted };
    }
    return {
      isValid: false,
      type: "moral",
      formatted,
      error: "RFC de Persona Moral no válido. Debe tener 12 caracteres alfanuméricos válidos.",
    };
  }

  if (formatted.length === 13) {
    if (RFC_FISICA_REGEX.test(formatted)) {
      return { isValid: true, type: "fisica", formatted };
    }
    return {
      isValid: false,
      type: "fisica",
      formatted,
      error: "RFC de Persona Física no válido. Debe tener 13 caracteres alfanuméricos válidos.",
    };
  }

  return {
    isValid: false,
    type: null,
    formatted,
    error: "El RFC debe contener 12 (Persona Moral) o 13 (Persona Física) caracteres.",
  };
}

export interface PacCfdi40Payload {
  Version: "4.0";
  Serie: string;
  Folio: string;
  Fecha: string;
  FormaPago: string;
  SubTotal: string;
  Moneda: "MXN";
  Total: string;
  TipoDeComprobante: "I";
  MetodoPago: "PUE";
  LugarExpedicion: string;
  Emisor: {
    Rfc: string;
    Nombre: string;
    RegimenFiscal: string;
  };
  Receptor: {
    Rfc: string;
    Nombre: string;
    DomicilioFiscalReceptor: string;
    RegimenFiscalReceptor: string;
    UsoCFDI: string;
  };
  Conceptos: Array<{
    ClaveProdServ: string;
    NoIdentificacion: string;
    Cantidad: string;
    ClaveUnidad: string;
    Unidad: string;
    Descripcion: string;
    ValorUnitario: string;
    Importe: string;
    ObjetoImp: "02";
    Impuestos: {
      Traslados: Array<{
        Base: string;
        Impuesto: "002";
        TipoFactor: "Tasa";
        TasaOCuota: "0.160000";
        Importe: string;
      }>;
    };
  }>;
  Impuestos: {
    TotalImpuestosTrasladados: string;
    Traslados: Array<{
      Base: string;
      Impuesto: "002";
      TipoFactor: "Tasa";
      TasaOCuota: "0.160000";
      Importe: string;
    }>;
  };
}

export function buildPacCfdi40Payload(params: {
  orderNumber: string;
  total: number;
  branchZipCode: string;
  customerRfc: string;
  customerLegalName: string;
  customerFiscalZipCode: string;
  customerFiscalRegime: string;
  customerCfdiUsage: string;
  paymentMethod?: string;
}): PacCfdi40Payload {
  // CFDI 4.0 SAT: Subtotal = Total / 1.16, IVA = Total - Subtotal
  const totalRounded = Math.round(params.total * 100) / 100;
  const subtotal = Math.round((totalRounded / 1.16) * 100) / 100;
  const iva = Math.round((totalRounded - subtotal) * 100) / 100;

  // Map payment method to SAT catalog (01 = Efectivo, 04 = Tarjeta de crédito, 28 = Tarjeta de débito)
  let formaPago = "04";
  if (params.paymentMethod === "cash") formaPago = "01";
  else if (params.paymentMethod === "debit") formaPago = "28";

  // Clean company name: remove common legal acronyms if present (CFDI 4.0 rule)
  const cleanedLegalName = params.customerLegalName
    .trim()
    .toUpperCase()
    .replace(/,?\s*(S\.?A\.?\s*DE\s*C\.?V\.?|S\.?A\.?P\.?I\.?\s*DE\s*C\.?V\.?|S\.? DE\s*R\.?L\.?\s*DE\s*C\.?V\.?|S\.?C\.?)$/i, "");

  return {
    Version: "4.0",
    Serie: "WNG",
    Folio: params.orderNumber.replace(/[^0-9]/g, "").slice(-8) || "10001",
    Fecha: new Date().toISOString().slice(0, 19),
    FormaPago: formaPago,
    SubTotal: subtotal.toFixed(2),
    Moneda: "MXN",
    Total: totalRounded.toFixed(2),
    TipoDeComprobante: "I",
    MetodoPago: "PUE",
    LugarExpedicion: params.branchZipCode || "06000",
    Emisor: {
      Rfc: "LRO240101XX1",
      Nombre: "LOCO ROOSTER OPERADORA DE ALIMENTOS SA DE CV",
      RegimenFiscal: "601",
    },
    Receptor: {
      Rfc: params.customerRfc.toUpperCase().trim(),
      Nombre: cleanedLegalName,
      DomicilioFiscalReceptor: params.customerFiscalZipCode.trim(),
      RegimenFiscalReceptor: params.customerFiscalRegime.trim(),
      UsoCFDI: params.customerCfdiUsage.trim(),
    },
    Conceptos: [
      {
        ClaveProdServ: "90101503", // Establecimientos de comida rápida
        NoIdentificacion: params.orderNumber,
        Cantidad: "1.00",
        ClaveUnidad: "E48", // Unidad de servicio
        Unidad: "Servicio",
        Descripcion: `Consumo de alimentos y bebidas según ticket ${params.orderNumber}`,
        ValorUnitario: subtotal.toFixed(2),
        Importe: subtotal.toFixed(2),
        ObjetoImp: "02",
        Impuestos: {
          Traslados: [
            {
              Base: subtotal.toFixed(2),
              Impuesto: "002",
              TipoFactor: "Tasa",
              TasaOCuota: "0.160000",
              Importe: iva.toFixed(2),
            },
          ],
        },
      },
    ],
    Impuestos: {
      TotalImpuestosTrasladados: iva.toFixed(2),
      Traslados: [
        {
          Base: subtotal.toFixed(2),
          Impuesto: "002",
          TipoFactor: "Tasa",
          TasaOCuota: "0.160000",
          Importe: iva.toFixed(2),
        },
      ],
    },
  };
}
