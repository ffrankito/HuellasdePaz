export default function NavigationButtons({ step, totalSteps, onBack, onNext, canContinue }) {
  return (
    <div className="nav-buttons">
      {step > 1 && (
        <button type="button" className="btn btn--secondary" onClick={onBack}>
          ← Volver
        </button>
      )}
      <button
        type="button"
        className="btn btn--primary"
        onClick={onNext}
        disabled={!canContinue}
      >
        {step === totalSteps - 1 ? "Ver resumen →" : "Siguiente →"}
      </button>
    </div>
  );
}