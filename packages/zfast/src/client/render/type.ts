export type RouteComponentsById = Record<string, any>;

export interface IRoute {
  id: string;
  path: string;
  children?: IRoute[];
}
