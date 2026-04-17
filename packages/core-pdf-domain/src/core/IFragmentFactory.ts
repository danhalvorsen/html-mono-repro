// src/IFragmentFactory.ts

import { Fragment } from "./Fragment.js";

export interface IFragmentFactory<TSource, TFragment extends Fragment<TFragment>> {
    create(source: TSource, index: number): TFragment;
}