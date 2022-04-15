import { Application, Context, jwt } from "../../deps.ts";
import { County } from "../model/county.ts";
import Repository from "../db/repository.ts";
import Controller from "./controller.ts";

export default class DataController extends Controller {
  private jwtKey: CryptoKey;

  constructor(app: Application, repository: Repository, jwtKey: CryptoKey) {
    super(app, repository);
    this.jwtKey = jwtKey;
  }

  handleRequests(): void {
    for (const path of Object.keys(mapper)) {
      this.app.post(path, (ctx: Context) => this.handlePost(ctx))
      this.app.get(path, (ctx: Context) => this.handleGet(ctx))
    }
  }

  async handlePost(ctx: Context): Promise<void> {
    const authorization = ctx.request.headers.get("Authorization");

    if (!authorization) {
      return ctx.json({ message: this.translator.unauthorized }, 401);
    }

    const [_, token] = authorization.split(" ");

    try {
      const { account_id } = await jwt.verify(token, this.jwtKey) as {
        account_id: string;
      };
      const accountId = parseInt(account_id);

      const dtoList = await ctx.body;

      if (!(dtoList instanceof Array)) {
        return ctx.json({ message: this.translator.missingParameters }, 400);
      }

      const objects = dtoList.map((dto) =>
        mapper[ctx.path].fromDTO(dto, accountId)
      );

      try {
        await this.repository.insertMany(mapper[ctx.path].table, objects);
        // await this.repository.doInTransaction(
        //   `postCounty-${account_id}`,
        //   async () => {
        //     //await this.repository.deleteBy("county", "account_id", account_id);
        //   },
        // );
        return ctx.json({ ok: true });
      } catch (error) {
        console.warn("Unable to insert objects");
        // error 400
      }
    } catch (error) {
      return ctx.json({ message: this.translator.unauthorized }, 401);
    }
  }

  async handleGet(ctx: Context): Promise<void> {
    const authorization = ctx.request.headers.get("Authorization");

    if (!authorization) {
      return ctx.json({ message: this.translator.unauthorized }, 401);
    }

    const [_, token] = authorization.split(" ");

    try {
      const { account_id } = await jwt.verify(token, this.jwtKey) as {
        account_id: string;
      };

      try {
        const objects = await this.repository.selectBy(
          mapper[ctx.path].table,
          "account_id",
          account_id,
        );

        const dtoList = objects.map((object) => mapper[ctx.path].toDTO(object));

        return ctx.json(dtoList);
      } catch (error) {
        console.log(error);
        console.warn("Unable to get counties");
      }
    } catch (error) {
      return ctx.json({ message: this.translator.unauthorized }, 401);
    }
  }
}

// Can replace these two pieces by splitting up this controller by data object
// and add a super class that require a table name and a function to transform
// their objects to DTOs.
interface PathMapper {
  [path: string]: {
    table: string;
    toDTO: (object: any) => any;
    fromDTO: (dto: any, account_id: number) => any;
  };
}

const mapper: PathMapper = {
  "/county": {
    table: "county",
    toDTO: County.toDTO,
    fromDTO: (dto, accountId) => new County(dto, accountId),
  },
};
