export type D1Row = Record<string, unknown>;

export interface D1QueryResponse<T extends D1Row> {
  errors: D1QueryError[];
  messages: D1QueryMessage[];
  result: D1QueryResult<T>[];
  success: boolean;
}

export interface D1QueryResult<T extends D1Row> {
  meta: D1QueryMetadata;
  results: T[];
  success: boolean;
}

export interface D1QueryMetadata {
  changed_db: boolean;
  changes: number;
  // Duration of the operation in milliseconds
  duration: number;
  last_row_id: number;
  // The number of rows read (scanned) by this query
  rows_read: number;
  // The number of rows written by this query
  rows_written: number;
  size_after: number;
}

export interface D1QueryError {
  code: number;
  message: string;
}

export interface D1QueryMessage {
  code: number;
  message: string;
}
