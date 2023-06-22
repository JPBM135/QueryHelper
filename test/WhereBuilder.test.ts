import { describe, expect, test } from 'vitest';
import { WhereClassBuilder } from '../dist/index.js';

describe('WhereBuilder - util to build where clauses and nested ones', () => {
  test('Given one where clause, should return a query with one where clause', () => {
    const whereBuilder = new WhereClassBuilder();
    whereBuilder.andWhere('id', 1);
    const query = whereBuilder.build();
    expect('"id" = 1').toBe(query);
  });

  test('Given two where clauses, should return a query with two where clauses', () => {
    const whereBuilder = new WhereClassBuilder();
    whereBuilder.andWhere('id', 1);
    whereBuilder.andWhere('name', 'John');
    const query = whereBuilder.build();
    expect('"id" = 1 and "name" = \'John\'').toBe(query);
  });

  test('Given one nested where clause, should return a query with one nested where clause', () => {
    const whereBuilder = new WhereClassBuilder();
    whereBuilder.andWhere('id', 1);
    whereBuilder.andWhere('name', 'John');
    whereBuilder.nestedAndWhere((nestedWhereBuilder) => {
      nestedWhereBuilder.andWhere('id', 1);
      nestedWhereBuilder.andWhere('name', 'John');
    });
    const query = whereBuilder.build();
    expect('"id" = 1 and "name" = \'John\' and ("id" = 1 and "name" = \'John\')').toBe(query);
  });

  test('Given two nested where clauses, should return a query with two nested where clauses', () => {
    const whereBuilder = new WhereClassBuilder();
    whereBuilder.andWhere('id', 1);
    whereBuilder.andWhere('name', 'John');
    whereBuilder.nestedAndWhere((nestedWhereBuilder) => {
      nestedWhereBuilder.andWhere('id', 1);
      nestedWhereBuilder.andWhere('name', 'John');
    });
    whereBuilder.nestedAndWhere((nestedWhereBuilder) => {
      nestedWhereBuilder.andWhere('id', 1);
      nestedWhereBuilder.andWhere('name', 'John');
    });
    const query = whereBuilder.build();
    expect(
      '"id" = 1 and "name" = \'John\' and ("id" = 1 and "name" = \'John\') and ("id" = 1 and "name" = \'John\')',
    ).toBe(query);
  });
});
