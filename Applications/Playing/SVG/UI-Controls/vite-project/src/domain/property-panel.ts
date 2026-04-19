export type PropertyValue = string | number | boolean | null

export type PropertyType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'color'
  | 'angle'
  | 'length'
  | 'enum'

export interface PropertyPanelEntry {
  readonly name: string
  readonly value: PropertyValue
  readonly type?: PropertyType
  readonly description?: string
}
