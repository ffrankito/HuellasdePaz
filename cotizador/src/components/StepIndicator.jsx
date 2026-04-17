const STEPS_CON_ZONA = ["Mascota", "Tamaño", "Servicio", "Retiro", "Cenizas", "Zona", "Tus datos"];
const STEPS_SIN_ZONA = ["Mascota", "Tamaño", "Servicio", "Retiro", "Cenizas", "Tus datos"];

export default function StepIndicator({ step, totalSteps, needsZone }) {
  const labels = needsZone ? STEPS_CON_ZONA : STEPS_SIN_ZONA;

  return (
    <div className="step-indicator-wrapper">
      <nav className="step-indicator" aria-label="Progreso del cotizador">
        {labels.map((label, index) => {
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
              {num < labels.length && (
                <div className="step-indicator__separator" />
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}