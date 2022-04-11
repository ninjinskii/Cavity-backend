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
      .post(this.county, async (ctx: Context) => this.postCounties(ctx))
      .get(this.county, async (ctx: Context) => this.getCounties(ctx));
  }

  async postCounties(ctx: Context): Promise<void> {
    const authorization = ctx.request.headers.get("Authorization");

    if (!authorization) {
      return ctx.json({ message: this.translator.unauthorized }, 401);
    }

    const [_, token] = authorization.split(" ");

    try {
      const { account_id } = await jwt.verify(token, this.jwtKey) as {
        account_id: string;
      };

      const countiesDto = await ctx.body as Array<CountyDTO>;

      if (!(countiesDto instanceof Array)) {
        return ctx.json({ message: this.translator.missingParameters }, 400);
      }

      const counties = countiesDto.map((countyDto) =>
        new County(countyDto, parseInt(account_id))
      );

      try {
        this.repository.insertMany("county", counties);
        return ctx.json({ ok: true });
      } catch (error) {
        console.warn("Unable to insert counties");
      }
    } catch (error) {
      console.log(error);
      return ctx.json({ message: this.translator.unauthorized }, 401);
    }
  }

  async getCounties(ctx: Context): Promise<void> {
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
        const counties = await this.repository.selectBy<County>(
          "county",
          "account_id",
          account_id,
        );

        const countiesDto = counties.map((county) => County.toDTO(county));

        ctx.json(countiesDto);
      } catch (error) {
        console.warn("Unable to get counties");
      }
    } catch (error) {
      return ctx.json({ message: this.translator.unauthorized }, 401);
    }
  }
}
