import { Entity, Field, Nullable, PrimaryKey } from "../../deps.ts";

@Entity("wine")
export class Wine {
  constructor(
    @PrimaryKey("SERIAL") public _id: number,
    @Field("INT", Nullable.NO, "account_id") public accountId: number,
    @Field("INT") public id: number,
    @Field("VARCHAR") public name: string,
    @Field("VARCHAR") public naming: string,
    @Field("VARCHAR") public color: string,
    @Field("VARCHAR") public cuvee: string,
    @Field("INT", Nullable.NO, "is_organic") public isOrganic: number,
    @Field("VARCHAR", Nullable.NO, "img_path") public imgPath: string,
    @Field("INT", Nullable.NO, "county_id") public countyId: number,
  ) {}
}
