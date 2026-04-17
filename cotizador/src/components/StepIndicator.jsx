const STEP_LABELS = [
  "Mascota",
  "Tamaño",
  "Servicio",
  "Retiro",
  "Cenizas",
  "Zona",
  "Tus datos",
  "Resumen",
];

export default function StepIndicator({ step, totalSteps }) {
  return (
    <div className="step-indicator-wrapper">
      <nav className="step-indicator" aria-label="Progreso del cotizador">
        {STEP_LABELS.slice(0, totalSteps).map((label, index) => {
          const num = index + 1;
          const isActive = num === step;
          const isDone = num < step;
          return (
            <div key={num} style={{ display: "flex", alignItems: "center" }}>
              <div
                className={`step-indicator__item${isActive ? " is-active" : ""}${isDone ? " is-done" : ""}`}
                aria-current={isActive ? "step" : undefined}
              >
                <span className="step-indicator__dot" />
                {label}
              </div>
              {num < totalSteps && (
                <div className="step-indicator__separator" />
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}