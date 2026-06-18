# Parallel Market AI 2D Asset Library

This folder stores 2D assets used for quieter UI chrome such as navigation and profile identity.

## Structure

- `icons/` - Lucide SVG icons used in the sidebar.
- `avatars/` - downloaded 2D avatar artwork.
- `_licenses/` - saved license files for the downloaded sources.

## Downloaded Sources

### Lucide

- Source: https://lucide.dev/
- Repository: https://github.com/lucide-icons/lucide
- License saved at: `_licenses/lucide-ISC.txt`
- Notes: Used for sidebar navigation because the icons are crisp, light, and easy to color with CSS masks.

### Microsoft Fluent Emoji

- Source: https://github.com/microsoft/fluentui-emoji
- License saved at: `_licenses/fluentui-emoji-MIT.txt`
- Notes: Used for the sidebar profile avatar and simulated customer avatars.

## Usage Guidance

- Use these assets for functional UI controls and navigation.
- Keep 3D assets for feature cards, empty states, and larger product moments.
- For SVG sidebar icons, prefer CSS masks so active, hover, disabled, and muted states inherit `currentColor`.
