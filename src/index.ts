import type { D1QueryError, D1QueryResponse, D1Row } from './types';
export type * from './types';

export interface D1APIOptions {
  // Hex string, 32 characters long
  accountId: string;
  // Alphanumeric string, 40 characters long
  apiKey: string;
  // UUID, 36 characters long
  databaseId: string;
}

export default class D1API {
  constructor(private options: D1APIOptions) {}

  // Executes a query on the D1 API.
  // Prefer using exec with tagged template.
  async execRaw<T extends D1Row>(sql: string, params?: unknown[]) {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${this.options.accountId}/d1/database/${this.options.databaseId}/query`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.options.apiKey}`,
        },
        body: JSON.stringify({
          sql,
          params,
        }),
      }
    );

    const body = (await response.json()) as D1QueryResponse<T>;

    if ('errors' in body && body.errors.length) {
      throw new D1Error<T>(body);
    }

    return body;
  }

  // Executes a query on the D1 API with tagged template.
  async exec<T extends D1Row>(
    strings: TemplateStringsArray,
    ...params: unknown[]
  ) {
    return this.execRaw<T>(buildTaggedSql(strings), params);
  }

  // Returns result of all rows.
  // Prefer using all with tagged template.
  async allRaw<T extends D1Row>(sql: string, params?: unknown[]) {
    const response = await this.execRaw<T>(sql, params);

    if (!response.result?.[0]) {
      throw new Error('No query passed to all');
    }

    return response.result[0];
  }

  // Returns result of all rows with tagged template.
  async all<T extends D1Row>(
    strings: TemplateStringsArray,
    ...params: unknown[]
  ) {
    return this.allRaw<T>(buildTaggedSql(strings), params);
  }

  // Returns the first row. Returns null if no result.
  // Prefer using first with tagged template.
  async firstRaw<T extends D1Row>(
    sql: string,
    params?: unknown[]
  ): Promise<T | null> {
    const response = await this.execRaw<T>(sql, params);

    if (!response.result?.[0]) {
      throw new Error('No query passed to first');
    }

    return response.result[0].results?.[0] ?? null;
  }

  // Returns the first row with tagged template. Returns null if no result.
  async first<T extends D1Row>(
    strings: TemplateStringsArray,
    ...params: unknown[]
  ): Promise<T | null> {
    return this.firstRaw<T>(buildTaggedSql(strings), params);
  }
}

export class D1Error<T extends D1Row> extends Error {
  public errors: D1QueryError[];

  constructor(public body: D1QueryResponse<T>) {
    super(
      `D1 error: ${body.errors
        .map((error: { message: string }) => error.message)
        .join(', ')}`
    );
    this.errors = body.errors;

    this.name = 'D1Error';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

function buildTaggedSql(strings: TemplateStringsArray) {
  return strings.reduce((sql, string, index) => {
    if (index === strings.length - 1) {
      return `${sql}${string}`;
    }
    return `${sql}${string}?${index + 1}`;
  }, '');
}
