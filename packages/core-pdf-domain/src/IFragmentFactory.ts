import { Fragment } from "./Fragment.js";


export interface IFragmentFactory<TSource, TFragment extends Fragment> {
    create(source: TSource, index: number): TFragment;
}
