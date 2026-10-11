# Arquitectura del sitio público

El sitio consume el snapshot sanitizado del sincronizador. La reorganización conserva
la interfaz y los cálculos existentes; no incorpora etiquetas ni cambia el contrato JSON.

| Ubicación | Responsabilidad |
| --- | --- |
| `src/data/schema.ts` | Validación Zod y tipos del snapshot |
| `src/data/compatibility.ts` | Normalización de campos históricos antes de validar |
| `src/data/urls.ts` | URLs del snapshot y formularios |
| `src/hooks/useEventData.ts` | Consulta, actualización, cancelación y estado de carga |
| `src/features/participants/` | Búsqueda y progreso temporal de participantes |
| `src/features/ranking/time.ts` | Tiempos, penalizaciones y orden de clasificación |
| `src/features/editorials/credit.ts` | Créditos editoriales publicados |
| `src/format/time.ts` | Presentación de duraciones |
| `src/pages/`, `src/components/` | Composición de páginas y componentes visuales |

`src/data.ts` es una entrada de compatibilidad que reexporta la API anterior. Los módulos
de producción importan directamente del módulo responsable; las pruebas existentes
también comprueban que la entrada anterior sigue funcionando.

Los cálculos reciben datos y tiempos explícitos y no consultan servicios externos.
Los componentes presentan sus resultados. El contrato y los tipos no dependen de
React ni de la configuración de edición.

## Cambios futuros

Una funcionalidad nueva debe reunir sus cálculos y componentes específicos en
`src/features/<funcionalidad>/`. Mantener en `components/` los elementos reutilizables
y en `pages/` la composición y navegación.

Para las etiquetas propuestas, agregar `features/badges/` con catálogo de textos y
componentes. El sincronizador evaluará las reglas y publicará la evidencia necesaria;
el navegador presentará esos resultados. No incluir el calendario privado ni asociaciones
de problemas futuros en el bundle.

Los cálculos de ranking actuales siguen en el sitio para conservar comportamiento.
Convertirlos en una compatibilidad exclusiva para snapshots antiguos requiere una
evolución posterior del contrato público y pruebas entre productor y consumidor.

## Validación

Ejecutar `npm test`, `npm run build` y, con Chromium disponible, `npm run test:e2e`.
La auditoría del límite privado/público se ejecuta desde el sincronizador.
