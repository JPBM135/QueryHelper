import { writeFileSync } from 'node:fs';
import { describe, test, expect } from 'vitest';
import { SelectQueryHelper } from '../dist/index.js';
import { timerHelper } from './.utils/timer.js';

describe('SelectQueryHelper - build select query', () => {
  test('Given no table name, should throw an error', () => {
    expect(() => new SelectQueryHelper('')).toThrow('Table name is required');
  });

  test('Given one field, should return a query with one field', () => {
    const selectQueryHelper = new SelectQueryHelper('users');
    selectQueryHelper.select('id');
    const { query } = selectQueryHelper.build();
    expect('select id from "users"').toBe(query);
  });

  test('Given two fields, should return a query with two fields', () => {
    const selectQueryHelper = new SelectQueryHelper('users');
    selectQueryHelper.select(['id', 'name']);
    const { query } = selectQueryHelper.build();
    expect('select id, name from "users"').toBe(query);
  });

  test('Given no fields, should return a query with all fields', () => {
    const selectQueryHelper = new SelectQueryHelper('users');
    selectQueryHelper.select();
    const { query } = selectQueryHelper.build();
    expect('select * from "users"').toBe(query);
  });
});

describe('SelectQueryHelper - build select query with where clause', () => {
  test('Given one field and one where clause, should return a query with one field and one where clause', () => {
    const selectQueryHelper = new SelectQueryHelper('users');
    selectQueryHelper.select('id');
    selectQueryHelper.andWhere('id', 1);
    const { query } = selectQueryHelper.build();
    expect('select id from "users" where "id" = 1').toBe(query);
  });

  test('Given two fields and two where clauses, should return a query with two fields and two where clauses', () => {
    const selectQueryHelper = new SelectQueryHelper('users');
    selectQueryHelper.select(['id', 'name']);
    selectQueryHelper.andWhere('id', 1);
    selectQueryHelper.andWhere('name', 'John');
    const { query } = selectQueryHelper.build();
    expect('select id, name from "users" where "id" = 1 and "name" = \'John\'').toBe(query);
  });

  test('Given no fields and one where clause, should return a query with all fields and one where clause', () => {
    const selectQueryHelper = new SelectQueryHelper('users');
    selectQueryHelper.select();
    selectQueryHelper.andWhere('id', 1);
    selectQueryHelper.orWhere('name', 'John');
    const { query } = selectQueryHelper.build();

    expect('select * from "users" where "id" = 1 or "name" = \'John\'').toBe(query);
  });

  test('Given no fields and two where clauses, should return a query with all fields and two where clauses', () => {
    const selectQueryHelper = new SelectQueryHelper('users');
    selectQueryHelper.select();
    selectQueryHelper.orWhere('name', 'John');
    selectQueryHelper.andWhere('id', 1);
    const { query } = selectQueryHelper.build();

    expect('select * from "users" where "name" = \'John\' and "id" = 1').toBe(query);
  });

  test('Given a date where clause, should return a query with a date where clause', () => {
    const selectQueryHelper = new SelectQueryHelper('users');
    selectQueryHelper.select();
    const date = new Date();
    selectQueryHelper.andWhere('created_at', date);
    const { query } = selectQueryHelper.build();

    expect(`select * from "users" where "created_at" = '${date.toISOString()}'`).toBe(query);
  });

  test('Given a number where clause, should return a query with a number where clause', () => {
    const selectQueryHelper = new SelectQueryHelper('users');
    selectQueryHelper.select();
    selectQueryHelper.andWhere('id', 1);
    selectQueryHelper.orWhere('age', 18.5);
    const { query } = selectQueryHelper.build();

    expect('select * from "users" where "id" = 1 or "age" = 18.5').toBe(query);
  });

  test('Given a boolean where clause, should return a query with a boolean where clause', () => {
    const selectQueryHelper = new SelectQueryHelper('users');
    selectQueryHelper.select();
    selectQueryHelper.andWhere('is_active', true);
    const { query } = selectQueryHelper.build();

    expect('select * from "users" where "is_active" = true').toBe(query);
  });

  test('Given a null where clause, should return a query with a null where clause', () => {
    const selectQueryHelper = new SelectQueryHelper('users');
    selectQueryHelper.select();
    selectQueryHelper.andWhereNull('is_active');
    const { query } = selectQueryHelper.build();

    expect('select * from "users" where "is_active" is null').toBe(query);
  });

  test('Given no fields and no where clauses, should throw an error', () => {
    const selectQueryHelper = new SelectQueryHelper('users');
    selectQueryHelper.select();
    // @ts-expect-error: Testing for error
    expect(() => selectQueryHelper.andWhere()).toThrow('Column name and value are required');

    // @ts-expect-error: Testing for error
    expect(() => selectQueryHelper.orWhere()).toThrow('Column name and value are required');
  });
});

