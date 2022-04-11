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
      .post(this.county, async (ctx: Context) => this.postCounty(ctx))
      .get(this.county, async (ctx: Context) => this.getCounties(ctx))
      .get(`${this.county}/:id`, async (ctx: Context) => this.getCounty(ctx));
  }

  async postCounty(ctx: Context): Promise<void> {
    const authorization = ctx.request.headers.get("Authorization");

    if (!authorization) {
      return ctx.json({ message: this.translator.unauthorized }, 401);
    }

    const [_, token] = authorization.split(" ");
    const { account_id } = await jwt.verify(token, this.jwtKey);
    const countyDto = await ctx.body as CountyDTO;
    const county = new County(countyDto, account_id);
  }

  getCounties(ctx: Context): void {
  }

  getCounty(ctx: Context): void {
  }
}
