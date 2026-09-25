/**
 * Tests CR-001 — Cliente: validaciones de denominación y formato de CUIT / DNI.
 *
 * Casos cubiertos:
 *  1. Denominación rechazada si contiene solo espacios (not-only-spaces).
 *  2. Denominación rechazada si tiene caracteres no permitidos (matches).
 *  3. CUIT requerido: rechaza letras, 10 dígitos y 12 dígitos; acepta 11 dígitos.
 *  4. CUIT opcional: mismo criterio, pero el vacío es válido.
 *  5. DNI requerido: rechaza letras, 6 dígitos y 9 dígitos; acepta 7 u 8 dígitos.
 *  6. DNI opcional: mismo criterio, pero el vacío es válido.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ValidationError } from "yup";

// ─── imports del SUT ────────────────────────────────────────────────────────
import { schema, FormValues } from "./interfaces-validaciones-cliente";

// ─── base de pruebas ─────────────────────────────────────────────────────────

// El schema es una factoría según la condición de IVA seleccionada:
// requiereCuit / requiereDocumento,false,false => los documentos son opcionales.
const schemaClienteConDocumento = schema(true, true);
const schemaClienteSinDocumento = schema(false, false);

const CUIT_VALIDO = "20123456789"; // 11 dígitos
const DNI_VALIDO_7 = "1234567";
const DNI_VALIDO_8 = "12345678";

// La base incluye CUIT y DNI con formato válido, así sirve tanto para el schema
// que los exige (requiereCuit/requiereDocumento = true) como para el que los
// deja opcionales, y cada caso aísra un único campo.
const valoresValidos = {
  denominacion: "Cliente de prueba",
  cuit: CUIT_VALIDO,
  dni: DNI_VALIDO_8,
  condicionIvaId: 1,
  vendedorId: 1,
};

// ─── helpers ────────────────────────────────────────────────────────────────

/**
 * Valida contra el schema real y devuelve la lista de errores (path + mensaje).
 * Se usa abortEarly:false para que Yup reporte todos los errores juntos y así
 * poder verificar que una regla puntual falló, aun cuando otras también.
 */
async function obtenerErrores(
  schemaCliente: typeof schemaClienteConDocumento,
  overrides: Partial<FormValues>
) {
  try {
    await schemaCliente.validate({ ...valoresValidos, ...overrides }, { abortEarly: false });
    return [] as { path: string; message: string }[];
  } catch (error) {
    return (error as ValidationError).inner.map((fallo) => ({
      path: fallo.path ?? "",
      message: fallo.message,
    }));
  }
}

// ─── Tests del schema de validación ─────────────────────────────────────────

describe("schema de cliente (CR-001)", () => {
  beforeEach(() => vi.clearAllMocks());

  // ── Control: la base de pruebas tiene que ser válida ─────────────────────
  it("acepta los valores base sin reportar errores", async () => {
    await expect(
      schemaClienteConDocumento.validate(valoresValidos, { abortEarly: false })
    ).resolves.toMatchObject({ denominacion: "cliente de prueba" });
  });

  // ── Caso 1: not-only-spaces ─────────────────────────────────────────────
  it("rechaza la denominación cuando contiene solo espacios", async () => {
    const errores = await obtenerErrores(schemaClienteConDocumento, {
      denominacion: "     ",
    });

    expect(errores).toContainEqual({
      path: "denominacion",
      message: "La denominación no puede contener solo espacios.",
    });
  });

  // ── Caso 2: matches de caracteres permitidos ────────────────────────────
  // Ojo: en la regex /^[A-Za-z0-9 %-_...]+$/ el tramo "%-_" es un RANGO (0x25-0x5F),
  // por lo que @ & * + , y otros símbolos caen dentro y NO se rechazan.
  // Por eso el caso usa "#" (0x23), que sí queda fuera del rango.
  it("rechaza la denominación cuando tiene caracteres no permitidos", async () => {
    const errores = await obtenerErrores(schemaClienteConDocumento, {
      denominacion: "Cliente #2024",
    });

    expect(errores).toContainEqual({
      path: "denominacion",
      message: "Solo se permiten letras, números y espacios.",
    });
  });
});

// ─── CUIT ───────────────────────────────────────────────────────────────────

