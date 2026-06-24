# Parallel Market AI 3D Asset Library

This folder stores the project-ready 3D visual assets for Parallel Market AI.

## Structure

- `icons/` - compact 3D UI/support icons for dashboards and feature cards.
- `avatars/` - 3D-style people and AI-agent avatar assets.
- `illustrations/` - larger 3D visuals for empty states, onboarding, reports, and feature highlights.
- `review/` - downloaded candidates that need visual cleanup before production use.
- `_licenses/` - saved license files for the downloaded sources.

## Downloaded Sources

### 3dicons

- Source: https://3dicons.co/
- Repository: https://github.com/realvjy/3dicons
- License saved at: `_licenses/3dicons-CC0-1.0.txt`
- Notes: Good for product UI icons, feature cards, and friendly dashboard decoration.

### Microsoft Fluent Emoji

- Source: https://github.com/microsoft/fluentui-emoji
- License saved at: `_licenses/fluentui-emoji-MIT.txt`
- Notes: Good for lightweight 3D-style avatars, agent identities, empty states, and soft product illustrations.

## Usage Guidance

- Prefer small, purposeful placements: empty states, feature cards, report highlights, onboarding, and customer-agent identity.
- Avoid placing many 3D assets on one screen; the app should feel premium and calm, not playful or crowded.
- Keep regular navigation icons simple unless a 3D asset improves meaning.
- Use `next/image` when these assets are added to components.
- Avoid using assets from `review/` directly; they may have a white background or need cropping/background cleanup.
- Add new assets to the matching folder and update this README with source/license details.

## Future Free Sources To Consider

- Spline Community: useful for interactive 3D scenes and editable 3D objects.
- IconScout free 3D packs: useful when a specific business/analytics metaphor is missing; confirm each asset license before use.
- Figma Community 3D packs: useful for dashboard/onboarding concepts; export only assets with clear commercial usage rights.
