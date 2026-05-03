export interface TreeLogNodeDto {
  readonly label: string;
  readonly value?: string;
  readonly children?: readonly TreeLogNodeDto[];
}