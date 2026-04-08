# Flujo de leads

## Flujo v1

```
Visitante completa el formulario
        ↓
Validación client-side (nombre, teléfono)
        ↓
POST /api/leads (CRM endpoint)
        ↓
Lead guardado en la DB del CRM
        ↓
Dashboard del CRM → "Leads sin contactar"
        ↓
Televenta contacta al lead por WhatsApp
```

## Datos capturados

| Campo | Obligatorio |
| --- | --- |
| Nombre | Sí |
| Teléfono | Sí |
| Email | No |
| Mensaje | No |
| Plan de interés | No |
| Canal de origen (UTM) | Auto |

## Atribución

- utm_source=instagram → Instagram
- utm_source=facebook → Facebook
- utm_source=google → Google
- Sin UTM → Directo

## Fallback v1 temp (sin CRM deployado)

Leads van a Google Sheets via webhook de Make. Columnas idénticas al CRM para facilitar la migración.
