# Z-Index System Guide

## Overview
This document outlines the z-index system used in the Satisfactory Planner project. The system is designed to maintain consistent layering of UI elements and prevent z-index conflicts.

## Z-Index Hierarchy

### Base Layers (1-10)
- `$zindex-negative: -1`
  - Used for background elements that should always be behind content
  - Example: Background patterns, decorative elements

- `$zindex-default: 1`
  - Default z-index for positioned elements
  - Use when elements just need to be in the stacking context

- `$zindex-raised: 10`
  - Slightly elevated elements
  - Example: Highlighted items, active states

### Navigation and Content (100-900)
- `$zindex-sticky: 100`
  - Sticky elements that follow scroll
  - Example: Sticky headers, persistent controls

- `$zindex-header: 200`
  - Main navigation elements
  - Example: Top navigation bar

### Interactive Elements (1000-1300)
- `$zindex-dropdown: 1000`
  - Dropdown menus and similar interactive elements
  - Example: Recipe selection dropdowns

- `$zindex-popover: 1010`
  - Popovers that should appear above dropdowns
  - Example: Information popovers

- `$zindex-modal-backdrop: 1040`
  - Modal background overlay
  - Always slightly below the modal itself

- `$zindex-modal: 1050`
  - Modal dialogs
  - Example: Configuration modals

- `$zindex-toast: 1100`
  - Toast notifications
  - Should appear above most elements

- `$zindex-tooltip: 1200`
  - Tooltips
  - Example: Recipe information tooltips

- `$zindex-overlay: 1300`
  - Full-screen overlays
  - Example: Loading screens

### Special Cases (1400+)
- `$zindex-dragover: 1400`
  - Drag and drop indicators
  - Should appear above all normal interface elements

- `$zindex-devtools: 9999`
  - Development tools
  - Reserved for debugging elements

## Usage Guide

### Importing Z-Index Variables
```scss
// At the top of your component SCSS file
@use '../settings/zindex' as z;

.c-component {
  &__dropdown {
    z-index: z.$zindex-dropdown;
  }
}
```

### Best Practices
1. **Always use variables**
   - Never use hardcoded z-index values
   - Import z-index variables using @use

2. **Namespace imports**
   - Use a short, meaningful namespace (e.g., 'z')
   - Be consistent with namespace across files

3. **Layer appropriately**
   - Use the lowest possible z-index for your use case
   - Follow the established hierarchy

4. **Document exceptions**
   - If you need a custom z-index, document why
   - Consider adding new variables for reusable cases

### Adding New Z-Index Values
1. Determine if existing values are sufficient
2. If new value needed:
   - Add to settings/_zindex.scss
   - Place in appropriate range
   - Document purpose and usage
   - Update this guide

### Common Patterns

#### Dropdown Example
```scss
@use '../settings/zindex' as z;

.c-dropdown {
  &__trigger {
    position: relative;
    z-index: z.$zindex-dropdown;
  }

  &__content {
    position: absolute;
    z-index: z.$zindex-dropdown;
  }

  &__tooltip {
    position: fixed;
    z-index: z.$zindex-tooltip;
  }
}
```

#### Modal Example
```scss
@use '../settings/zindex' as z;

.c-modal {
  &__backdrop {
    position: fixed;
    z-index: z.$zindex-modal-backdrop;
  }

  &__content {
    position: fixed;
    z-index: z.$zindex-modal;
  }
}
```

## Troubleshooting

### Common Issues
1. **Element not appearing above others**
   - Check if parent has a stacking context
   - Verify z-index variable is imported
   - Ensure position is set (relative/absolute/fixed)

2. **Z-index not working**
   - Check if element has position property
   - Verify stacking context hierarchy
   - Check for competing z-index values

### Stacking Context
Remember that z-index only works on positioned elements. A new stacking context is created by:
- Elements with position: relative/absolute/fixed
- Elements with z-index other than auto
- Elements with opacity less than 1
- Elements with transform, filter, or perspective

## Migration Guide
When migrating existing components:
1. Remove any hardcoded z-index values
2. Import z-index variables using @use
3. Use appropriate z-index from hierarchy
4. Test layering with other components
5. Document any special cases 