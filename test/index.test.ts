import { expect, describe, it, vi } from 'vitest';
import D1API, { D1Error, D1QueryResponse, D1QueryResult } from '../src';

describe('D1API', () => {
  describe('execRaw', () => {
    it('should call D1 API', async () => {
      const mockResponse: D1QueryResponse<{ id: number }> = {
        result: [
          {
            results: [
              {
                id: 1,
              },
            ],
            meta: {
              changes: 0,
              duration: 1,
              rows_read: 1,
              changed_db: false,
              size_after: 1,
              last_row_id: 1,
              rows_written: 0,
            },
            success: true,
          },
        ],
        success: true,
        errors: [],
        messages: [],
      };
      const spy = vi.spyOn(global, 'fetch').mockImplementation(
        vi.fn<any>(() =>
          Promise.resolve({
            json: () => Promise.resolve(mockResponse),
          })
        )
      );

      const d1api = new D1API({
        accountId: 'account-id',
        apiKey: 'api-key',
        databaseId: 'database-id',
      });

      const response = await d1api.execRaw(
        'SELECT * FROM users WHERE id = ?1',
        [1]
      );

      expect(response).toEqual(mockResponse);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(
        'https://api.cloudflare.com/client/v4/accounts/account-id/d1/database/database-id/query',
        {
          body: '{"sql":"SELECT * FROM users WHERE id = ?1","params":[1]}',
          headers: {
            Authorization: 'Bearer api-key',
            'Content-Type': 'application/json',
          },
          method: 'POST',
        }
      );
    });

    it('should throw on D1 API error', async () => {
      const mockResponse: D1QueryResponse<{ id: number }> = {
        result: [],
        success: true,
        errors: [
          {
            code: 1000,
            message: 'Example message',
          },
        ],
        messages: [],
      };
      vi.spyOn(global, 'fetch').mockImplementation(
        vi.fn<any>(() =>
          Promise.resolve({
            json: () => Promise.resolve(mockResponse),
          })
        )
      );

      const d1api = new D1API({
        accountId: 'account-id',
        apiKey: 'api-key',
        databaseId: 'database-id',
      });

      await expect(
        d1api.execRaw('SELECT * FROM users WHERE id = ?1', [1])
      ).rejects.toThrow(new D1Error(mockResponse));
    });
  });

  describe('exec', () => {
    it('should format tagged template', async () => {
      const d1api = new D1API({
        accountId: 'account-id',
        apiKey: 'api-key',
        databaseId: 'database-id',
      });
      const spy = vi.spyOn(d1api, 'execRaw').mockResolvedValue({
        result: [
          {
            results: [
              {
                id: 1,
              },
            ],
            meta: {
              changes: 0,
              duration: 1,
              rows_read: 1,
              changed_db: false,
              size_after: 1,
              last_row_id: 1,
              rows_written: 0,
            },
            success: true,
          },
        ],
        success: true,
        errors: [],
        messages: [],
      });

      await d1api.exec`SELECT * FROM users WHERE id = ${1}`;

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith('SELECT * FROM users WHERE id = ?1', [
        1,
      ]);
    });
  });

  describe('allRaw', () => {
    it('should return all rows', async () => {
      const mockResult: D1QueryResult<{ id: number }> = {
        results: [
          {
            id: 1,
          },
        ],
        meta: {
          changes: 0,
          duration: 1,
          rows_read: 1,
          changed_db: false,
          size_after: 1,
          last_row_id: 1,
          rows_written: 0,
        },
        success: true,
      };

      const mockResponse: D1QueryResponse<{ id: number }> = {
        result: [mockResult],
        success: true,
        errors: [],
        messages: [],
      };
      vi.spyOn(global, 'fetch').mockImplementation(
        vi.fn<any>(() =>
          Promise.resolve({
            json: () => Promise.resolve(mockResponse),
          })
        )
      );

      const d1api = new D1API({
        accountId: 'account-id',
        apiKey: 'api-key',
        databaseId: 'database-id',
      });

      const response = await d1api.allRaw('SELECT * FROM users WHERE id = ?1', [
        1,
      ]);

      expect(response).toEqual(mockResult);
    });

    it('should throw error on no result', async () => {
      const mockResponse: D1QueryResponse<{ id: number }> = {
        result: [],
        success: true,
        errors: [],
        messages: [],
      };

      vi.spyOn(global, 'fetch').mockImplementation(
        vi.fn<any>(() =>
          Promise.resolve({
            json: () => Promise.resolve(mockResponse),
          })
        )
      );

      const d1api = new D1API({
        accountId: 'account-id',
        apiKey: 'api-key',
        databaseId: 'database-id',
      });

      await expect(
        d1api.allRaw('SELECT * FROM users WHERE id = ?1', [1])
      ).rejects.toThrow(new Error('No query passed to all'));
    });
  });

  describe('all', () => {
    it('should format tagged template', async () => {
      const d1api = new D1API({
        accountId: 'account-id',
        apiKey: 'api-key',
        databaseId: 'database-id',
      });
      const spy = vi.spyOn(d1api, 'allRaw').mockResolvedValue({
        results: [
          {
            id: 1,
          },
        ],
        meta: {
          changes: 0,
          duration: 1,
          rows_read: 1,
          changed_db: false,
          size_after: 1,
          last_row_id: 1,
          rows_written: 0,
        },
        success: true,
      });

      await d1api.all`SELECT * FROM users WHERE id = ${1}`;

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith('SELECT * FROM users WHERE id = ?1', [
        1,
      ]);
    });
  });

  describe('firstRaw', () => {
    it('should return first row', async () => {
      const mockResultData: { id: number } = {
        id: 1,
      };

      const mockResponse: D1QueryResponse<{ id: number }> = {
        result: [
          {
            results: [mockResultData],
            meta: {
              changes: 0,
              duration: 1,
              rows_read: 1,
              changed_db: false,
              size_after: 1,
              last_row_id: 1,
              rows_written: 0,
            },
            success: true,
          },
        ],
        success: true,
        errors: [],
        messages: [],
      };
      vi.spyOn(global, 'fetch').mockImplementation(
        vi.fn<any>(() =>
          Promise.resolve({
            json: () => Promise.resolve(mockResponse),
          })
        )
      );

      const d1api = new D1API({
        accountId: 'account-id',
        apiKey: 'api-key',
        databaseId: 'database-id',
      });

      const response = await d1api.firstRaw(
        'SELECT * FROM users WHERE id = ?1',
        [1]
      );

      expect(response).toEqual(mockResultData);
    });

    it('should return null on no result', async () => {
      const mockResponse: D1QueryResponse<{ id: number }> = {
        result: [
          {
            results: [],
            meta: {
              changes: 0,
              duration: 1,
              rows_read: 0,
              changed_db: false,
              size_after: 0,
              last_row_id: 0,
              rows_written: 0,
            },
            success: true,
          },
        ],
        success: true,
        errors: [],
        messages: [],
      };
      vi.spyOn(global, 'fetch').mockImplementation(
        vi.fn<any>(() =>
          Promise.resolve({
            json: () => Promise.resolve(mockResponse),
          })
        )
      );

      const d1api = new D1API({
        accountId: 'account-id',
        apiKey: 'api-key',
        databaseId: 'database-id',
      });

      const response = await d1api.firstRaw(
        'SELECT * FROM users WHERE id = ?1',
        [1]
      );

      expect(response).toEqual(null);
    });

    it('should throw error on no result', async () => {
      const mockResponse: D1QueryResponse<{ id: number }> = {
        result: [],
        success: true,
        errors: [],
        messages: [],
      };

      vi.spyOn(global, 'fetch').mockImplementation(
        vi.fn<any>(() =>
          Promise.resolve({
            json: () => Promise.resolve(mockResponse),
          })
        )
      );

      const d1api = new D1API({
        accountId: 'account-id',
        apiKey: 'api-key',
        databaseId: 'database-id',
      });

      await expect(
        d1api.firstRaw('SELECT * FROM users WHERE id = ?1', [1])
      ).rejects.toThrow(new Error('No query passed to first'));
    });
  });

  describe('first', () => {
    it('should format tagged template', async () => {
      const d1api = new D1API({
        accountId: 'account-id',
        apiKey: 'api-key',
        databaseId: 'database-id',
      });
      const spy = vi.spyOn(d1api, 'firstRaw').mockResolvedValue({
        id: 1,
      });

      await d1api.first`SELECT * FROM users WHERE id = ${1}`;

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith('SELECT * FROM users WHERE id = ?1', [
        1,
      ]);
    });
  });
});
