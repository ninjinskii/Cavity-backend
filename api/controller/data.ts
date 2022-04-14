import { Application, Context, jwt } from "../../deps.ts";
import { County } from "../model/county.ts";
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
      // .post(
      //   this.county,
      //   async (ctx: Context) => this.genericPost(ctx, "county", "County"),
      // )
      .get(this.county, (ctx: Context) => this.handleGet(ctx));
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

// Can replace these two interfaces by splitting up this controller by data object
// and add a super class that require a table name and a function to transform
// their objects to DTOs.
interface PathMapper {
  [path: string]: { table: string; toDTO: (object: any) => any };
}

const mapper: PathMapper = {
  "/county": { table: "county", toDTO: County.toDTO },
};
