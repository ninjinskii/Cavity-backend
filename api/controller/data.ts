import { Context, jwt } from "../../deps.ts";
import { County, CountyDTO } from "../model/county.ts";
import Controller from "./controller.ts";

export default class DataController extends Controller {
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
      return;
    }

    const [_, token] = authorization.split(" ");
    const payload = await jwt.verify(token, "");
    const countyDto = await ctx.body as CountyDTO;
    const county = new County(countyDto, 1);
  }
}
