import { Application, Context, jwt } from "../../deps.ts";
import { County, CountyDTO } from "../model/county.ts";
import Repository from "../repository.ts";
import Controller from "./controller.ts";

export default class DataController extends Controller {
  private jwtKey: CryptoKey;

  constructor(app: Application, repository: Repository, jwtKey: CryptoKey) {
    super(app, repository);
    this.jwtKey = jwtKey;
  }

  get county() {
    return "/county";
  }

  handleRequests(): void {
    this.app
      .post(
        this.county,
        async (ctx: Context) => this.genericPost(ctx, "county", "County"),
      )
      .get(
        this.county,
        async (ctx: Context) => this.genericGet(ctx, "county", "County"),
      );
  }

  async genericPost(
    ctx: Context,
    tableName: string,
    className: string,
  ): Promise<void> {
    const authorization = ctx.request.headers.get("Authorization");

    if (!authorization) {
      return ctx.json({ message: this.translator.unauthorized }, 401);
    }

    const [_, token] = authorization.split(" ");

    try {
      const { account_id } = await jwt.verify(token, this.jwtKey) as {
        account_id: string;
      };

      const dtoList = await ctx.body;

      if (!(dtoList instanceof Array)) {
        return ctx.json({ message: this.translator.missingParameters }, 400);
      }

      // Need to validate so called unused import
      County

      const objects = dtoList.map((countyDto) =>
        eval("new " + className + ` (countyDto, account_id)`)
      );

      try {
        await this.repository.insertMany(tableName, objects);
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
      console.log(error);
      return ctx.json({ message: this.translator.unauthorized }, 401);
    }
  }

  async genericGet<T>(
    ctx: Context,
    tableName: string,
    className: string,
  ): Promise<void> {
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
        const objects = await this.repository.selectBy<T>(
          tableName,
          "account_id",
          account_id,
        );

        County

        const dtoList = objects.map((dto) => eval(`${className}.toDTO(dto)`));
        console.log(dtoList);

        ctx.json(dtoList);
      } catch (error) {
        console.log(error);
        console.warn("Unable to get counties");
      }
    } catch (error) {
      return ctx.json({ message: this.translator.unauthorized }, 401);
    }
  }
}
