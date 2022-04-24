import { Application, Context, jwt, Transaction } from "../../deps.ts";
import Repository from "../db/repository.ts";
import { WineImageDTO } from "../model/wine-image.ts";
import { WineImage } from "../model/wine-image.ts";
import Controller from "./controller.ts";

// Refact: repository mutliple conditions handler (AND, OR), token recup dupplication. 
export default class FileController extends Controller {
  private jwtKey: CryptoKey;

  constructor(app: Application, repository: Repository, jwtKey: CryptoKey) {
    super(app, repository);
    this.jwtKey = jwtKey;
  }

  get wineImage() {
    return "/wine/:wineId/image";
  }

  get bottlePdf() {
    return "/bottle/:bottleId/pdf";
  }

  async handleRequests(): Promise<void> {
    this.app
      .post(
        this.wineImage,
        async (ctx: Context) => this.handlePostWineImage(ctx),
      )
      .get(this.wineImage, async (ctx: Context) => this.handleGetWineImage(ctx))
      .post(this.bottlePdf, async (ctx: Context) => this.handleBottlePdfs(ctx));
  }

  async handlePostWineImage(ctx: Context): Promise<void> {
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

      const body = await ctx.body as WineImageDTO;
      const { wineId } = ctx.params;
      const wineImage = new WineImage(body, accountId, parseInt(wineId));

      try {
        await this.repository.doInTransaction(
          `postWineImage-${1}`,
          async (t: Transaction) => {
            await this.repository.deleteByMutlipleCond(
              "wine_image",
              ["wine_id", "account_id"],
              [wineId, account_id],
              t,
            );
            await this.repository.insert("wine_image", [wineImage], t);
          },
        );
      } catch (error) {
        console.log(error);
        return ctx.json({ message: this.translator.baseError }, 400);
      }
      return ctx.json({ ok: true });
    } catch (error) {
      console.log(error);
      return ctx.json({ message: this.translator.unauthorized }, 401);
    }
  }

  async handleGetWineImage(ctx: Context): Promise<void> {
    const authorization = ctx.request.headers.get("Authorization");

    if (!authorization) {
      return ctx.json({ message: this.translator.unauthorized }, 401);
    }

    const [_, token] = authorization.split(" ");

    try {
      const { account_id } = await jwt.verify(token, this.jwtKey) as {
        account_id: string;
      };
      const { wineId } = ctx.params;

      try {
        const wineImage = await this.repository.selectBy(
          "wine_image",
          "account_id",
          account_id,
        );
        return ctx.json(wineImage);
      } catch (error) {
        console.log(error);
        return ctx.json({ message: this.translator.baseError }, 400);
      }
    } catch (error) {
      console.log(error);
      return ctx.json({ message: this.translator.baseError }, 400);
    }
  }

  async handleBottlePdfs(ctx: Context): Promise<void> {
  }
}
