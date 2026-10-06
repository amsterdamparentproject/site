// Minimal chainable stand-in for the supabase-js query builder, just enough
// for the firstyear lookups under test. Rows must already be ordered the way
// the real query would return them (newest first for the lookups here).

type Row = Record<string, unknown>;

export function fakeFirstYearDb(tables: Record<string, Row[]>) {
  const deleted: { table: string; ids: unknown[] }[] = [];

  function from(table: string) {
    let rows = [...(tables[table] ?? [])];
    let mode: "select" | "delete" = "select";
    const q: any = {
      select: () => q,
      delete: () => {
        mode = "delete";
        return q;
      },
      eq: (col: string, v: unknown) => {
        rows = rows.filter((r) => r[col] === v);
        return q;
      },
      in: (col: string, vs: unknown[]) => {
        rows = rows.filter((r) => vs.includes(r[col]));
        return q;
      },
      is: (col: string, v: unknown) => {
        rows = rows.filter((r) => (r[col] ?? null) === v);
        return q;
      },
      gte: (col: string, v: string) => {
        rows = rows.filter((r) => String(r[col]) >= v);
        return q;
      },
      lt: (col: string, v: string) => {
        rows = rows.filter((r) => String(r[col]) < v);
        return q;
      },
      order: () => q,
      limit: () => q,
      then: (resolve: (v: unknown) => unknown) => {
        if (mode === "delete") {
          deleted.push({ table, ids: rows.map((r) => r.id ?? r.account_id) });
          tables[table] = (tables[table] ?? []).filter(
            (r) => !rows.includes(r),
          );
          return resolve({ data: null, error: null });
        }
        return resolve({ data: rows, error: null });
      },
    };
    return q;
  }

  return { client: { from } as any, deleted, tables };
}