describe('SelectQueryHelper - build select query with join clause', () => {
  test('Given one join clause, should return a query with one join clause', () => {
    const selectQueryHelper = new SelectQueryHelper('users');
    selectQueryHelper.select();
    selectQueryHelper.join({
      column: 'id',
      targetTable: 'posts',
      type: 'inner',
      targetColumn: 'user_id',
    });
    const { query } = selectQueryHelper.build();

    expect('select * from "users" inner join "posts" on "users"."id" = "posts"."user_id"').toBe(query);
  });

  test('Given two join clauses, should return a query with two join clauses', () => {
    const selectQueryHelper = new SelectQueryHelper('users');
    selectQueryHelper.select();
    selectQueryHelper.join({
      column: 'id',
      targetTable: 'posts',
      type: 'inner',
      targetColumn: 'user_id',
    });

    selectQueryHelper.join({
      column: 'id',
      targetTable: 'comments',
      type: 'left',
      targetColumn: 'user_id',
    });

    const { query } = selectQueryHelper.build();

    expect(
      'select * from "users" inner join "posts" on "users"."id" = "posts"."user_id" left join "comments" on "users"."id" = "comments"."user_id"',
    ).toBe(query);
  });
});

describe('SelectQueryHelper - build select query with order by clause', () => {
  test('Given one order by clause, should return a query with one order by clause', () => {
    const selectQueryHelper = new SelectQueryHelper('users');
    selectQueryHelper.select();
    selectQueryHelper.orderBy('id', 'asc');
    const { query } = selectQueryHelper.build();

    expect('select * from "users" order by "id" asc').toBe(query);
  });

  test('Given two order by clauses, should return a query with two order by clauses', () => {
    const selectQueryHelper = new SelectQueryHelper('users');
    selectQueryHelper.select();
    selectQueryHelper.orderBy(['id', 'users'], 'asc');
    const { query } = selectQueryHelper.build();

    expect('select * from "users" order by "id", "users" asc').toBe(query);
  });

  test('Given two separate order by clauses, should return a query with two order by clauses', () => {
    const selectQueryHelper = new SelectQueryHelper('users');
    selectQueryHelper.select();
    selectQueryHelper.orderBy('id', 'asc');
    selectQueryHelper.orderBy('users', 'desc');
    const { query } = selectQueryHelper.build();

    expect('select * from "users" order by "id" asc, "users" desc').toBe(query);
  });
});

describe('SelectQueryHelper - build select query with limit and offset clause', () => {
  test('Given a limit clause, should return a query with a limit clause', () => {
    const selectQueryHelper = new SelectQueryHelper('users');
    selectQueryHelper.select();
    selectQueryHelper.limit(10);
    const { query } = selectQueryHelper.build();

    expect('select * from "users" limit 10').toBe(query);
  });

  test('Given a limit and offset clause, should return a query with a limit and offset clause', () => {
    const selectQueryHelper = new SelectQueryHelper('users');
    selectQueryHelper.select();
    selectQueryHelper.limit(10);
    selectQueryHelper.offset(10);
    const { query } = selectQueryHelper.build();

    expect('select * from "users" limit 10 offset 10').toBe(query);
  });

  test('Given a offset clause, should return a query with a offset clause', () => {
    const selectQueryHelper = new SelectQueryHelper('users');
    selectQueryHelper.select();
    selectQueryHelper.offset(10);
    const { query } = selectQueryHelper.build();

    expect('select * from "users" offset 10').toBe(query);
  });
});

