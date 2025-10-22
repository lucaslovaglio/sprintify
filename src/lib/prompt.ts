export const buildPrompt = () => `
Analyze this image and determine if it's a PSA-graded NBA/basketball trading card.

If it IS a PSA basketball card:
- Set isPSA to true
- Extract all visible information from the label into the card object
- Include: player name, card set, card number, grade, certification number, etc.

If it is NOT a PSA card or NOT basketball:
- Set isPSA to false
- Provide a brief reason explaining why

Extract exact text from the label. Don't invent information.
`;