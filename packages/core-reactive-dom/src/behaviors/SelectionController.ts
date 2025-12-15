import { DomReactiveController } from "../services/DomReactiveController.js";

/**
 * Toggle selection attribute on click.
 */
export class SelectionController extends DomReactiveController {
  private selected = false;

  protected onAttach(): void {
    this.element.addEventListener("click", this.onClick);
  }

  protected onDetach(): void {
    this.element.removeEventListener("click", this.onClick);
  }

  private onClick = () => {
    this.selected = !this.selected;
    this.element.toggleAttribute("data-selected", this.selected);
  };
}
