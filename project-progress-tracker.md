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
   - Created _production-node.scss (empty file)
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
  4. ✓ Extracted and fixed MachineAdjustmentControls component
     - Created new component with BEM classes
     - Added SCSS file with proper ITCSS structure
     - Updated ProductionNode to use new component
     - Fixed utility imports and usage:
       - Replaced variables with proper utility functions
       - Updated color variables to use standardized naming
       - Fixed z-index usage to follow hierarchy
       - Added typography utilities
     - Maintained visual consistency with original design
  5. ✓ Implemented Typography System Improvements
     - Created typography mixins in tools/_typography.scss
     - Updated utilities/_typography.scss to use mixins
     - Added comprehensive typography utilities:
       - Font size and weight
       - Text alignment and transformation
       - Line height and clamping
       - Font families
     - Updated MachineAdjustmentControls to use new system
  6. ✓ Implemented Token-Based Typography System
     - Created comprehensive typography tokens map
     - Implemented typography mixins with token support
     - Added responsive typography capabilities
     - Updated utilities to use token system
     - Refactored MachineAdjustmentControls to use new system
  7. Next: Continue extracting remaining components:
     - ProductionRate
     - TreeView
     - BuildingInfo

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
The project uses a hybrid approach for spacing with responsive utilities:

### Breakpoints
```scss
$grid-breakpoints: (
  sm: 480px,
  md: 768px,
  lg: 1200px
);
```

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

### Base Utility Classes
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

### Responsive Utilities
Each utility class has responsive variants for different breakpoints:
```scss
.u-m-sm-{n}  // Applies at small screens and up
.u-p-md-{n}  // Applies at medium screens and up
.u-gap-lg-{n} // Applies at large screens and up
```

Example usage:
```html
<div class="u-p-2 u-p-md-4 u-p-lg-6">
  <!-- Padding increases at each breakpoint -->
</div>
```

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

### Media Query Mixin
For custom responsive styles:
```scss
@include media-breakpoint-up(breakpoint) {
  // Styles here
}
```

### Best Practices
- Use utility classes for global consistency and one-off spacing needs
- Use the spacing mixin for component-specific styles and repeated patterns
- Never use hardcoded rem/px values for spacing
- Prefer the spacing scale over custom values
- Use responsive utilities for adaptive layouts
- Use the spacing function for custom calculations:
  ```scss
  calc(#{spacing(4)} + 2px)
  ```

### Migration Status
✓ Completed:
- Created centralized spacing value map
- Implemented dynamic utility class generation
- Added flexible spacing mixin
- Added responsive spacing utilities
- Updated Tooltip component to use new system
- Updated ListView component to use new system

Pending:
- Update remaining components
- Remove any hardcoded spacing values
- Verify consistent spacing across components
- Test responsive utilities across breakpoints

## Recent Changes and Fixes

### Spacing System Regression Fix (Current)
1. Issue Identified:
   - Unintended visual modifications caused by aggressive use of `!important` declarations
   - Spacing mixins causing specificity conflicts
   - Utility classes overriding component-specific styles

2. Solutions Implemented:
   - Removed `!important` declarations from utility classes
   - Switched from mixin-based to function-based spacing in components
   - Maintained existing visual hierarchy and specificity
   - Preserved component-specific spacing requirements

3. Lessons Learned:
   - Avoid using `!important` in utility classes unless absolutely necessary
   - Prefer direct value functions over mixins for component-specific spacing
   - Test visual changes across all components when updating global systems
   - Document spacing patterns used in each component

4. Best Practices Established:
   - Use `s.spacing()` function for component-specific values:
     ```scss
     padding: s.spacing(3);
     margin-bottom: s.spacing(2);
     ```
   - Use utility classes for one-off spacing needs in templates:
     ```html
     <div class="u-p-3 u-mb-2">
     ```
   - Use responsive classes only when needed:
     ```html
     <div class="u-p-2 u-p-md-3 u-p-lg-4">
     ```

### Migration Status Update
✓ Completed:
- Fixed spacing system regression
- Removed `!important` declarations
- Updated Tooltip component spacing
- Updated ListView component spacing
- Documented spacing best practices

Pending:
- Test all components for visual regressions
- Update remaining components with new spacing approach
- Add visual regression testing to CI/CD pipeline


Pending:
- Test component across all detail levels
- Verify responsive behavior
- Update remaining components
- Add visual regression tests
- Refactor ProductionNode component and reapply styling incrementally

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
- ✓ Added responsive spacing utilities
- Need to audit remaining components for hardcoded spacing values
- Need to test responsive utilities across different viewports
- ✓ Fixed: Spacing system regression and unintended visual changes
- ✓ Updated: Component-specific spacing implementation
- Need to implement visual regression testing
- Consider adding spacing documentation per component
- Need to verify all component detail levels
- Consider adding component-specific spacing documentation

