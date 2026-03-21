# UI Framework — Composite + Lit 3 + Shadow DOM

This project demonstrates a fully SOLID, DRY, Open/Closed UI architecture
based on:

- Composite Pattern (OOP)
- Runtime rendering with Web Components
- Lit 3 with Shadow DOM
- Behavior Wrappers
- Layout Primitives
- Input Primitives

## Running

Serve the demo folder using any static server:

\\\
cd ui-framework/demo
npx serve .
\\\

Open:

\\\
http://localhost:3000
\\\

## Architecture

- UI Element Tree is built from pure TypeScript models
- Web Components render the tree
- Input, layout, and behavior primitives compose arbitrarily
- Token-based design system in \styles/style.css\

See diagram in \diagrams/classes.puml\.
