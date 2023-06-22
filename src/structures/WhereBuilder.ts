import { compileWhereClauses } from '../compilers.js';
import type { AcceptedTypes, Operators, WhereClause } from '../shared.js';

export class WhereClassBuilder {
  public _whereClauses: WhereClause[] = [];

  public get hasWhereClauses(): boolean {
    return this._whereClauses.length > 0;
  }

  private sanitizeColumn(value: string): string {
    return `"${value}"`;
  }

  private sanitizeValue(value: AcceptedTypes): string {
    if (value === undefined) {
      throw new TypeError('Value must be a string, number, boolean, date, or null, received: undefined');
    }

    if (value === null) {
      return 'null';
    }

    if (value instanceof Date) {
      return `'${value.toISOString()}'`;
    }

    return typeof value === 'string' ? `'${value}'` : value.toString();
  }

  public andWhere(column: string, valueOrOperator: AcceptedTypes | Operators, value?: AcceptedTypes): this {
    if (!column || !valueOrOperator === undefined) {
      throw new TypeError('Column name and value are required');
    }

    const whereClause =
      typeof value === 'string'
        ? `${this.sanitizeColumn(column)} ${valueOrOperator} ${this.sanitizeValue(value)}`
        : `${this.sanitizeColumn(column)} = ${this.sanitizeValue(valueOrOperator)}`;

    this._whereClauses.push({
      clause: whereClause,
      type: 'and',
    });
    return this;
  }

  public orWhere(column: string, valueOrOperator: AcceptedTypes | Operators, value?: AcceptedTypes): this {
    if (!column || !valueOrOperator === undefined) {
      throw new TypeError('Column name and value are required');
    }

    const whereClause =
      typeof value === 'string'
        ? `${this.sanitizeColumn(column)} ${valueOrOperator} ${this.sanitizeValue(value)}`
        : `${this.sanitizeColumn(column)} = ${this.sanitizeValue(valueOrOperator)}`;

    this._whereClauses.push({
      clause: whereClause,
      type: 'or',
    });
    return this;
  }

  public andInWhere(column: string, values: AcceptedTypes[]): this {
    if (!column || !values.length) {
      throw new TypeError('Column name and values are required');
    }

    const whereClause = `${this.sanitizeColumn(column)} in (${values
      .map((value) => this.sanitizeValue(value))
      .join(', ')})`;

    this._whereClauses.push({
      clause: whereClause,
      type: 'and',
    });

    return this;
  }

  public orInWhere(column: string, values: AcceptedTypes[]): this {
    if (!column || !values.length) {
      throw new TypeError('Column name and values are required');
    }

    const whereClause = `${this.sanitizeColumn(column)} in (${values
      .map((value) => this.sanitizeValue(value))
      .join(', ')})`;

    this._whereClauses.push({
      clause: whereClause,
      type: 'or',
    });

    return this;
  }

  public andWhereNull(column: string): this {
    if (!column) {
      throw new TypeError('Column name is required');
    }

    const whereClause = `${this.sanitizeColumn(column)} is null`;

    this._whereClauses.push({
      clause: whereClause,
      type: 'and',
    });

    return this;
  }

  public orWhereNull(column: string): this {
    if (!column) {
      throw new TypeError('Column name is required');
    }

    const whereClause = `${this.sanitizeColumn(column)} is null`;

    this._whereClauses.push({
      clause: whereClause,
      type: 'or',
    });

    return this;
  }

  public nestedAndWhere(callback: (where: WhereClassBuilder) => void): this {
    const where = new WhereClassBuilder();
    // eslint-disable-next-line n/callback-return, promise/prefer-await-to-callbacks
    callback(where);
    const whereClause = `(${where.build()})`;
    this._whereClauses.push({
      clause: whereClause,
      type: 'and',
    });
    return this;
  }

  public nestedOrWhere(callback: (where: WhereClassBuilder) => void): this {
    const where = new WhereClassBuilder();
    // eslint-disable-next-line n/callback-return, promise/prefer-await-to-callbacks
    callback(where);
    const whereClause = `(${where.build()})`;
    this._whereClauses.push({
      clause: whereClause,
      type: 'or',
    });

    return this;
  }

  public build() {
    return compileWhereClauses(this._whereClauses);
  }
}
