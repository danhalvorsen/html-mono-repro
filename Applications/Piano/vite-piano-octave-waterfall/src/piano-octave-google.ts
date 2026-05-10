import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

const GEOMETRY = {
  white: [
    { name: "C", points: [[0,0], [9.2,0], [9.2,90], [14.3,90], [14.3,150], [0,150]] },
    { name: "D", points: [[14.3,90], [19.4,90], [19.4,0], [23.5,0], [23.5,90], [28.6,90], [28.6,150], [14.3,150]] },
    { name: "E", points: [[28.6,90], [33.6,90], [33.6,0], [42.9,0], [42.9,150], [28.6,150]] },
    { name: "F", points: [[42.9,0], [52,0], [52,90], [57.1,90], [57.1,150], [42.9,150]] },
    { name: "G", points: [[57.1,90], [62.3,90], [62.3,0], [66.5,0], [66.5,90], [71.4,90], [71.4,150], [57.1,150]] },
    { name: "A", points: [[71.4,90], [76.7,90], [76.7,0], [81,0], [81,90], [85.7,90], [85.7,150], [71.4,150]] },
    { name: "H", points: [[85.7,90], [90.8,90], [90.8,0], [100,0], [100,150], [85.7,150]] }
  ],
  black: [
    { name: "Cs", points: [[9.2,0], [19.4,0], [19.4,90], [9.2,90]] },
    { name: "Ds", points: [[23.5,0], [33.6,0], [33.6,90], [23.5,90]] },
    { name: "Fs", points: [[52,0], [62.3,0], [62.3,90], [52,90]] },
    { name: "Gs", points: [[66.5,0], [76.7,0], [76.7,90], [66.5,90]] },
    { name: "As", points: [[81,0], [90.8,0], [90.8,90], [81,90]] }
  ]
};

@customElement('piano-octave-google')
export class PianoOctaveGoogle extends LitElement {
  @property({ type: Number, attribute: 'posx' }) posX = 0;
  @property({ type: Number, attribute: 'posy' }) posY = 0;

 static styles = css`
    :host {
      display: block;
      position: absolute;
      /* FIKS: En oktav er ca 164.5mm bred og 150mm dyp. 
         Vi bruker dette forholdet for å fjerne "strekk-effekten" */
      aspect-ratio: 164.5 / 150; 
      width: 300px; /* Bredden du vil ha på skjermen */
    }
    .keyboard {
      position: relative;
      width: 100%;
      height: 100%;
    }
    svg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      /* preserveAspectRatio="none" sørger for at 100x150-dataene dine 
         fyller den nye, brede boksen perfekt */
    }
    .white-key { fill: #fff; stroke: #000; stroke-width: 0.3; }
    .black-key { fill: #222; stroke: #000; stroke-width: 0.3; }
  `;

  // Oppdaterer posisjon med transform for best ytelse og nøyaktighet
  updated() {
    this.style.transform = `translate(${this.posX}px, ${this.posY}px)`;
  }

  renderKey(key: any, type: string) {
    const points = key.points.map((p: any) => p.join(',')).join(' ');
    return html`
      <svg viewBox="0 0 100 150" preserveAspectRatio="none">
        <polygon class="${type}-key" points="${points}" />
      </svg>
    `;
  }

  render() {
    return html`
      <div class="keyboard">
        ${GEOMETRY.white.map(k => this.renderKey(k, 'white'))}
        ${GEOMETRY.black.map(k => this.renderKey(k, 'black'))}
      </div>
    `;
  }
}
