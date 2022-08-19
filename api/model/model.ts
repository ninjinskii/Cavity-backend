export interface Model {
  table: string;
  fields: FieldDesc;
  defaults?: Default;
}

interface FieldDesc {
  [property: string]: Field | DataTypes;
}

interface Field {
  type: DataTypes;
  as?: string;
  autoIncrement?: boolean;
  primaryKey?: boolean;
  allowNull?: boolean;
}

interface Default {
  [property: string]: unknown;
}

export enum DataTypes {
  STRING = "",
  INTEGER = "",
  BIG_INTEGER = "",
  BOOLEAN = "",
}
