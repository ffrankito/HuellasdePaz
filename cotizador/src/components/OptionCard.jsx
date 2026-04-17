export default function OptionCard({
  title, desc, icon: Icon, variant, selected, onClick, features, badge,
}) {
  return (
    <button
      type="button"
      className={`option-card option-card--${variant ?? "default"}${selected ? " selected" : ""}`}
      onClick={onClick}
    >
      {badge && <span className="option-card__badge">{badge}</span>}
      <div className="option-card__content">
        {Icon && (
          <div className="option-card__icon-wrap">
            <Icon className="option-card__icon" strokeWidth={1.5} />
          </div>
        )}
        <h3 className="option-card__title">{title}</h3>
        {desc && <p className="option-card__desc">{desc}</p>}
        {features && features.length > 0 && (
          <ul className="option-card__features">
            {features.map((f, i) => <li key={i}>{f}</li>)}
          </ul>
        )}
      </div>
    </button>
  );
}