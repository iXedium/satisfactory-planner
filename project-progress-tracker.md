# Satisfactory Planner Style Refactoring Progress

## Main Goals
1. Refactor the styling architecture using ITCSS and BEM methodology.
2. Improve maintainability through proper variable management and organization.
3. Ensure consistent styling patterns across components.
4. Maintain exact visual appearance and functionality throughout the refactor.

## Completed Stages

### Initial Setup
- Established the ITCSS structure with the following layers:
  - `settings`: Global variables and configuration.
  - `tools`: Mixins and functions.
  - `generic`: Reset and normalize styles.
  - `elements`: Base HTML element styles.
  - `objects`: Layout and structural patterns.
  - `components`: Component-specific styles.
  - `utilities`: Helper classes and utilities.
- Created `main.scss` to import all layers in the correct order.

### Global Styles Migration
- Defined and migrated:
  - Colors: `settings/_colors.scss`.
  - Typography: `settings/_typography.scss`.
  - Breakpoints: `settings/_breakpoints.scss`.
- Established reset styles in `generic/_reset.scss`.

### Z-Index System Implementation
- Created `settings/_zindex.scss` with a comprehensive hierarchy.
- Updated components to use namespaced z-index variables.
- Documented z-index usage and best practices.

### Spacing System
- Developed a hybrid approach with utilities and mixins:
  - Utilities: Defined in `utilities/_spacing.scss` for global use.
  - Mixins: Created in `tools/_spacing.scss` for component-specific styles.
- Added responsive spacing utilities and mixins.
- Updated Tooltip and ListView components to use the new system.

### Component Style Migration (In Progress)
- Migrated ListView and Tooltip components to use BEM methodology and SCSS utilities.
- Updated class names and ensured consistent spacing and z-index usage.

### Color System Updates (Current)
1. Added Component-Specific Colors
   - Created tooltip-specific color variables
   - Added text color variations for tooltips
   - Defined efficiency state colors
   - Added border color variations

2. Updated Color Organization
   - Grouped colors by purpose (base, background, text, etc.)
   - Added semantic color naming
   - Ensured consistent color scaling
   - Added component-specific section

3. Tooltip Component Updates
   - Migrated to new color variables
   - Updated typography using mixins
   - Improved spacing consistency
   - Added proper border handling

4. Best Practices Established
   - Use semantic color names
   - Group colors by purpose
   - Define component-specific colors
   - Use color scale functions
   - Document color purposes

5. Next Steps
   - Audit remaining components for color usage
   - Update documentation with color system
   - Create color palette visualization
   - Add color usage examples

## Current Stage

### Refactoring Components
1. **ProductionNode Component**:
   - Refactor into logical sub-components:
     - `MachineAdjustmentControls`.
     - `ProductionRate`.
     - `TreeView`.
   - Use ITCSS, BEM, and SCSS utilities for consistent styling.
   - Preserve original functionality and visuals during the process.

2. **Remaining Tasks**:
   - Audit other components for hardcoded values.
   - Refactor and migrate styles incrementally.

## Upcoming Stages

### Style Optimization
- Audit and consolidate duplicate styles.
- Ensure consistent responsive patterns across components.
- Optimize specificity and clean unused styles.

### Final Review and Documentation
- Conduct visual regression testing.
- Create a style guide for future development.
- Final cleanup and removal of legacy CSS files.

## Directory Structure

### Core Directories
- `src/styles/`: Root directory for all styling files.
  - `settings/`: Global variables and configuration.
  - `tools/`: Mixins and functions.
  - `generic/`: Reset and normalize styles.
  - `elements/`: Base HTML element styles.
  - `objects/`: Layout and structural patterns.
  - `components/`: Component-specific styles.
  - `utilities/`: Helper classes and utilities.

### Key Files and Their Purposes
#### Settings
- `_colors.scss`: Color variables and theming.
- `_typography.scss`: Font families, sizes, and weights.
- `_breakpoints.scss`: Media query breakpoints.
- `_zindex.scss`: Z-index hierarchy system.

#### Utilities
- `_spacing.scss`: Contains margin, padding, and gap utilities.
  - `.u-m-{n}`, `.u-p-{n}`, `.u-gap-{n}` for global spacing.
  - `.u-mt-{n}`, `.u-px-{n}`, etc., for directional spacing.
- `_typography.scss`: Typography utilities.
  - `.u-text-{size}`, `.u-font-{weight}`, etc., for text styles.
  - `.u-text-center`, `.u-text-left`, etc., for alignment.

#### Components
- Each component (e.g., `ProductionNode`, `ListView`) has a dedicated SCSS file in `components/`.
  - Example: `components/_production-node.scss` for `ProductionNode` styles.

## Best Practices and Guidelines

### General
- Use `@use` for SCSS imports with namespacing.
- Follow BEM naming conventions strictly.
- Maintain modularity and isolate component styles.

### Utilities
- Spacing:
  - Use `.u-m-{n}`, `.u-p-{n}`, and `.u-gap-{n}` for global spacing.
  - Use spacing mixins for component-specific styles.
- Typography:
  - Define font sizes, weights, and alignments as tokens.
  - Use typography mixins and utilities for consistent application.

### Responsive Design
- Use the `$breakpoints` map for generating responsive styles.
- Ensure spacing and typography utilities support responsive variants.

### Notes and Issues
- Ensure z-index management is consistent in nested components.
- Document any breaking changes during migration.
- Test responsive utilities across various viewports.

---

## Next Actions
1. Complete the refactoring of `ProductionNode` sub-components.
2. Migrate styles for `ItemIcon` and other remaining components.
3. Audit the codebase for unused styles and hardcoded values.
4. Finalize responsive utilities and test across breakpoints.
5. Update progress tracker and documentation after each stage.

