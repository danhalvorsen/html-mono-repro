import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
 ;

 @customElement('game-application')
export class GameApplication extends LitElement {
 
render() : unknown {
    return html `<game-screen></game-screen>`;
}
}
declare global {
  interface HTMLElementTagNameMap {
    'game-application': GameApplication
  }
}