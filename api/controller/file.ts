import { Application, Context, Transaction } from "../../deps.ts";
import Repository from "../db/repository.ts";
import { BottlePdf, BottlePdfDTO } from "../model/bottle-pdf.ts";
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
      .post(this.wineImage, async (ctx: Context) => this.postWineImage(ctx))
      .get(this.wineImage, async (ctx: Context) => this.getWineImage(ctx))
      .post(this.bottlePdf, async (ctx: Context) => this.postBottlePdf(ctx))
      .get(this.bottlePdf, async (ctx: Context) => this.getBottlePdf(ctx));
  }

  async postWineImage(ctx: Context): Promise<void> {
    const body = await ctx.body as WineImageDTO;
    const { wineId } = ctx.params;
    const safeWineId = parseInt(wineId);

    if (isNaN(safeWineId)) {
      return ctx.json({ message: this.$t.notFound }, 404);
    }

    await inAuthentication(ctx, this.jwtKey, this.$t, async (accountId) => {
      const wineImage = new WineImage(body, accountId, safeWineId);

      try {
        await this.repository.doInTransaction(
          `postWineImage-${accountId}`,
          async (t: Transaction) => {
            await this.repository.delete(
              "wine_image",
              [
                { where: "wine_id", equals: wineId },
                { where: "account_id", equals: accountId.toString() },
              ],
              t,
            );
            await this.repository.insert("wine_image", [wineImage], t);
          },
        );
        return ctx.json({ ok: true });
      } catch (error) {
        console.log(error);
        return ctx.json({ message: this.$t.baseError }, 400);
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
        const wineImage = await this.repository.select<WineImage>(
          "wine_image",
          [
            { where: "wine_id", equals: wineId },
            { where: "account_id", equals: accountId.toString() },
          ],
        );
        const wineImageDto = WineImage.toDTO(wineImage[0]);

        return ctx.json(wineImageDto);
      } catch (error) {
        console.log(error);
        return ctx.json({ message: this.$t.baseError }, 400);
      }
    });
  }

  async postBottlePdf(ctx: Context): Promise<void> {
    const body = await ctx.body as BottlePdfDTO;
    const { bottleId } = ctx.params;
    const safeBottleId = parseInt(bottleId);

    if (isNaN(safeBottleId)) {
      return ctx.json({ message: this.$t.notFound }, 404);
    }

    await inAuthentication(ctx, this.jwtKey, this.$t, async (accountId) => {
      const bottlePdf = new BottlePdf(body, accountId, safeBottleId);

      try {
        await this.repository.doInTransaction(
          `postBottlePdf-${accountId}`,
          async (t: Transaction) => {
            await this.repository.delete(
              "bottle_pdf",
              [
                { where: "bottle_id", equals: bottleId },
                { where: "account_id", equals: accountId.toString() },
              ],
              t,
            );
            await this.repository.insert("bottle_pdf", [bottlePdf], t);
          },
        );
        return ctx.json({ ok: true });
      } catch (error) {
        console.log(error);
        return ctx.json({ message: this.$t.baseError }, 400);
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
        const wineImage = await this.repository.select<BottlePdf>(
          "bottle_pdf",
          [
            { where: "bottle_id", equals: bottleId },
            { where: "account_id", equals: accountId.toString() },
          ],
        );
        const bottlePdfDto = BottlePdf.toDTO(wineImage[0]);

        return ctx.json(bottlePdfDto);
      } catch (error) {
        console.log(error);
        return ctx.json({ message: this.$t.baseError }, 400);
      }
    });
  }
}