describe("validación de CUIT (CR-001)", () => {
  beforeEach(() => vi.clearAllMocks());

  // ── Caso 3: CUIT requerido ──────────────────────────────────────────────
  it("rechaza el CUIT requerido cuando contiene letras", async () => {
    const errores = await obtenerErrores(schemaClienteConDocumento, {
      cuit: "2012345678A", // 11 caracteres: solo falla el formato numérico
    });

    expect(errores).toContainEqual({
      path: "cuit",
      message: "El CUIT debe contener solo números.",
    });
  });

  it("rechaza el CUIT requerido cuando tiene 10 dígitos", async () => {
    const errores = await obtenerErrores(schemaClienteConDocumento, { cuit: "2012345678" });

    expect(errores).toContainEqual({
      path: "cuit",
      message: "El CUIT debe tener exactamente 11 dígitos.",
    });
  });

  it("rechaza el CUIT requerido cuando tiene 12 dígitos", async () => {
    const errores = await obtenerErrores(schemaClienteConDocumento, {
      cuit: "201234567890",
    });

    expect(errores).toContainEqual({
      path: "cuit",
      message: "El CUIT debe tener exactamente 11 dígitos.",
    });
  });

  it("acepta el CUIT requerido cuando tiene 11 dígitos", async () => {
    const errores = await obtenerErrores(schemaClienteConDocumento, { cuit: CUIT_VALIDO });

    expect(errores).toEqual([]);
  });

  // ── Caso 4: CUIT opcional ───────────────────────────────────────────────
  it("acepta el CUIT opcional cuando está vacío", async () => {
    const errores = await obtenerErrores(schemaClienteSinDocumento, { cuit: "" });

    expect(errores).toEqual([]);
  });

  it("rechaza el CUIT opcional cuando contiene letras", async () => {
    const errores = await obtenerErrores(schemaClienteSinDocumento, {
      cuit: "2012345678A",
    });

    expect(errores).toContainEqual({
      path: "cuit",
      message: "El CUIT debe contener solo números y tener exactamente 11 dígitos.",
    });
  });

  it("rechaza el CUIT opcional cuando tiene 10 o 12 dígitos", async () => {
    const conDiez = await obtenerErrores(schemaClienteSinDocumento, { cuit: "2012345678" });
    const conDoce = await obtenerErrores(schemaClienteSinDocumento, { cuit: "201234567890" });

    const mensaje = "El CUIT debe contener solo números y tener exactamente 11 dígitos.";
    expect(conDiez).toContainEqual({ path: "cuit", message: mensaje });
    expect(conDoce).toContainEqual({ path: "cuit", message: mensaje });
  });

  it("acepta el CUIT opcional cuando tiene 11 dígitos", async () => {
    const errores = await obtenerErrores(schemaClienteSinDocumento, { cuit: CUIT_VALIDO });

    expect(errores).toEqual([]);
  });
});

// ─── DNI ────────────────────────────────────────────────────────────────────

describe("validación de DNI (CR-001)", () => {
  beforeEach(() => vi.clearAllMocks());

  // ── Caso 5: DNI requerido ───────────────────────────────────────────────
  it("rechaza el DNI requerido cuando contiene letras", async () => {
    const errores = await obtenerErrores(schemaClienteConDocumento, {
      dni: "123456A", // 7 caracteres: solo falla el formato numérico
    });

    expect(errores).toContainEqual({
      path: "dni",
      message: "El DNI debe contener solo números.",
    });
  });

  it("rechaza el DNI requerido cuando tiene 6 dígitos", async () => {
    const errores = await obtenerErrores(schemaClienteConDocumento, { dni: "123456" });

    expect(errores).toContainEqual({
      path: "dni",
      message: "El DNI debe tener entre 7 y 8 dígitos.",
    });
  });

  it("rechaza el DNI requerido cuando tiene 9 dígitos", async () => {
    const errores = await obtenerErrores(schemaClienteConDocumento, { dni: "123456789" });

    expect(errores).toContainEqual({
      path: "dni",
      message: "El DNI debe tener entre 7 y 8 dígitos.",
    });
  });

  it("acepta el DNI requerido cuando tiene 7 u 8 dígitos", async () => {
    const conSiete = await obtenerErrores(schemaClienteConDocumento, { dni: DNI_VALIDO_7 });
    const conOcho = await obtenerErrores(schemaClienteConDocumento, { dni: DNI_VALIDO_8 });

    expect(conSiete).toEqual([]);
    expect(conOcho).toEqual([]);
  });

  // ── Caso 6: DNI opcional ────────────────────────────────────────────────
  it("acepta el DNI opcional cuando está vacío", async () => {
    const errores = await obtenerErrores(schemaClienteSinDocumento, { dni: "" });

    expect(errores).toEqual([]);
  });

  it("rechaza el DNI opcional cuando contiene letras", async () => {
    const errores = await obtenerErrores(schemaClienteSinDocumento, { dni: "123456A" });

    expect(errores).toContainEqual({
      path: "dni",
      message: "El DNI debe contener solo números y tener entre 7 y 8 dígitos.",
    });
  });

  it("rechaza el DNI opcional cuando tiene 6 o 9 dígitos", async () => {
    const conSeis = await obtenerErrores(schemaClienteSinDocumento, { dni: "123456" });
    const conNueve = await obtenerErrores(schemaClienteSinDocumento, { dni: "123456789" });

    const mensaje = "El DNI debe contener solo números y tener entre 7 y 8 dígitos.";
    expect(conSeis).toContainEqual({ path: "dni", message: mensaje });
    expect(conNueve).toContainEqual({ path: "dni", message: mensaje });
  });

  it("acepta el DNI opcional cuando tiene 7 u 8 dígitos", async () => {
    const conSiete = await obtenerErrores(schemaClienteSinDocumento, { dni: DNI_VALIDO_7 });
    const conOcho = await obtenerErrores(schemaClienteSinDocumento, { dni: DNI_VALIDO_8 });

    expect(conSiete).toEqual([]);
    expect(conOcho).toEqual([]);
  });
});
