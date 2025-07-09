export interface Medicine {
  id: number;
  name: string;
  expirationDate: string;
  bodyTypeId: number;
  typeId: number;
  count: number;
  comment: string | null;
}
