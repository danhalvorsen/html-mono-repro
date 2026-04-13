# Audio Storybook Guide

This Storybook app lives in [`packages/Audio/storybook`](/mnt/c/Users/danha/source/repos/HTML/MonoRepro/packages/Audio/storybook) and auto-loads story files from sibling Audio packages.

## Add a component to Storybook

1. Confirm the component is exported and self-registers its custom element.
   Example: [`shift-button-element.ts`](/mnt/c/Users/danha/source/repos/HTML/MonoRepro/packages/Audio/core.sequencer.ui.resources/src/shift-button-element.ts)

2. Create a `*.stories.ts` file beside the component in its package `src` folder.
   For the shift button, that file is [`shift-button-element.stories.ts`](/mnt/c/Users/danha/source/repos/HTML/MonoRepro/packages/Audio/core.sequencer.ui.resources/src/shift-button-element.stories.ts)

3. Import the element module inside the story file so the custom element is defined.
   Example:
   ```ts
   import "./shift-button-element.js";
   ```

4. Define a Storybook args interface that matches the public properties you want to control.
   For the shift button:
   - `label`
   - `width`
   - `height`

5. Export Storybook metadata with:
   - `title` for the sidebar location
   - `tags: ["autodocs"]` for docs generation
   - `render` returning the custom element
   - `args` for default values
   - `argTypes` for control types

6. Make sure the story file name matches the Storybook glob configured in [`main.ts`](/mnt/c/Users/danha/source/repos/HTML/MonoRepro/packages/Audio/storybook/.storybook/main.ts).
   This repo uses:
   ```ts
   stories: ["../../*/src/**/*.stories.ts"]
   ```
   That means any `*.stories.ts` file under `packages/Audio/*/src` is picked up automatically.

7. Start Storybook from [`packages/Audio/storybook`](/mnt/c/Users/danha/source/repos/HTML/MonoRepro/packages/Audio/storybook):
   ```bash
   cmd.exe /c pnpm storybook
   ```

8. Open the Storybook UI and confirm the new sidebar entry appears.
   For this component, look for `Sequencer/Shift Button`.

## Example pattern

Use this structure as the default template:

```ts
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

import "./your-element.js";

interface IYourStoryArgs {
  readonly someProp: string;
}

const meta = {
  title: "Group/Your Element",
  tags: ["autodocs"],
  render: (args: IYourStoryArgs) => html`
    <your-element .someProp=${args.someProp}></your-element>
  `,
  args: {
    someProp: "value",
  },
  argTypes: {
    someProp: { control: { type: "text" } },
  },
} satisfies Meta<IYourStoryArgs>;

export default meta;

type Story = StoryObj<IYourStoryArgs>;

export const Default: Story = {};
```

## What was added for the shift button

- Story file: [`shift-button-element.stories.ts`](/mnt/c/Users/danha/source/repos/HTML/MonoRepro/packages/Audio/core.sequencer.ui.resources/src/shift-button-element.stories.ts)
- Sidebar title: `Sequencer/Shift Button`
- Controls: `label`, `width`, `height`