### Best Practices
- Use variables for all themeable properties
- Keep component styles modular and isolated
- Document complex style patterns
- Test all changes across different viewports
- Use BEM modifiers for state changes
- Nest selectors only when necessary for context
- Keep animations performant and accessible

## Next Actions
1. Refactor and restyle ProductionNode component
2. Begin ItemIcon component migration

## Recent Changes and Fixes

### Component Extraction Progress (Current)
1. MachineAdjustmentControls Component
   - Created standalone component for machine count and efficiency controls
   - Implemented BEM methodology for class names
   - Added proper SCSS structure with settings imports
   - Fixed utility usage:
     - Replaced v.$spacing-* with s.spacing() function
     - Updated color variables to use color-* prefix
     - Fixed z-index to use proper hierarchy
     - Added typography utilities for font sizes and weights
   - Maintained all existing functionality:
     - Machine count adjustment
     - Efficiency display
     - Copy efficiency value
   - Added proper TypeScript interfaces
   - Improved accessibility with disabled states

2. Lessons Learned:
   - Keep component-specific styles in their own files
   - Use BEM methodology consistently
   - Use utility functions instead of direct variables
   - Follow standardized color naming convention
   - Consider accessibility in component design
   - Use TypeScript interfaces for prop validation
   - Maintain visual consistency while refactoring

3. Best Practices Established:
   - Component-specific SCSS files
   - BEM class naming convention
   - Proper utility function usage
   - Standardized color naming
   - TypeScript interfaces for props
   - Accessibility considerations

4. Next Steps:
   - Extract ProductionRate component
   - Create TreeView component
   - Refactor BuildingInfo section
   - Update remaining styles to use BEM
   - Add comprehensive testing

### Typography System Implementation (Current)
1. Typography Mixins Creation
   - Created comprehensive set of typography mixins:
     - font-size and font-weight
     - text-align and text-transform
     - line-clamp and truncate
     - font-family and line-height
     - letter-spacing
   - Placed in tools/_typography.scss for global access
   - Ensured consistent naming and usage patterns

2. Typography Utilities Update
   - Refactored utilities/_typography.scss
   - Implemented utility classes using mixins
   - Added new utilities for:
     - Text transformation
     - Font families
     - Line heights
     - Letter spacing
   - Maintained existing class names for backward compatibility

3. Component Updates
   - Updated MachineAdjustmentControls to use new system
   - Replaced direct property assignments with mixins
   - Maintained visual consistency while improving code quality
   - Added proper typography imports and usage

4. Best Practices Established
   - Use typography mixins for all text-related styles
   - Maintain consistent import aliases (type for typography tools)
   - Follow established naming conventions
   - Use utility classes for one-off typography needs
   - Use mixins for component-specific typography

5. Documentation
   - Added typography system documentation
   - Updated component documentation with typography usage
   - Created examples for future implementations

### Next Steps
1. Apply typography system to remaining components
2. Audit existing typography usage
3. Create visual regression tests
4. Document typography patterns in style guide

### Token-Based Typography System Implementation (Current)
1. Typography Tokens Creation
   - Created comprehensive token map in settings/_typography.scss
   - Defined tokens for different text styles:
     - Base text sizes (xs, sm, base, lg, xl)
     - Headings (heading-1, heading-2, heading-3)
     - Special styles (caption, code)
   - Each token includes:
     - font-size
     - line-height
     - font-weight
     - letter-spacing
     - Optional font-family

2. Typography Mixins Enhancement
   - Created main typography mixin for applying complete tokens
   - Added responsive typography support
   - Updated individual property mixins to use tokens
   - Maintained backward compatibility
   - Added error handling for invalid tokens

3. Utility Classes Generation
   - Implemented dynamic utility class generation
   - Added responsive variants for each token
   - Created individual property utilities
   - Maintained existing utility class names
   - Added new semantic naming options

4. Component Updates
   - Refactored MachineAdjustmentControls to use token system
   - Replaced individual property assignments with token usage
   - Added responsive typography where appropriate
   - Maintained visual consistency

5. Best Practices Established
   - Use typography tokens for consistent text styles
   - Apply complete tokens with @include typography($token)
   - Use responsive typography for adaptive layouts
   - Follow semantic naming conventions
   - Maintain backward compatibility

### Usage Examples
```scss
// Using complete typography token
.element {
  @include type.typography('base');
}

// Using responsive typography
.element {
  @include type.typography('heading-1', $responsive: true);
}

// Using individual properties
.element {
  @include type.font-size('lg');
  @include type.line-height('base');
}

// Using utility classes
<div class="u-text-base">Base text</div>
<div class="u-text-heading-1-md">Responsive heading</div>
```

### Next Steps
1. Apply token-based typography to remaining components
2. Create visual regression tests for typography
3. Document token usage patterns
4. Update style guide with typography examples
