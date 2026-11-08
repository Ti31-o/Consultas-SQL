import initSqlJs, { Database, QueryExecResult } from 'sql.js';

export interface ColumnInfo {
  name: string;
  type: string;
  notNull: boolean;
  isPk: boolean;
  defaultValue?: string | null;
}

export interface ForeignKeyInfo {
  id: number;
  fromColumn: string;
  toTable: string;
  toColumn: string;
}

export interface TableSchema {
  name: string;
  type: 'table' | 'view';
  columns: ColumnInfo[];
  foreignKeys: ForeignKeyInfo[];
  rowCount: number;
  sql?: string;
}

export interface QueryResult {
  columns: string[];
  values: (string | number | boolean | Uint8Array | null)[][];
  executionTimeMs: number;
  rowsAffected?: number;
  error?: string;
}

class SqlEngine {
  private SQL: any = null;
  private db: Database | null = null;
  private isInitializing: boolean = false;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.isInitializing = true;
    this.initPromise = (async () => {
      try {
        // Attempt to load from local public/ wasm first, fallback to CDN
        this.SQL = await initSqlJs({
          locateFile: (file: string) => {
            if (typeof window !== 'undefined') {
              return `/sql-wasm.wasm`;
            }
            return file;
          },
        });
        this.db = new this.SQL.Database();
      } catch (err) {
        console.warn('Failed local wasm load, falling back to CDN:', err);
        this.SQL = await initSqlJs({
          locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.12.0/${file}`,
        });
        this.db = new this.SQL.Database();
      } finally {
        this.isInitializing = false;
      }
    })();

    return this.initPromise;
  }

  isReady(): boolean {
    return this.db !== null;
  }

  getDb(): Database | null {
    return this.db;
  }

  async resetWithSql(sqlScript: string): Promise<void> {
    await this.init();
    if (!this.SQL) throw new Error('SQL engine not initialized');

    if (this.db) {
      try {
        this.db.close();
      } catch {
        // ignore
      }
    }
    const newDb = new this.SQL.Database();
    if (sqlScript.trim()) {
      newDb.run(sqlScript);
    }
    this.db = newDb;
  }

  execute(query: string): QueryResult {
    if (!this.db) {
      return {
        columns: [],
        values: [],
        executionTimeMs: 0,
        error: 'Motor SQL ainda não carregado. Aguarde um instante...',
      };
    }

    const trimmed = query.trim();
    if (!trimmed) {
      return { columns: [], values: [], executionTimeMs: 0 };
    }

    const start = performance.now();
    try {
      // Check if it's a SELECT or statement returning results
      const res: QueryExecResult[] = this.db.exec(trimmed);
      const executionTimeMs = Math.round((performance.now() - start) * 100) / 100;

      if (res.length > 0) {
        const lastResult = res[res.length - 1];
        return {
          columns: lastResult.columns,
          values: lastResult.values,
          executionTimeMs,
          rowsAffected: lastResult.values.length,
        };
      }

      // For DDL or DML without result set (e.g., INSERT, UPDATE, DELETE, CREATE)
      const rowsAffected = this.db.getRowsModified();
      return {
        columns: ['Status'],
        values: [[`Comando executado com sucesso (${rowsAffected} linha(s) modificada(s))`]],
        executionTimeMs,
        rowsAffected,
      };
    } catch (err: any) {
      const executionTimeMs = Math.round((performance.now() - start) * 100) / 100;
      return {
        columns: [],
        values: [],
        executionTimeMs,
        error: err?.message || String(err),
      };
    }
  }

  getTables(): TableSchema[] {
    if (!this.db) return [];
    try {
      const tablesResult = this.db.exec(
        `SELECT name, type, sql FROM sqlite_master WHERE type IN ('table', 'view') AND name NOT LIKE 'sqlite_%' ORDER BY name;`
      );

      if (!tablesResult || tablesResult.length === 0 || !tablesResult[0].values) {
        return [];
      }

      const tables: TableSchema[] = [];
      for (const row of tablesResult[0].values) {
        const tableName = String(row[0]);
        const type = row[1] === 'view' ? 'view' : 'table';
        const sql = row[2] ? String(row[2]) : '';

        // Columns
        const colsResult = this.db.exec(`PRAGMA table_info("${tableName}");`);
        const columns: ColumnInfo[] = [];
        if (colsResult.length > 0) {
          for (const colRow of colsResult[0].values) {
            columns.push({
              name: String(colRow[1]),
              type: String(colRow[2] || 'TEXT').toUpperCase(),
              notNull: Boolean(colRow[3]),
              defaultValue: colRow[4] !== null ? String(colRow[4]) : null,
              isPk: Boolean(colRow[5]),
            });
          }
        }

        // Foreign keys
        const fkResult = this.db.exec(`PRAGMA foreign_key_list("${tableName}");`);
        const foreignKeys: ForeignKeyInfo[] = [];
        if (fkResult.length > 0) {
          for (const fkRow of fkResult[0].values) {
            foreignKeys.push({
              id: Number(fkRow[0]),
              toTable: String(fkRow[2]),
              fromColumn: String(fkRow[3]),
              toColumn: String(fkRow[4]),
            });
          }
        }

        // Row count
        let rowCount = 0;
        try {
          const countRes = this.db.exec(`SELECT COUNT(*) FROM "${tableName}";`);
          if (countRes.length > 0 && countRes[0].values.length > 0) {
            rowCount = Number(countRes[0].values[0][0]) || 0;
          }
        } catch {
          rowCount = 0;
        }

        tables.push({
          name: tableName,
          type,
          columns,
          foreignKeys,
          rowCount,
          sql,
        });
      }

      return tables;
    } catch (err) {
      console.error('Error fetching tables:', err);
      return [];
    }
  }

  exportDatabaseBinary(): Uint8Array | null {
    if (!this.db) return null;
    return this.db.export();
  }

  exportSqlDump(): string {
    if (!this.db) return '';
    const tables = this.getTables();
    let dump = `-- Dump gerado pelo SQL Studio & Learning Lab\n-- Data: ${new Date().toISOString()}\n\nPRAGMA foreign_keys=OFF;\nBEGIN TRANSACTION;\n\n`;

    for (const table of tables) {
      if (table.sql) {
        dump += `DROP TABLE IF EXISTS "${table.name}";\n`;
        dump += `${table.sql};\n`;

        // Export data
        const dataRes = this.db.exec(`SELECT * FROM "${table.name}";`);
        if (dataRes.length > 0 && dataRes[0].values.length > 0) {
          const cols = dataRes[0].columns.map(c => `"${c}"`).join(', ');
          for (const row of dataRes[0].values) {
            const vals = row
              .map(v => {
                if (v === null) return 'NULL';
                if (typeof v === 'number') return v;
                return `'${String(v).replace(/'/g, "''")}'`;
              })
              .join(', ');
            dump += `INSERT INTO "${table.name}" (${cols}) VALUES (${vals});\n`;
          }
        }
        dump += '\n';
      }
    }

    dump += `COMMIT;\nPRAGMA foreign_keys=ON;\n`;
    return dump;
  }
}

export const sqlEngine = new SqlEngine();
