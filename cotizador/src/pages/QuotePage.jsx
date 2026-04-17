import { useState } from "react";
import StepIndicator from "../components/StepIndicator";
import { petTypes } from "../data/petTypes";
import { sizes } from "../data/sizes";
import { services } from "../data/services";
import { pickupMethods } from "../data/pickupMethods";
import { ashesDelivery } from "../data/ashesDelivery";
import { zones } from "../data/zones";

const initialFormData = {
  petType: "",
  size: "",
  service: "",
  pickupMethod: "",
  ashesDelivery: "",
  zone: "",
  petName: "",
  ownerName: "",
  phone: "",
  email: "",
};

const initialOpenFeatures = {
  "huellitas": false,
  "amigos-para-siempre": false,
  "amigos-de-verdad": false,
};

const CRM_API_URL = import.meta.env.VITE_CRM_API_URL || "https://huellasde-paz.vercel.app/api/leads";

export default function QuotePage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);
  const [showOtherPetTypes, setShowOtherPetTypes] = useState(false);
  const [openFeatures, setOpenFeatures] = useState(initialOpenFeatures);
  const [animKey, setAnimKey] = useState(0);

  const needsZone = formData.pickupMethod === "domicilio";
  const totalSteps = needsZone ? 8 : 7;
  const dataStep = needsZone ? 7 : 6;
  const successStep = needsZone ? 8 : 7;
  const isFinal = step === successStep;

  const principalPetTypes = petTypes.filter((p) => p.group === "principal");
  const otherPetTypes = petTypes.filter((p) => p.group === "otros");

  const goTo = (n) => {
    setStep(n);
    setAnimKey((k) => k + 1);
  };

  const canContinue = () => {
    if (step === 1) return formData.petType !== "";
    if (step === 2) return formData.size !== "";
    if (step === 3) return formData.service !== "";
    if (step === 4) return formData.pickupMethod !== "";
    if (step === 5) return formData.ashesDelivery !== "";
    if (step === 6 && needsZone) return formData.zone !== "";
    if (step === dataStep) {
      return (
        formData.petName.trim() !== "" &&
        formData.ownerName.trim() !== "" &&
        formData.phone.trim() !== "" &&
        formData.email.trim() !== ""
      );
    }
    return true;
  };

  const handleNext = async () => {
    if (!canContinue()) return;

    if (step === dataStep) {
      const selectedService = services.find((s) => s.id === formData.service);
      const selectedSize = sizes.find((s) => s.id === formData.size);
      const selectedPickup = pickupMethods.find((p) => p.id === formData.pickupMethod);
      const selectedZone = zones.find((z) => z.id === formData.zone);

      const resumen = [
        selectedService?.title,
        selectedSize?.title,
        selectedPickup?.title?.replace("\n", " "),
        selectedZone ? "Zona: " + selectedZone.title : null,
        "Mascota: " + formData.petName + " (" + formData.petType + ")",
      ].filter(Boolean).join(" · ");

      try {
        await fetch(CRM_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre: formData.ownerName,
            telefono: formData.phone,
            email: formData.email,
            origen: "cotizador",
            mensaje: resumen,
          }),
        });
      } catch (err) {
        console.error("Error creando lead en CRM:", err);
      }

      goTo(successStep);
      return;
    }

    if (step === 5 && !needsZone) {
      goTo(6);
      return;
    }

    if (step < totalSteps) goTo(step + 1);
  };

  const handleBack = () => {
    if (step === 1 && showOtherPetTypes) {
      setShowOtherPetTypes(false);
      setFormData((p) => ({ ...p, petType: "" }));
      return;
    }
    if (step === 6 && !needsZone) {
      goTo(5);
      return;
    }
    if (step > 1) goTo(step - 1);
  };

  const resetFlow = () => {
    setStep(1);
    setShowOtherPetTypes(false);
    setFormData(initialFormData);
    setOpenFeatures(initialOpenFeatures);
    setAnimKey((k) => k + 1);
  };

  const selectedService = services.find((s) => s.id === formData.service);

  const renderStep1 = () => (
    <div className="section-block">
      <p className="section-block__title">
        {showOtherPetTypes
          ? "Indicanos qué tipo de mascota es"
          : "Contanos qué mascota vamos a acompañar en este momento"}
      </p>
      <div className="pet-grid">
        {(!showOtherPetTypes ? principalPetTypes : otherPetTypes).map((item) => {
          const Icon = item.icon;
          const variant = showOtherPetTypes ? "other-detail" : item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={"option-card option-card--" + variant + (formData.petType === item.id ? " selected" : "")}
              onClick={() => {
                if (item.id === "otro" && !showOtherPetTypes) {
                  setShowOtherPetTypes(true);
                  setFormData((p) => ({ ...p, petType: "" }));
                } else {
                  setFormData((p) => ({ ...p, petType: item.id }));
                }
              }}
            >
              {Icon && (
                <div className="option-card__icon-wrap">
                  <Icon className="option-card__icon" strokeWidth={1.5} />
                </div>
              )}
              <div className="option-card__title">{item.title}</div>
              <div className="option-card__desc">{item.desc}</div>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="section-block">
      <p className="section-block__title">¿De qué tamaño es tu mascota?</p>
      <div className="size-grid">
        {sizes.map((item) => (
          <button
            key={item.id}
            type="button"
            className={"size-card" + (formData.size === item.id ? " selected" : "")}
            onClick={() => setFormData((p) => ({ ...p, size: item.id }))}
          >
            <div className="size-card__name">{item.title}</div>
            <div className="size-card__range">{item.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="section-block">
      <p className="section-block__title">Elegí el servicio que te gustaría ofrecerle</p>
      <div className="service-grid">
        {services.map((item) => {
          const isOpen = openFeatures[item.id];
          return (
            <div
              key={item.id}
              className={"service-card" + (formData.service === item.id ? " selected" : "")}
              onClick={() => setFormData((p) => ({ ...p, service: item.id }))}
            >
              {item.badge && <div className="service-card__badge">{item.badge}</div>}
              <div className="service-card__name">{item.title}</div>
              <div className="service-card__desc">{item.desc}</div>
              <button
                type="button"
                className="service-card__toggle"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenFeatures((prev) => ({ ...prev, [item.id]: !prev[item.id] }));
                }}
              >
                Ver más {isOpen ? "▲" : "▼"}
              </button>
              {isOpen && item.features && (
                <ul className="service-card__features">
                  {item.features.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="section-block">
      <p className="section-block__title">¿Cómo preferís que recibamos a tu mascota?</p>
      <div className="pickup-grid">
        {pickupMethods.map((item) => (
          <button
            key={item.id}
            type="button"
            className={"pickup-card" + (formData.pickupMethod === item.id ? " selected" : "")}
            onClick={() =>
              setFormData((p) => ({
                ...p,
                pickupMethod: item.id,
                zone: item.id !== "domicilio" ? "" : p.zone,
              }))
            }
          >
            <div className="pickup-card__body">
              <span className="pickup-card__label">{item.label ?? "La llevo a"}</span>
              <div className="pickup-card__name">{item.title}</div>
              {item.addr && <div className="pickup-card__addr">{item.addr}</div>}
            </div>
            <div className="pickup-card__footer">{item.hours ?? "Horario a coordinar"}</div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="section-block">
      <p className="section-block__title">¿Dónde querés recibir las cenizas?</p>
      <div className="ashes-grid">
        {ashesDelivery.map((item) => (
          <button
            key={item.id}
            type="button"
            className={"ashes-card" + (formData.ashesDelivery === item.id ? " selected" : "")}
            onClick={() => setFormData((p) => ({ ...p, ashesDelivery: item.id }))}
          >
            <div className="ashes-card__name">{item.title}</div>
            <div className="ashes-card__desc">{item.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep6 = () => (
    <div className="section-block">
      <p className="section-block__title">Indicá la zona donde vamos a buscar a tu mascota</p>
      <div className="zone-grid">
        {zones.map((item) => (
          <button
            key={item.id}
            type="button"
            className={"zone-card" + (formData.zone === item.id ? " selected" : "")}
            onClick={() => setFormData((p) => ({ ...p, zone: item.id }))}
          >
            <div className="zone-card__name">{item.title}</div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderDatos = () => (
    <div className="section-block">
      <p className="section-block__title" style={{ fontSize: 20, marginBottom: 6 }}>
        Último paso: tus datos para acompañarte mejor
      </p>
      <p style={{ textAlign: "center", color: "var(--text-soft)", fontSize: 14, marginBottom: 28 }}>
        Completá tus datos y nos pondremos en contacto para confirmar el homenaje
      </p>
      <div className="form-minimal">
        <div>
          <input className="form-minimal__input" type="text" placeholder="Nombre completo"
            value={formData.ownerName} onChange={(e) => setFormData((p) => ({ ...p, ownerName: e.target.value }))} />
        </div>
        <div>
          <input className="form-minimal__input" type="email" placeholder="Email"
            value={formData.email} onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))} />
        </div>
        <div>
          <input className="form-minimal__input" type="text" placeholder="Nombre de tu mascota"
            value={formData.petName} onChange={(e) => setFormData((p) => ({ ...p, petName: e.target.value }))} />
        </div>
        <div>
          <input className="form-minimal__input" type="tel" placeholder="Teléfono"
            value={formData.phone} onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))} />
          <p className="form-minimal__hint">Con código de área, sin 0 ni 15. Ej: 3411234567</p>
        </div>
      </div>
    </div>
  );

  const renderSuccess = () => {
    const waText = encodeURIComponent(
      "Hola, quiero consultar sobre el servicio " +
      (selectedService?.title || "cremación") +
      " para " + (formData.petName || "mi mascota")
    );
    const waUrl = "https://wa.me/5493410000000?text=" + waText;
    return (
      <div className="success">
        <div className="success__check">✓</div>
        <h2 className="success__title">Gracias por confiar en Huellas de Paz.</h2>
        <p className="success__text">
          Recibimos tu consulta. Sabemos lo importante que es este momento y estaremos a tu lado
          en cada detalle. Muy pronto nos comunicaremos para coordinar el retiro y la entrega.
        </p>
        {selectedService && (
          <>
            <p style={{ fontSize: 13, color: "var(--text-soft)", margin: 0 }}>El servicio seleccionado es:</p>
            <div className="success__service-box">
              <div className="success__service-name">{selectedService.title}</div>
              <div className="success__service-desc">{selectedService.desc}</div>
            </div>
          </>
        )}
        <div className="success__actions">
          <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn btn--whatsapp">
            💬 Confirmar por WhatsApp
          </a>
          <button type="button" className="btn btn--secondary" onClick={resetFlow}>
            Nueva consulta
          </button>
        </div>
      </div>
    );
  };

  const renderCurrentStep = () => {
    if (step === 1) return renderStep1();
    if (step === 2) return renderStep2();
    if (step === 3) return renderStep3();
    if (step === 4) return renderStep4();
    if (step === 5) return renderStep5();
    if (step === 6 && needsZone) return renderStep6();
    if (step === dataStep) return renderDatos();
    if (isFinal) return renderSuccess();
    return null;
  };

  return (
    <div className="app">
      {!isFinal && (
        <StepIndicator step={step} totalSteps={totalSteps} needsZone={needsZone} />
      )}
      <div className="quote-content">
        <div className="step-content" key={animKey}>
          {renderCurrentStep()}
        </div>
        {!isFinal && (
          <div className="nav-buttons">
            {(step > 1 || showOtherPetTypes) && (
              <button type="button" className="btn btn--secondary" onClick={handleBack}>
                ← Volver
              </button>
            )}
            <button
              type="button"
              className={"btn " + (step === dataStep ? "btn--green" : "btn--primary")}
              onClick={handleNext}
              disabled={!canContinue()}
            >
              {step === dataStep ? "Reservar" : "Siguiente"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}