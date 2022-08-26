import { Entity, Field, Nullable, PrimaryKey } from "../../deps.ts";

@Entity("bottle")
export class Bottle {
  constructor(
    @PrimaryKey("SERIAL") public _id: number,
    @Field("INT", Nullable.NO, "account_id") public accountId: number,
    @Field("INT") public id: number,
    @Field("INT", Nullable.NO, "wine_id") public wineId: number,
    @Field("INT") public vintage: number,
    @Field("INT") public apogee: number,
    @Field("INT", Nullable.NO, "is_favorite") public isFavorite: number,
    @Field("INT") public price: number,
    @Field("VARCHAR") public currency: string,
    @Field("VARCHAR", Nullable.NO, "other_info") public otherInfo: string,
    @Field("VARCHAR", Nullable.NO, "buy_location") public buyLocation: string,
    @Field("BIGINT", Nullable.NO, "buy_date") public buyDate: number,
    @Field(
      "VARCHAR",
      Nullable.NO,
      "tasting_taste_comment",
    ) public tastingTasteComment: string,
    @Field("VARCHAR", Nullable.NO, "bottle_size") public bottleSize: string,
    @Field("INT") public consumed: number,
    @Field("INT", Nullable.YES, "tasting_id") public tastingId: number | null,
    @Field("BOOL", Nullable.NO, "is_selected") public isSelected: boolean,
    @Field("VARCHAR", Nullable.NO, "pdf_path") public pdfPath: string,
  ) {
  }
}
