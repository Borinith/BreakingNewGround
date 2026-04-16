export interface GetRequest {
  filters?: RequestFilter[] | null;
  order?: RequestOrder | null;
  skip?: number | null;
  take?: number | null;
}

export interface RequestFilter {
  columnName: string;
  valueType: ValueTypeEnum;
  value: string;
  comparison: RequestComparisonEnum;
}

export interface RequestOrder {
  columnName: string;
  orderBy: OrderByEnum;
  isComplexSort: boolean;
  joinTableName?: string | null;
  joinTableColumnName?: string | null;
}

export interface FilterFormValues {
  id?: unknown;
  name?: unknown;
  expirationDate?: unknown;
  medicineBodyType?: unknown;
  medicineType?: unknown;
  count?: unknown;
  comment?: unknown;
}

export enum ValueTypeEnum {
  Integer = 0,
  Long = 1,
  String = 2,
  DateTime = 3,
  Guid = 4
}

export enum RequestComparisonEnum {
  Equal = 0,
  NotEqual = 1,
  LessThan = 2,
  LessThanOrEqual = 3,
  GreaterThan = 4,
  GreaterThanOrEqual = 5,
  TextStartsWith = 6,
  FullTextSearch = 7
}

export enum OrderByEnum {
  Ascending = 0,
  Descending = 1
}
