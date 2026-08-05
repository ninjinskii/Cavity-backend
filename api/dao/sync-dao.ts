import { filterIgnoredFields, toSnakeCase } from "../util/transform-data.ts";

export interface SyncAccountContent {
  [table: string]: unknown[];
}

abstract class AccountSyncDao {
  constructor(
    protected readonly tableConfigs: TableConfig[],
  ) {}

  abstract sync(
    accountId: number,
    payload: SyncAccountContent,
  ): Promise<void>;

  protected formatSyncPayload(
    payload: SyncAccountContent,
  ): SyncAccountContent {
    const configs = Object.fromEntries(
      this.tableConfigs.map((config) => [
        config.table,
        config,
      ]),
    );

    return Object.fromEntries(
      Object.entries(payload).map(([table, rows]) => [
        table,
        rows.map((row) =>
          filterIgnoredFields(
            toSnakeCase(row),
            configs[table]?.ignoredFields ?? [],
          )
        ),
      ]),
    );
  }
}

export class SupabaseSyncDao extends AccountSyncDao {
  constructor(
    private readonly client: SupabaseClient,
    configs: TableConfig[],
  ) {
    super(configs);
  }

  async sync(
    accountId: number,
    payload: SyncAccountContent,
  ): Promise<void> {
    const formatted = this.formatSyncPayload(payload);

    const { error } = await this.client.rpc(
      "sync_account_content",
      {
        p_account_id: accountId,
        p_data: formatted,
      },
    );

    if (error) {
      throw error;
    }
  }
}

export class PostgresSyncDao extends AccountSyncDao {
  constructor(
    private readonly client: Client,
    configs: TableConfig[],
  ) {
    super(configs);
  }

  async sync(
    accountId: number,
    payload: SyncAccountContent,
  ): Promise<void> {
    const formatted = this.formatSyncPayload(payload);

    await this.client.queryObject({
      text: `
        SELECT public.sync_account_content(
          $1,
          $2::jsonb
        );
      `,
      args: [
        accountId,
        JSON.stringify(formatted),
      ],
    });
  }
}

export function createSyncDao(
  client: Client | SupabaseClient,
  tableConfigs: Record<string, SyncTableConfig>,
): AccountSyncDao {
  if (client instanceof Client) {
    return new PostgresSyncDao(
      client,
      tableConfigs,
    );
  }

  return new SupabaseSyncDao(
    client as SupabaseClient,
    tableConfigs,
  );
}
