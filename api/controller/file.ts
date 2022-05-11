import { Application, Context, Transaction } from "../../deps.ts";
import Repository from "../db/repository.ts";
import { BottlePdf } from "../model/bottle-pdf.ts";
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
      .post(this.wineImage, async (ctx: Context) => this.postWineImage(ctx))
      .get(this.wineImage, async (ctx: Context) => this.getWineImage(ctx))
      .post(this.bottlePdf, async (ctx: Context) => this.postBottlePdf(ctx))
      .get(this.bottlePdf, async (ctx: Context) => this.getBottlePdf(ctx));
  }

  async postWineImage(ctx: Context): Promise<void> {
    const { wineId } = ctx.params;
    const safeWineId = parseInt(wineId);

    if (isNaN(safeWineId)) {
      return ctx.json({ message: this.$t.notFound }, 404);
    }

    const wineImage: any = await ctx.body;

    await inAuthentication(ctx, this.jwtKey, this.$t, async (accountId) => {
      wineImage.accountId = accountId
      wineImage.wineId = safeWineId

      try {
        await this.repository.doInTransaction(async () => {
          await WineImage
            .where("wineId", wineId)
            .where("account_id", accountId)
            .delete();

          await WineImage
            .create(wineImage);
        });
        return ctx.json({ ok: true });
      } catch (error) {
        console.log(error);
        return ctx.json({ message: this.$t.baseError }, 500);
      }
    });
  }

  async getWineImage(ctx: Context): Promise<void> {
    const { wineId } = ctx.params;
    const safeWineId = parseInt(wineId);

    if (isNaN(safeWineId)) {
      return ctx.json({ message: this.$t.notFound }, 404);
    }

    await inAuthentication(ctx, this.jwtKey, this.$t, async (accountId) => {
      try {
        const wineImage = await WineImage
          .where("wineId", wineId)
          .where("accountId", accountId)
          .get();

        return ctx.json(wineImage);
      } catch (error) {
        console.log(error);
        return ctx.json({ message: this.$t.baseError }, 500);
      }
    });
  }

  async postBottlePdf(ctx: Context): Promise<void> {
    const { bottleId } = ctx.params;
    const safeBotleId = parseInt(bottleId);

    if (isNaN(safeBotleId)) {
      return ctx.json({ message: this.$t.notFound }, 404);
    }

    const bottlePdf: any = await ctx.body;
    
    await inAuthentication(ctx, this.jwtKey, this.$t, async (accountId) => {
      bottlePdf.accountId = accountId
      bottlePdf.bottleId = safeBotleId

      try {
        await this.repository.doInTransaction(async () => {
          await BottlePdf
            .where("bottleId", bottleId)
            .where("account_id", accountId)
            .delete();

          await BottlePdf
            .create(bottlePdf);
        });
        return ctx.json({ ok: true });
      } catch (error) {
        console.log(error);
        return ctx.json({ message: this.$t.baseError }, 500);
      }
    });
  }

  async getBottlePdf(ctx: Context): Promise<void> {
    const { bottleId } = ctx.params;
    const safeBottleId = parseInt(bottleId);

    if (isNaN(safeBottleId)) {
      return ctx.json({ message: this.$t.notFound }, 404);
    }

    await inAuthentication(ctx, this.jwtKey, this.$t, async (accountId) => {
      try {
        const bottlePdf = await BottlePdf
          .where("bottleId", bottleId)
          .where("accountId", accountId)
          .get();

        return ctx.json(bottlePdf);
      } catch (error) {
        console.log(error);
        return ctx.json({ message: this.$t.baseError }, 500);
      }
    });
  }
}
