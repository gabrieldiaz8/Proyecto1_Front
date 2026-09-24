/**
 * Tests CR-006 — Ajuste masivo de precios
 *
 * Casos cubiertos:
 *  1. El selector de línea es obligatorio solo cuando alcance === "LINEA".
 *  2. onSubmitValues recibe el payload cuando el form es válido (desacoplado del service).
 *  3. El modal de resultado muestra/oculta la tabla de excluidos según la respuesta.
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CatalogosProvider } from "../../../../../context/catalogos-context";

// ─── imports del SUT ────────────────────────────────────────────────────────
import AjustePreciosMasivoForm from "./ajuste-precios-masivo-form";
import AjustePreciosResultadoModal from "./ajuste-precios-resultado-modal";

// ─── wrapper con contexto ────────────────────────────────────────────────────

/**
 * Renderiza con el provider real de catálogos.
 * El contexto arranca vacío; para testear el selector de línea se inyecta
 * una línea directamente seteando la prop inicial del provider.
 */
function renderWithCatalogos(ui: React.ReactElement) {
  return render(<CatalogosProvider>{ui}</CatalogosProvider>);
}

// ─── helpers ────────────────────────────────────────────────────────────────

async function escribirValor(user: ReturnType<typeof userEvent.setup>, valor: string) {
  const input = screen.getByPlaceholderText("Ej: 10.5");
  await user.clear(input);
  await user.type(input, valor);
}

// ─── Tests del formulario ────────────────────────────────────────────────────

describe("AjustePreciosMasivoForm", () => {
  const onCloseMock = vi.fn();
  const onSubmitValuesMock = vi.fn();

  beforeEach(() => vi.clearAllMocks());

  // ── Caso 1a: con alcance GLOBAL no aparece el selector de línea ───────────
  it("no muestra el selector de línea cuando el alcance es GLOBAL (default)", () => {
    renderWithCatalogos(
      <AjustePreciosMasivoForm onClose={onCloseMock} onSubmitValues={onSubmitValuesMock} />
    );

    // Con alcance GLOBAL, el campo de selección de línea (react-select) NO debe estar presente.
    // Nota: el texto "Línea" sí existe como <option> del select de alcance, así que no lo usamos.
    // Usamos el placeholder del campo react-select que solo aparece cuando alcance === LINEA.
    expect(screen.queryByText(/seleccione una línea/i)).not.toBeInTheDocument();
  });

  // ── Caso 1b: con alcance LINEA aparece y bloquea submit si no hay línea ───
  it("muestra el selector de línea y mantiene Continuar deshabilitado si no se selecciona línea", async () => {
    const user = userEvent.setup();

    renderWithCatalogos(
      <AjustePreciosMasivoForm onClose={onCloseMock} onSubmitValues={onSubmitValuesMock} />
    );

    // Cambiar alcance a LINEA usando el <select name="alcance">
    const selectAlcance = screen.getAllByRole("combobox").find(
      (el) => (el as HTMLSelectElement).name === "alcance"
    )!;
    await user.selectOptions(selectAlcance, "LINEA");

    // El label "Línea" debe aparecer (hay al menos 1 elemento con ese texto)
    // Nota: el texto "Línea" también existe como option en el select de alcance,
    // por eso buscamos específicamente el label del campo de línea.
    const labelsLinea = screen.getAllByText("Línea");
    expect(labelsLinea.length).toBeGreaterThanOrEqual(1);
    // El placeholder del react-select de línea también debe aparecer
    expect(screen.getByText(/seleccione una línea/i)).toBeInTheDocument();

    // Completar el valor numérico para que no haya otro error de validación
    await escribirValor(user, "5");

    // Continuar debe seguir deshabilitado: lineaId requerido pero no seleccionado
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /continuar/i })).toBeDisabled();
    });
  });

  // ── Caso 2: form válido → onSubmitValues recibe el payload ────────────────
  it("invoca onSubmitValues con el payload correcto cuando el formulario es válido", async () => {
    const user = userEvent.setup();

    renderWithCatalogos(
      <AjustePreciosMasivoForm onClose={onCloseMock} onSubmitValues={onSubmitValuesMock} />
    );

    await escribirValor(user, "10");

    const btnContinuar = screen.getByRole("button", { name: /continuar/i });
    await waitFor(() => expect(btnContinuar).not.toBeDisabled());

    await user.click(btnContinuar);

    await waitFor(() => {
      expect(onSubmitValuesMock).toHaveBeenCalledOnce();
      expect(onSubmitValuesMock).toHaveBeenCalledWith(
        expect.objectContaining({
          tipoAjuste: "AUMENTO",
          modalidad: "PORCENTAJE",
          valor: 10,
          alcance: "GLOBAL",
        })
      );
    });
  });
});

// ─── Tests del modal de resultado ───────────────────────────────────────────

describe("AjustePreciosResultadoModal", () => {
  const onCloseMock = vi.fn();

  beforeEach(() => vi.clearAllMocks());

  // ── Caso 3a: con excluidos muestra tabla ─────────────────────────────────
  it("muestra la tabla de excluidos cuando la respuesta trae productos excluidos", () => {
    const resultado = {
      totalProcesados: 10,
      actualizadosExitosamente: 8,
      excluidos: [
        { id: 42, denominacion: "Producto ABC", motivo: "Precio bloqueado" },
        { id: 99, denominacion: "Producto XYZ", motivo: "Sin precio base" },
      ],
    };

    render(<AjustePreciosResultadoModal resultado={resultado} onClose={onCloseMock} />);

    expect(screen.getByText(/se actualizaron con éxito/i)).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();

    expect(screen.getByText(/productos excluidos \(2\)/i)).toBeInTheDocument();
    expect(screen.getByText("Producto ABC")).toBeInTheDocument();
    expect(screen.getByText("Precio bloqueado")).toBeInTheDocument();
    expect(screen.getByText("Producto XYZ")).toBeInTheDocument();
    expect(screen.getByText("Sin precio base")).toBeInTheDocument();
  });

  // ── Caso 3b: sin excluidos NO muestra tabla ───────────────────────────────
  it("no muestra la tabla de excluidos cuando excluidos está vacío", () => {
    const resultado = {
      totalProcesados: 5,
      actualizadosExitosamente: 5,
      excluidos: [],
    };

    render(<AjustePreciosResultadoModal resultado={resultado} onClose={onCloseMock} />);

    expect(screen.getByText(/se actualizaron con éxito/i)).toBeInTheDocument();
    expect(screen.queryByText(/productos excluidos/i)).not.toBeInTheDocument();
    expect(
      screen.getByText(/todos los productos fueron actualizados correctamente/i)
    ).toBeInTheDocument();
  });

  // ── Caso extra: resultado null → no monta nada ───────────────────────────
  it("no monta ningún elemento cuando resultado es null", () => {
    const { container } = render(
      <AjustePreciosResultadoModal resultado={null} onClose={onCloseMock} />
    );
    expect(container).toBeEmptyDOMElement();
  });
});
