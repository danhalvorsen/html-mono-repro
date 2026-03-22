import { css, unsafeCSS } from "lit";
import stylesText from "./styles.css?inline";

export const componentStyles = css`${unsafeCSS(stylesText)}`;