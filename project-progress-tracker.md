# Satisfactory Planner Style Refactoring Progress

## Main Goals
1. Refactor the styling architecture using ITCSS and BEM methodology
2. Improve maintainability through proper variable management and organization
3. Ensure consistent styling patterns across components
4. Maintain exact visual appearance and functionality throughout the refactor

## Completed Stages
1. Initial ITCSS Structure Setup
   - Created basic ITCSS layer structure
   - Set up main.scss with proper import order
   - Established settings, tools, generic, elements, objects, components, and utilities layers

2. Global Styles Migration
   - Migrated colors to SCSS variables in settings/_colors.scss
   - Created typography settings in settings/_typography.scss
   - Set up breakpoint system in settings/_breakpoints.scss
   - Established base reset styles in generic/_reset.scss

3. Z-Index System Implementation
   - Created settings/_zindex.scss with comprehensive z-index hierarchy
   - Established proper @use imports in component files
   - Updated components to use namespaced z-index variables
   - Removed global z-index imports in favor of component-level imports
   - Created comprehensive z-index documentation

4. Component Style Migration (In Progress)
   - Migrated ProductionNode styles to BEM methodology
   - Created _production-node.scss with proper structure
   - Updated component to use new BEM classes
   - Verified visual appearance and functionality
   - Migrated ListView styles to BEM methodology
   - Created proper nesting structure for ListView components
   - Added animation support for node highlighting
   - Ensured consistent spacing using SCSS variables
   - Migrated Tooltip styles to BEM methodology
   - Created _tooltip.scss with proper structure and variables
   - Updated Tooltip component to use new BEM classes
   - Ensured consistent styling and functionality

## Current Stage
- Continuing component style migration
- Tasks:
  1. ✓ Fixed incorrect import paths for spacing utilities
  2. ✓ Added documentation for directory structure
  3. ✓ Migrated Tooltip component to BEM
  4. Next: Migrate remaining components to BEM methodology

## Upcoming Stages
1. Component Style Migration (Remaining)
   - Migrate ItemIcon styles to BEM
   - Update remaining components to use new class names
   - Ensure consistent spacing across components

2. Style Optimization
   - Audit and consolidate duplicate styles
   - Optimize responsive design patterns
   - Ensure consistent spacing using utilities
   - Review and optimize specificity

3. Final Review and Documentation
   - Conduct visual regression testing
   - Document component style patterns
   - Create style guide for future development
   - Final cleanup of unused styles

## Directory Structure
### Core Directories
- `src/styles/`: Root directory for all styling files
  - `settings/`: Global variables and configuration
  - `tools/`: Mixins and functions
  - `generic/`: Reset and normalize styles
  - `elements/`: Base HTML element styles
  - `objects/`: Layout and structural patterns
  - `components/`: Component-specific styles
  - `utilities/`: Helper classes and utilities

### Key Files and Their Purposes
#### Settings
- `_colors.scss`: Color variables and theming
- `_typography.scss`: Font families, sizes, weights
- `_breakpoints.scss`: Media query breakpoints
- `_zindex.scss`: Z-index hierarchy system

#### Utilities
The utilities directory contains global helper classes that can be reused across components:

- `_spacing.scss`: Contains margin, padding, and gap utilities
  - File location: `src/styles/utilities/_spacing.scss`
  - Content:
    - `.u-m-{n}`: Margin utilities
    - `.u-p-{n}`: Padding utilities
    - `.u-gap-{n}`: Gap utilities
  - Values:
    - `{n}` ranges from 0 to 8, corresponding to values in `rem` units

### Best Practices
- Always import utilities using `@use` with appropriate aliases:
  ```scss
  @use '../utilities/spacing' as s;
  @use '../settings/colors' as c;
  @use '../settings/zindex' as z;
  ```
- Reference utility classes directly in markup for consistent spacing
- Keep component styles modular and isolated
- Use BEM modifiers for state changes
- Nest selectors only when necessary for context

### Import Conventions
- Settings: `@use '../settings/[file]' as [alias]`
- Tools: `@use '../tools/[file]' as [alias]`
- Utilities: `@use '../utilities/[file]' as [alias]`

Recommended aliases:
- colors → c
- spacing → s
- zindex → z
- typography → t
- breakpoints → b

## Spacing System
The project uses a hybrid approach for spacing:

### Spacing Values
All spacing values are defined in a central map:
```scss
$spacing-values: (
  0: 0,
  1: 0.25rem,
  2: 0.5rem,
  3: 0.75rem,
  4: 1rem,
  5: 1.25rem,
  6: 1.5rem,
  8: 2rem
);
```

### Utility Classes
Located in `src/styles/utilities/_spacing.scss`:
- Margin utilities:
  - `.u-m-{n}`: All margins
  - `.u-mt-{n}`, `.u-mr-{n}`, `.u-mb-{n}`, `.u-ml-{n}`: Directional margins
  - `.u-mx-{n}`, `.u-my-{n}`: Axis-based margins
- Padding utilities:
  - `.u-p-{n}`: All padding
  - `.u-pt-{n}`, `.u-pr-{n}`, `.u-pb-{n}`, `.u-pl-{n}`: Directional padding
  - `.u-px-{n}`, `.u-py-{n}`: Axis-based padding
- Gap utilities:
  - `.u-gap-{n}`: All gaps
  - `.u-gap-x-{n}`: Column gaps
  - `.u-gap-y-{n}`: Row gaps

Where `{n}` corresponds to the spacing scale (0-8).

### Spacing Mixin
For component-specific styles:
```scss
@include spacing(property, direction, value);
```
Examples:
```scss
@include spacing(margin, top, 4);    // margin-top: 1rem
@include spacing(padding, null, 3);   // padding: 0.75rem
@include spacing(gap, null, 2);      // gap: 0.5rem
```

### Best Practices
- Use utility classes for global consistency and one-off spacing needs
- Use the spacing mixin for component-specific styles and repeated patterns
- Never use hardcoded rem/px values for spacing
- Prefer the spacing scale over custom values
- Use the spacing function for custom calculations:
  ```scss
  calc(#{spacing(4)} + 2px)
  ```

### Migration Status
✓ Completed:
- Created centralized spacing value map
- Implemented dynamic utility class generation
- Added flexible spacing mixin
- Updated Tooltip component to use new system
- Updated ListView component to use new system

Pending:
- Update remaining components
- Remove any hardcoded spacing values
- Verify consistent spacing across all components

## Notes/Issues
### General Guidelines
- Always use @use for importing SCSS modules
- Follow BEM naming convention strictly
- Maintain existing functionality and appearance
- Document any potential breaking changes

### Known Issues
- ✓ Fixed: Incorrect import paths for spacing utilities
- ✓ Added: Documentation for directory structure and utilities
- Need to ensure proper z-index management in nested components
- Some components may need responsive design improvements
- Legacy CSS files need to be removed after migration
- Need to handle state-based styles consistently
- Consider adding transition mixins for consistent animations
- Need to standardize spacing variables usage across components
- ✓ Implemented hybrid spacing system with utilities and mixins
- Need to audit remaining components for hardcoded spacing values
- Consider adding responsive spacing utilities in the future

### Best Practices
- Use variables for all themeable properties
- Keep component styles modular and isolated
- Document complex style patterns
- Test all changes across different viewports
- Use BEM modifiers for state changes
- Nest selectors only when necessary for context
- Keep animations performant and accessible

## Next Actions
1. Begin ItemIcon component migration
2. Create animation and transition mixins
3. Continue updating progress tracker 