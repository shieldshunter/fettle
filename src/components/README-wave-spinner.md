# Wave Spinner Component

A reusable loading animation component that displays a wave-like spinner with customizable colors and sizes.

## Features

- **Wave Animation**: Smooth scaling animation with staggered delays for a wave effect
- **Dark Mode Support**: Automatically adapts to light/dark mode using CSS variables
- **Size Variants**: Small, medium, and large sizes
- **Color Variants**: Predefined color schemes (primary, success, warning, danger)
- **Custom Colors**: Ability to set custom color schemes
- **Random Colors**: Default random color selection for variety

## Usage

### Basic Usage

```html
<wave-spinner></wave-spinner>
```

### Size Variants

```javascript
// Set size variants
spinner.setSize('small');   // 4px x 6px dots
spinner.setSize('medium');  // 6px x 8px dots (default)
spinner.setSize('large');   // 8px x 10px dots
```

### Color Variants

```javascript
// Set predefined color variants
spinner.setVariant('primary');  // Blue theme
spinner.setVariant('success');  // Green theme
spinner.setVariant('warning');  // Orange theme
spinner.setVariant('danger');   // Red theme
spinner.setVariant('default');  // Random colors
```

### Custom Colors

```javascript
// Set custom colors (base, mid, peak)
spinner.setColors('#ff6b6b', '#4ecdc4', '#45b7d1');
```

## Integration Examples

### In Login Dialog

The wave spinner is now used in the login dialog for the loading state:

```html
<button id="sendLinkBtn" class="btn">
  <span class="icon-text">
    <i class="fas fa-paper-plane"></i>
    <span class="text">Send Magic Link</span>
  </span>
  <wave-spinner class="loading-spinner"></wave-spinner>
</button>
```

### In Other Components

You can use the wave spinner in any component that needs a loading state:

```html
<div class="loading-container">
  <wave-spinner></wave-spinner>
  <p>Loading...</p>
</div>
```

## CSS Variables

The component uses the following CSS variables for theming:

- `--container-bg`: Background color for dots
- `--btn-primary`: Primary color variant
- `--btn-success`: Success color variant
- `--btn-warning`: Warning color variant
- `--btn-danger`: Danger color variant

## Animation

The wave spinner uses a `scaling` keyframe animation that:
- Scales dots vertically from 0.5x to 3x
- Changes colors through three stages (base, mid, peak)
- Uses staggered delays for a wave effect
- Runs continuously with a 1.2s duration

## Browser Support

- Modern browsers with CSS Grid and CSS Custom Properties support
- Shadow DOM for component encapsulation
- Web Components standard

## Migration from Inline HTML

The wave spinner was extracted from the login dialog's inline HTML. To migrate existing code:

**Before:**
```html
<span class="wave-spinner">
  <div></div>
  <div></div>
  <div></div>
  <div></div>
  <div></div>
</span>
```

**After:**
```html
<wave-spinner></wave-spinner>
```

Remove any existing wave spinner CSS as it's now encapsulated within the component. 