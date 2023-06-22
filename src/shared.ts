export type Operators =
  | '-|-'
  | '!='
  | '?-'
  | '?#'
  | '?|'
  | '@>'
  | '&&'
  | '&<'
  | '&>'
  | '#='
  | '#>'
  | '<'
  | '<@'
  | '<#'
  | '<^'
  | '<<'
  | '<='
  | '<>'
  | '='
  | '>'
  | '>='
  | '>>'
  | 'between'
  | 'exists'
  | 'in'
  | 'is distinct from'
  | 'is not distinct from'
  | 'is not null'
  | 'is not'
  | 'is null'
  | 'is'
  | 'like'
  | 'match'
  | 'not between'
  | 'not exists'
  | 'not in'
  | 'not like'
  | 'not match'
  | 'not regexp'
  | 'not sounds like'
  | 'regexp'
  | 'sounds like';

export type AcceptedTypes = Date | boolean | number | string | null;

export interface WhereClause {
  clause: string;
  type: 'and' | 'or';
}

export interface OrderBy {
  columns: string[];
  direction: 'asc' | 'desc';
}

export interface JoinClause {
  clause: string;
  type: 'inner' | 'left' | 'right';
}
