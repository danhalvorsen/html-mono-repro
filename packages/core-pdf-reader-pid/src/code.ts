// ==============================
// CORE: TAXONOMY VALUE OBJECTS
// ==============================

export interface ITaxonomyCode {
  readonly code: string;     // e.g. "P", "T", "XV"
  readonly description: string;
}

export interface IAttributeDefinition {
  readonly key: string;
  readonly required: boolean;
  readonly dataType: "string" | "number" | "enum";
}

export interface IEquipmentClass {
  readonly code: ITaxonomyCode;           // e.g. P, T
  readonly category: "Equipment" | "Valve" | "Instrument" | "Pipe";
  readonly attributes: readonly IAttributeDefinition[];
}

export interface IPipeClass {
  readonly code: ITaxonomyCode;           // e.g. "P" (process)
  readonly attributes: readonly IAttributeDefinition[];
}

export interface ITaxonomyRegister {
  readonly equipment: readonly IEquipmentClass[];
  readonly pipes: readonly IPipeClass[];
}

// ==============================
// TAG RULE ENGINE (USES TAXONOMY)
// ==============================

export interface ITagRuleEngine {
  buildEquipmentTag(input: {
    readonly area?: number;
    readonly classCode: string;
    readonly number: number;
    readonly suffix?: string;
  }): string;

  buildPipeTag(input: {
    readonly sizeInch: number;
    readonly serviceCode: string;
    readonly number: number;
    readonly spec: string;
  }): string;
}

export class TagRuleEngine implements ITagRuleEngine {
  constructor(private readonly taxonomy: ITaxonomyRegister) {}

  buildEquipmentTag(input: {
    readonly area?: number;
    readonly classCode: string;
    readonly number: number;
    readonly suffix?: string;
  }): string {
    const exists = this.taxonomy.equipment.some(e => e.code.code === input.classCode);
    if (!exists) throw new Error(`Unknown equipment class: ${input.classCode}`);

    const base = `${input.classCode}-${input.number}`;
    const withSuffix = input.suffix ? `${base}${input.suffix}` : base;

    return input.area ? `${input.area}-${withSuffix}` : withSuffix;
  }

  buildPipeTag(input: {
    readonly sizeInch: number;
    readonly serviceCode: string;
    readonly number: number;
    readonly spec: string;
  }): string {
    const exists = this.taxonomy.pipes.some(p => p.code.code === input.serviceCode);
    if (!exists) throw new Error(`Unknown pipe service: ${input.serviceCode}`);

    return `${input.sizeInch}"-${input.serviceCode}-${input.number}-${input.spec}`;
  }
}

// ==============================
// TAXONOMY REGISTER (THE "RULE BOOK")
// ==============================

const taxonomy: ITaxonomyRegister = {
  equipment: [
    {
      code: { code: "T", description: "Tank / Vessel" },
      category: "Equipment",
      attributes: [
        { key: "volume", required: true, dataType: "number" },
        { key: "material", required: true, dataType: "string" }
      ]
    },
    {
      code: { code: "P", description: "Pump" },
      category: "Equipment",
      attributes: [
        { key: "flowRate", required: true, dataType: "number" },
        { key: "head", required: true, dataType: "number" }
      ]
    },
    {
      code: { code: "XV", description: "Isolation Valve" },
      category: "Valve",
      attributes: [
        { key: "size", required: true, dataType: "number" },
        { key: "rating", required: true, dataType: "string" }
      ]
    },
    {
      code: { code: "CV", description: "Control Valve" },
      category: "Valve",
      attributes: [
        { key: "kv", required: true, dataType: "number" }
      ]
    }
  ],
  pipes: [
    {
      code: { code: "P", description: "Process Line" },
      attributes: [
        { key: "sizeInch", required: true, dataType: "number" },
        { key: "spec", required: true, dataType: "string" }
      ]
    },
    {
      code: { code: "CW", description: "Cooling Water" },
      attributes: [
        { key: "temperature", required: false, dataType: "number" }
      ]
    }
  ]
};

// ==============================
// USAGE (MASTER TAG GENERATION)
// ==============================

const engine = new TagRuleEngine(taxonomy);

// --- Equipment (from taxonomy rules)
const tankTag = engine.buildEquipmentTag({
  area: 10,
  classCode: "T",
  number: 101
}); // 10-T-101

// --- Pipes (from taxonomy rules)
const inletPipeTag = engine.buildPipeTag({
  sizeInch: 6,
  serviceCode: "P",
  number: 1001,
  spec: "CS300"
}); // 6"-P-1001-CS300

const outletPipeTag = engine.buildPipeTag({
  sizeInch: 6,
  serviceCode: "P",
  number: 1002,
  spec: "CS300"
}); // 6"-P-1002-CS300

// --- Valves (taxonomy enforced)
const inletValve = engine.buildEquipmentTag({
  area: 10,
  classCode: "XV",
  number: 101
}); // 10-XV-101

const inletSampleValve = engine.buildEquipmentTag({
  area: 10,
  classCode: "XV",
  number: 101,
  suffix: "A"
}); // 10-XV-101A

// ==============================
// RESULT (MASTER TAG REGISTER INPUT)
// ==============================

export const masterTags = {
  tankTag,
  inletPipeTag,
  outletPipeTag,
  inletValve,
  inletSampleValve
};