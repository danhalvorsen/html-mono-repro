export * from './style-resolver.js';
export * from './style-helpers.js';
export * from './control-styles.js';

import { SequencerStyleTokenResolver } from './style-resolver.js';
import { ControlStyleComposer } from './control-styles.js';

export const controlStyles = new ControlStyleComposer().compose(new SequencerStyleTokenResolver());
