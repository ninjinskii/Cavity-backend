import { Application, Context, jwt, Transaction } from "../../deps.ts";
import Repository from "../db/repository.ts";
import { WineImageDTO } from "../model/wine-image.ts";
import { WineImage } from "../model/wine-image.ts";
import inAuthentication from "../util/authenticator.ts";
import Controller from "./controller.ts";

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
    const body = await ctx.body as WineImageDTO;
    const { wineId } = ctx.params;
    const safeWineId = parseInt(wineId);

    if (isNaN(safeWineId)) {
      return ctx.json({ message: this.translator.notFound }, 404);
    }

    await inAuthentication(ctx, this.jwtKey, this.translator, async (accountId) => {
      const wineImage = new WineImage(body, accountId, safeWineId);

      try {
        await this.repository.doInTransaction(
          `postWineImage-${1}`,
          async (t: Transaction) => {
            await this.repository.deleteByMutlipleCond(
              "wine_image",
              ["wine_id", "account_id"],
              [wineId, accountId.toString()],
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
    });
  }

  async handleGetWineImage(ctx: Context): Promise<void> {
    const { wineId } = ctx.params;
    const safeWineId = parseInt(wineId);

    if (isNaN(safeWineId)) {
      return ctx.json({ message: this.translator.notFound }, 404);
    }

    await inAuthentication(ctx, this.jwtKey, this.translator, async (accountId) => {
      try {
        const wineImage = await this.repository.selectBy(
          "wine_image",
          "account_id",
          accountId.toString(),
        );

        return ctx.json(wineImage);
      } catch (error) {
        console.log(error);
        return ctx.json({ message: this.translator.baseError }, 400);
      }
    });
  }

  async handleBottlePdfs(ctx: Context): Promise<void> {
  }
}
