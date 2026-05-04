import {
  BasicTagSyntaxRegistryFactory,
  EquipmentOrValveTagSyntax,
  InstrumentTagSyntax,
  LineNumberTagSyntax,
} from "../../src/index.js";

export class BasicTagSyntaxFixture {
  public createEquipmentOrValveSyntax(): EquipmentOrValveTagSyntax {
    return new EquipmentOrValveTagSyntax();
  }

  public createInstrumentSyntax(): InstrumentTagSyntax {
    return new InstrumentTagSyntax();
  }

  public createLineNumberSyntax(): LineNumberTagSyntax {
    return new LineNumberTagSyntax();
  }

  public createRegistry() {
    return new BasicTagSyntaxRegistryFactory().create();
  }
}