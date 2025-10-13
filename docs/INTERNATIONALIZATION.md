# Sistema de Internacionalización (i18n)

## Descripción General

La aplicación incluye un sistema completo de internacionalización que soporta Español (ES) e Inglés (EN) con cambio dinámico de idioma sin recargar la página.

## Estructura del Sistema

### 1. Archivos de Idioma
- **Ubicación**: `src/lib/i18n/languages.json`
- **Idiomas soportados**: 
  - `es` - Español (idioma por defecto)
  - `en` - English

### 2. Contexto de Idioma
- **Archivo**: `src/lib/i18n/LanguageContext.tsx`
- **Funcionalidades**:
  - Gestión del estado global del idioma
  - Persistencia en localStorage
  - Función de traducción `t()`
  - Fallback automático al inglés si no encuentra la clave

### 3. Componente de Cambio de Idioma
- **Archivo**: `src/components/ui/LanguageSwitch.tsx`
- **Ubicación**: Navbar superior derecho
- **Características**:
  - Dropdown elegante con banderas
  - Indicador visual del idioma activo
  - Cambio instantáneo de idioma

## Uso del Sistema

### 1. Hook de Traducción

```typescript
import { useLanguage } from '@/lib/i18n/LanguageContext';

function MyComponent() {
  const { t, language, setLanguage } = useLanguage();
  
  return (
    <div>
      <h1>{t('titles.dashboard')}</h1>
      <p>{t('common.loading')}</p>
    </div>
  );
}
```

### 2. Estructura de Claves

Las traducciones están organizadas jerárquicamente:

```json
{
  "es": {
    "common": {
      "loading": "Cargando...",
      "save": "Guardar"
    },
    "candidates": {
      "createCandidate": "Crear Candidato",
      "fullName": "Nombre Completo"
    }
  }
}
```

### 3. Acceso a Traducciones

```typescript
// Acceso simple
t('common.loading') // "Cargando..." o "Loading..."

// Acceso anidado
t('candidates.createCandidate') // "Crear Candidato" o "Create Candidate"

// Si la clave no existe, devuelve la clave original
t('nonexistent.key') // "nonexistent.key"
```

## Categorías de Traducciones

### 1. `common` - Elementos Comunes
- Botones básicos (save, cancel, delete, etc.)
- Estados (loading, success, error)
- Acciones generales

### 2. `navigation` - Navegación
- Nombres de pestañas del sidebar
- Títulos de secciones principales

### 3. `titles` - Títulos de Páginas
- Títulos principales de cada sección
- Headers dinámicos

### 4. `candidates` - Gestión de Candidatos
- Formularios de creación
- Estados de procesamiento IA
- Mensajes específicos

### 5. `interviews` - Entrevistas
- Programación de entrevistas
- Estados de entrevistas
- Acciones relacionadas

### 6. `conversations` - Conversaciones
- Visualización de chats
- Instrucciones de uso
- Tipos de mensajes

### 7. `bulkUpload` - Carga Masiva
- Instrucciones de formato
- Mensajes de validación
- Estados de carga

### 8. `processes` - Procesos IA
- Análisis automático
- Estados de procesamiento

### 9. `agents` - Gestión de Agentes
- CRUD de agentes IA
- Estados y configuraciones

### 10. `reports` - Reportes y Analytics
- Métricas y estadísticas
- Análisis de datos

### 11. `settings` - Configuración
- Opciones de idioma
- Configuraciones generales

### 12. `messages` - Mensajes del Sistema
- Errores específicos
- Notificaciones
- Validaciones

## Agregar Nuevas Traducciones

### 1. Agregar Nueva Clave

En `src/lib/i18n/languages.json`:

```json
{
  "es": {
    "newSection": {
      "newKey": "Nuevo Texto en Español"
    }
  },
  "en": {
    "newSection": {
      "newKey": "New Text in English"
    }
  }
}
```

### 2. Usar en Componente

```typescript
function MyComponent() {
  const { t } = useLanguage();
  
  return <span>{t('newSection.newKey')}</span>;
}
```

## Características Avanzadas

### 1. Persistencia
- El idioma seleccionado se guarda en `localStorage`
- Se restaura automáticamente al recargar la página

### 2. Fallback Inteligente
- Si una clave no existe en el idioma actual, busca en inglés
- Si no existe en inglés, devuelve la clave original

### 3. Cambio Dinámico
- El cambio de idioma es instantáneo
- No requiere recarga de página
- Todos los componentes se actualizan automáticamente

### 4. TypeScript Support
- Tipado fuerte para las claves de traducción
- Autocompletado en el IDE
- Detección de errores en tiempo de compilación

## Mejores Prácticas

### 1. Nomenclatura de Claves
- Usar camelCase para las claves
- Agrupar por funcionalidad
- Ser descriptivo pero conciso

### 2. Organización
- Mantener la misma estructura en ambos idiomas
- Agrupar traducciones relacionadas
- Usar subcategorías lógicas

### 3. Textos Dinámicos
- Para textos con variables, usar interpolación manual
- Mantener consistencia en pluralizaciones
- Considerar diferencias culturales

### 4. Mantenimiento
- Revisar regularmente traducciones faltantes
- Mantener sincronizados ambos idiomas
- Validar contexto y gramática

## Extensibilidad

### Agregar Nuevo Idioma

1. Agregar el código del idioma al tipo `Language`:
```typescript
type Language = 'es' | 'en' | 'fr'; // Agregar 'fr' para francés
```

2. Agregar las traducciones en `languages.json`:
```json
{
  "fr": {
    "common": {
      "loading": "Chargement..."
    }
  }
}
```

3. Actualizar el componente `LanguageSwitch` para incluir el nuevo idioma.

## Componentes Traducidos

### Actualmente Implementado
- ✅ Layout principal (DashboardLayout)
- ✅ Sidebar de navegación
- ✅ Navbar con switch de idioma
- ✅ Sección de candidatos (parcial)
- ✅ Títulos dinámicos

### Por Implementar
- 🔄 Formularios completos
- 🔄 Mensajes de error/éxito
- 🔄 Tooltips y ayudas
- 🔄 Validaciones de formulario
- 🔄 Reportes y analytics

El sistema está diseñado para ser escalable y fácil de mantener, permitiendo agregar nuevos idiomas y traducciones de manera sencilla.