describe('SelectQueryHelper - build select query with all clauses', () => {
  test('Given all clauses, should return a query with all clauses', () => {
    const selectQueryHelper = new SelectQueryHelper('users');
    selectQueryHelper.select();
    selectQueryHelper.andWhere('is_active', true);
    selectQueryHelper.orWhere('is_admin', true);
    selectQueryHelper.join({
      column: 'id',
      targetTable: 'posts',
      type: 'inner',
      targetColumn: 'user_id',
    });
    selectQueryHelper.orderBy('id', 'asc');
    selectQueryHelper.limit(10);
    selectQueryHelper.offset(10);
    const { query } = selectQueryHelper.build();

    expect(
      'select * from "users" inner join "posts" on "users"."id" = "posts"."user_id" where "is_active" = true or "is_admin" = true order by "id" asc limit 10 offset 10',
    ).toBe(query);
  });

  test('Given all clauses and count, should return a query with all clauses', () => {
    const selectQueryHelper = new SelectQueryHelper('users');
    selectQueryHelper.select();
    selectQueryHelper.andWhere('is_active', true);
    selectQueryHelper.orWhere('is_admin', true);
    selectQueryHelper.join({
      column: 'id',
      targetTable: 'posts',
      type: 'inner',
      targetColumn: 'user_id',
    });
    selectQueryHelper.orderBy('id', 'asc');
    selectQueryHelper.limit(10);
    selectQueryHelper.offset(10);
    selectQueryHelper.count();
    const { query } = selectQueryHelper.build();

    expect(
      'select count(*) from "users" inner join "posts" on "users"."id" = "posts"."user_id" where "is_active" = true or "is_admin" = true',
    ).toBe(query);
  });

  test('Given all clauses and nested where, should return a query with all clauses', () => {
    const selectQueryHelper = new SelectQueryHelper('users');
    selectQueryHelper.select();
    selectQueryHelper.andWhere('is_active', true);
    selectQueryHelper.orWhere('is_admin', true);
    selectQueryHelper.join({
      column: 'id',
      targetTable: 'posts',
      type: 'inner',
      targetColumn: 'user_id',
    });
    selectQueryHelper.orderBy('id', 'asc');
    selectQueryHelper.limit(10);
    selectQueryHelper.offset(10);
    selectQueryHelper.nestedAndWhere((where) => {
      where.andWhere('is_active', true);
      where.orWhere('is_admin', true);
    });
    const { query } = selectQueryHelper.build();

    expect(
      'select * from "users" inner join "posts" on "users"."id" = "posts"."user_id" where "is_active" = true or "is_admin" = true and ("is_active" = true or "is_admin" = true) order by "id" asc limit 10 offset 10',
    ).toBe(query);
  });
});

describe('SelectQueryHelper - performance', () => {
  test('Given 1000 where clauses, should return a query with 1000 where clauses', () => {
    const selectQueryHelper = new SelectQueryHelper('users');
    selectQueryHelper.select();
    for (let idx = 0; idx < 1_000; idx++) {
      selectQueryHelper.andWhere('id', idx);
    }

    const timer = timerHelper();
    const { query } = selectQueryHelper.build();
    const result = timer();

    expect(query).toMatch(/where/);
    expect(query.match(/id/g)?.length).toBe(1_000);

    expect(result).toBeLessThan(20);
  });

  test('Given 1000 where clauses and 1000 orWhere clauses, should return a query with 2000 where clauses', () => {
    const selectQueryHelper = new SelectQueryHelper('users');
    selectQueryHelper.select();
    for (let idx = 0; idx < 1_000; idx++) {
      selectQueryHelper.andWhere('id', idx);
      selectQueryHelper.orWhere('name', `John ${idx}`);
    }

    const timer = timerHelper();
    const { query } = selectQueryHelper.build();
    const result = timer();

    expect(query).toMatch(/where/);
    expect(query.match(/id/g)?.length).toBe(1_000);
    expect(query.match(/name/g)?.length).toBe(1_000);

    expect(result).toBeLessThan(20);
  });

  test('Given 1000 nested where clauses, should return a query with 1000 nested where clauses', () => {
    const selectQueryHelper = new SelectQueryHelper('users');
    selectQueryHelper.select();
    for (let idx = 0; idx < 1_000; idx++) {
      selectQueryHelper.andWhere('id', idx);
      selectQueryHelper.andWhere('name', `John ${idx}`);
    }

    const timer = timerHelper();
    const { query } = selectQueryHelper.build();
    const result = timer();

    expect(query).toMatch(/where/);
    expect(query.match(/id/g)?.length).toBe(1_000);
    expect(query.match(/name/g)?.length).toBe(1_000);

    expect(result).toBeLessThan(20);
  });

  test('Given 1000000 queries, should return 1000000 queries', () => {
    const timer = timerHelper();
    for (let idx = 0; idx < 1_000_000; idx++) {
      const selectQueryHelper = new SelectQueryHelper('users');
      selectQueryHelper.select();
      selectQueryHelper.andWhere('id', idx);
      selectQueryHelper.build();
    }

    const result = timer();

    expect(result).toBeLessThan(1_000);
  });
});
