export interface TableConfig {
  route: string;
  table: string;
  ignoredFields?: string[];
}

export const dataTables: TableConfig[] = [
  {
    route: "/county",
    table: "county",
  },
  {
    route: "/wine",
    table: "wine",
  },
  {
    route: "/bottle",
    table: "bottle",
  },
  {
    route: "/friend",
    table: "friend",
  },
  {
    route: "/grape",
    table: "grape",
  },
  {
    route: "/review",
    table: "review",
  },
  {
    route: "/qgrape",
    table: "q_grape",
  },
  {
    route: "/freview",
    table: "f_review",
  },
  {
    route: "/history",
    table: "history_entry",
  },
  {
    route: "/tasting",
    table: "tasting",
  },
  {
    route: "/tag",
    table: "tag",
    ignoredFields: ["selected"],
  },
  {
    route: "/tasting-action",
    table: "tasting_action",
  },
  {
    route: "/history-x-friend",
    table: "history_x_friend",
  },
  {
    route: "/tasting-x-friend",
    table: "tasting_x_friend",
  },
  {
    route: "/tag-x-bottle",
    table: "tag_x_bottle",
    ignoredFields: ["selected"],
  },
];

export const syncTableMap = Object.fromEntries(
  dataTables.map((config) => [
    config.route.replace("/", ""),
    config.table,
  ]),
);
