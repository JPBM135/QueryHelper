import { compileOrderBy } from '../compilers.js';
import type { AcceptedTypes, Operators, OrderBy } from '../shared.js';
import { WhereClassBuilder } from './WhereBuilder.js';

interface JoinInput {
  column: string;
  operator?: Operators;
  table?: string;
  targetColumn?: string;
  targetTable: string;
  type: 'full' | 'inner' | 'left' | 'right';
}

export class SelectQueryHelper {
  private readonly _table: string;

  private _fields: string[];

  private readonly _whereBuilder: WhereClassBuilder = new WhereClassBuilder();

  private _isCount: boolean = false;

  private _limit: number | null = null;

  private _offset: number | null = null;

  private _orderBy: OrderBy[] = [];

  private _joinClauses: string[] = [];

  public constructor(table: string) {
    if (!table) {
      throw new TypeError('Table name is required');
    }

    this._table = table;

    this._fields = [];
  }

  public select(fields: string[] | string = '*'): this {
    const fieldsArray = Array.isArray(fields) ? fields : [fields];

    this._fields = fieldsArray;
    return this;
  }

  public count(): this {
    this._isCount = true;
    return this;
  }

  public andWhere(column: string, valueOrOperator: AcceptedTypes | Operators, value?: AcceptedTypes): this {
    this._whereBuilder.andWhere(column, valueOrOperator, value);
    return this;
  }

  public orWhere(column: string, valueOrOperator: AcceptedTypes | Operators, value?: AcceptedTypes): this {
    this._whereBuilder.orWhere(column, valueOrOperator, value);
    return this;
  }

  public andInWhere(column: string, values: AcceptedTypes[]): this {
    this._whereBuilder.andInWhere(column, values);
    return this;
  }

  public orInWhere(column: string, values: AcceptedTypes[]): this {
    this._whereBuilder.orInWhere(column, values);
    return this;
  }

  public nestedAndWhere(callback: (where: WhereClassBuilder) => void): this {
    this._whereBuilder.nestedAndWhere(callback);
    return this;
  }

  public nestedOrWhere(callback: (where: WhereClassBuilder) => void): this {
    this._whereBuilder.nestedOrWhere(callback);
    return this;
  }

  public andWhereNull(column: string): this {
    this._whereBuilder.andWhereNull(column);
    return this;
  }

  public orWhereNull(column: string): this {
    this._whereBuilder.orWhereNull(column);
    return this;
  }

  public join({ table, column, operator, targetTable, targetColumn, type }: JoinInput): this {
    const _targetColumn = targetColumn ?? column;
    const _table = table ?? this._table;
    const _operator = operator ?? '=';

    this._joinClauses.push(
      `${type} join ${this.sanitizeTable(targetTable)} on ${this.sanitizeTable(_table)}.${this.sanitizeTable(
        column,
      )} ${_operator} ${this.sanitizeTable(targetTable)}.${this.sanitizeTable(_targetColumn)}`,
    );
    return this;
  }

  public leftJoin({ table, column, operator, targetTable, targetColumn }: Omit<JoinInput, 'type'>): this {
    this.join({ table, column, operator, targetTable, targetColumn, type: 'left' });
    return this;
  }

  public rightJoin({ table, column, operator, targetTable, targetColumn }: Omit<JoinInput, 'type'>): this {
    this.join({ table, column, operator, targetTable, targetColumn, type: 'right' });
    return this;
  }

  public innerJoin({ table, column, operator, targetTable, targetColumn }: Omit<JoinInput, 'type'>): this {
    this.join({ table, column, operator, targetTable, targetColumn, type: 'inner' });
    return this;
  }

  public fullJoin({ table, column, operator, targetTable, targetColumn }: Omit<JoinInput, 'type'>): this {
    this.join({ table, column, operator, targetTable, targetColumn, type: 'full' });
    return this;
  }

  public limit(limit: number): this {
    if (!limit) {
      throw new TypeError('Limit is required');
    }

    this._limit = limit;
    return this;
  }

  public offset(offset: number): this {
    if (!offset) {
      throw new TypeError('Offset is required');
    }

    this._offset = offset;
    return this;
  }

  public orderBy(columns: string[] | string, direction: 'asc' | 'desc' = 'asc'): this {
    const columnsArray = Array.isArray(columns) ? columns : [columns];

    this._orderBy?.push({
      columns: columnsArray.map((column) => this.sanitizeTable(column)),
      direction,
    });

    return this;
  }

  private sanitizeTable(value: string): string {
    return `"${value}"`;
  }

  public build() {
    const query = [
      `select ${this._isCount ? 'count(*)' : this._fields.join(', ')} from ${this.sanitizeTable(this._table)}`,
    ];

    if (this._joinClauses.length) {
      query.push(...this._joinClauses);
    }

    if (this._whereBuilder.hasWhereClauses) {
      query.push('where', this._whereBuilder.build());
    }

    if (this._orderBy.length && !this._isCount) {
      query.push('order by', compileOrderBy(this._orderBy));
    }

    if (this._limit && !this._isCount) {
      query.push('limit', `${this._limit}`);
    }

    if (this._offset && !this._isCount) {
      query.push('offset', `${this._offset}`);
    }

    return { query: query.join(' ') };
  }
}
