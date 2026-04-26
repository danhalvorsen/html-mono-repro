<voice-chain>
  <oscillator-control
    .title=${"Oscillator 1"}
    .oscillator=${this.voiceDefinition.oscillators[0]}
    @oscillator-changed=${(e: CustomEvent) => this.onOscillatorChanged(0, e)}
  ></oscillator-control>

  <adsr-control
    .definition=${this.voiceDefinition}
    @voice-definition-changed=${this.onVoiceDefinitionChanged}
  ></adsr-control>

  <distortion-control
    .definition=${this.voiceDefinition}
    @voice-definition-changed=${this.onVoiceDefinitionChanged}
  ></distortion-control>

  <filters>
    <filter-control-lp></filter-control-lp>
    <filter-control-hp></filter-control-hp>
    <filter-control-bp></filter-control-bp>
  </filters>
</voice-chain>