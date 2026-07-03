module.exports = {
  // Type check TypeScript files
  "**/*.(ts|tsx)": () => "npm run build", // Or npx tsc --noEmit

  // Lint & Prettify TS and JS files
  "**/*.(ts|tsx|js|jsx)": (filenames) => [
    `npx eslint --fix ${filenames.join(" ")}`,
    `npx prettier --write ${filenames.join(" ")}`,
  ],

  // Prettify Markdown and JSON
  "**/*.(md|json)": (filenames) =>
    `npx prettier --write ${filenames.join(" ")}`,
};
