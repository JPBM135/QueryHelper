import type { OrderBy, WhereClause } from './shared.js';

export function compileArray(array: string[]): string {
  const compiled = array.map((item) => `'${item}'`).join(', ');
  return `(${compiled})`;
}

export function compileWhereClauses(whereClauses: WhereClause[]): string {
  return whereClauses
    .map((clause, idx) => {
      if (idx === 0) {
        return clause.clause;
      }

      return `${clause.type} ${clause.clause}`;
    })
    .join(' ');
}

export function compileOrderBy(orderBy: OrderBy[]): string {
  const clauses = [];

  for (const [idx, clause] of orderBy.entries()) {
    clauses.push(`${clause.columns.join(', ')} ${clause.direction}${idx === orderBy.length - 1 ? '' : ','}`);
  }

  return clauses.join(' ');
}
