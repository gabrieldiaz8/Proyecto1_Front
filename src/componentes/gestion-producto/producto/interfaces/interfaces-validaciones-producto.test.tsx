/**
 * Tests CR-001 — Producto: validaciones de denominación, overflow de precio y precio calculado en vivo.
 *
 * Casos cubiertos:
 *  1. Denominación rechazada si contiene solo espacios (not-only-spaces).
 *  2. Denominación rechazada si tiene caracteres no permitidos (matches).
 *  3. Precio calculado rechazado si desborda a Infinity por costo demasiado grande (precio-no-infinity-costo).
 *  4. Precio calculado rechazado si desborda a Infinity por porcentaje desmedido (precio-no-infinity-porcentaje).
 *  5. Porcentaje rechazado si supera el máximo de 999.
 *  6. El campo de precio se renderiza deshabilitado (solo lectura).
 *  7. El precio se recalcula en vivo cuando cambian costo o porcentaje (watch).
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ValidationError } from "yup";

// ─── imports del SUT ────────────────────────────────────────────────────────
import { schema, FormValues } from "./interfaces-validaciones-producto";
import RegistrarActualizarProductoForm from "../utils/registrar-actualizar-producto";
import { AlicuotaIva } from "../../../../interfaces/generales/interfaces-generales";
import { ConfiguracionSistemaProvider } from "../../../sistema/ConfiguracionSistemaContext";

// ─── base de pruebas ─────────────────────────────────────────────────────────

// El schema es una factoría: false,false,false deja stockMinimo y cantidadPorPack opcionales,
// que es el escenario de una línea que no usa stock crítico ni pack.
const schemaProducto = schema(false, false, false);

const valoresValidos = {
  denominacion: "Producto de prueba",
  costo: 100,
  porcentaje: 20,
  marcaId: 1,
  lineaId: 1,
  alicuotaIva: AlicuotaIva.ALICUOTA_21,
};

// ─── helpers ────────────────────────────────────────────────────────────────

/**
 * Valida contra el schema real y devuelve la lista de errores (path + mensaje).
 * Se usa abortEarly:false para que Yup reporte todos los errores juntos y así
 * poder verificar que una regla puntual falló, aun cuando otras también.
 */
async function obtenerErrores(overrides: Partial<FormValues>) {
  try {
    await schemaProducto.validate({ ...valoresValidos, ...overrides }, { abortEarly: false });
    return [] as { path: string; message: string }[];
  } catch (error) {
    return (error as ValidationError).inner.map((fallo) => ({
      path: fallo.path ?? "",
      message: fallo.message,
    }));
  }
}

// ─── Tests del schema de validación ─────────────────────────────────────────

describe("schema de producto (CR-001)", () => {
  beforeEach(() => vi.clearAllMocks());

  // ── Control: la base de pruebas tiene que ser válida ─────────────────────
  it("acepta los valores base sin reportar errores", async () => {
    await expect(
      schemaProducto.validate(valoresValidos, { abortEarly: false })
    ).resolves.toMatchObject({ denominacion: "producto de prueba" });
  });

  // ── Caso 1: not-only-spaces ─────────────────────────────────────────────
  it("rechaza la denominación cuando contiene solo espacios", async () => {
    const errores = await obtenerErrores({ denominacion: "     " });

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
    const errores = await obtenerErrores({ denominacion: "Producto #2024" });

    expect(errores).toContainEqual({
      path: "denominacion",
      message: "Solo se permiten letras, números y espacios.",
    });
  });

  // ── Caso 3: precio-no-infinity-costo ─────────────────────────────────────
  it("rechaza el costo cuando el precio calculado desborda a Infinity", async () => {
    const errores = await obtenerErrores({
      costo: Number.MAX_VALUE,
      porcentaje: 50,
    });

    expect(errores).toContainEqual({
      path: "costo",
      message: "El costo es demasiado grande y causa un desbordamiento en el cálculo del precio.",
    });
  });

  // ── Caso 4: precio-no-infinity-porcentaje ───────────────────────────────
  it("rechaza el porcentaje cuando el precio calculado desborda a Infinity", async () => {
    const errores = await obtenerErrores({
      costo: 1e308,
      porcentaje: 900,
    });

    expect(errores).toContainEqual({
      path: "porcentaje",
      message: "El porcentaje es demasiado grande y causa un desbordamiento en el cálculo del precio.",
    });
  });

  // ── Caso 5: max(999) del porcentaje ──────────────────────────────────────
  it("rechaza el porcentaje cuando supera el máximo de 999", async () => {
    const errores = await obtenerErrores({ porcentaje: 1000 });

    expect(errores).toContainEqual({
      path: "porcentaje",
      message: "El porcentaje máximo permitido es de 999",
    });
  });
});

// ─── wrapper con contexto ────────────────────────────────────────────────────

/**
 * Renderiza con el provider real de configuración del sistema, que es lo que
 * exige useConfiguracionSistema() dentro del formulario.
 * producto: undefined => modo "Registrar Producto", sin llamadas al backend.
 */
function renderFormulario() {
  return render(
    <ConfiguracionSistemaProvider>
      <RegistrarActualizarProductoForm
        producto={undefined}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />
    </ConfiguracionSistemaProvider>
  );
}

/**
 * NumericFormat no recibe `id`, solo `name`, por eso el <label> no sirve para
 * getByLabelText: se localiza el input por su atributo name.
 */
function getInputPorNombre(name: string) {
  const input = screen
    .getAllByRole("textbox")
    .find((el) => (el as HTMLInputElement).name === name);

  expect(input).toBeDefined();
  return input as HTMLInputElement;
}

// ─── Tests del formulario ────────────────────────────────────────────────────

describe("RegistrarActualizarProductoForm (CR-001)", () => {
  beforeEach(() => vi.clearAllMocks());

  // ── Caso 6: el precio calculado es solo lectura ──────────────────────────
  it("renderiza el campo de precio deshabilitado porque es solo lectura", async () => {
    renderFormulario();

    await waitFor(() => {
      expect(getInputPorNombre("precio")).toBeDisabled();
    });
  });

  // ── Caso 7: el precio se recalcula en vivo vía watch ─────────────────────
  // Nota de implementación: los NumericFormat (react-number-format) solo toleran
  // un ciclo clear + type por input y por render; en un segundo clear el caret
  // queda mal ubicado y los dígitos se ignoran. Por eso cada input se escribe
  // una sola vez y el escenario va de 0 → costo → costo+porcentaje.
  it("recalcula el precio en vivo cuando cambian el costo o el porcentaje", async () => {
    const user = userEvent.setup();
    renderFormulario();

    const inputCosto = getInputPorNombre("costo");
    const inputPorcentaje = getInputPorNombre("porcentaje");
    const inputPrecio = getInputPorNombre("precio");

    // Sin costo cargado el precio arranca en 0.
    await waitFor(() => {
      expect(inputPrecio.value).toMatch(/0,00/);
    });

    // Cargar el costo: el precio sigue en 0 porque porcentaje todavía es undefined.
    await user.clear(inputCosto);
    await user.type(inputCosto, "100");
    await waitFor(() => {
      expect(inputCosto.value).toMatch(/100,00/);
      expect(inputPrecio.value).toMatch(/0,00/);
    });

    // Cargar el porcentaje: 100 * (1 + 50/100) = 150.
    await user.clear(inputPorcentaje);
    await user.type(inputPorcentaje, "50");
    await waitFor(() => {
      expect(inputPrecio.value).toMatch(/150,00/);
    });
  });
});
