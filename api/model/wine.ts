export class Wine {
  _id!: number;
  account_id: number;
  id: number;
  name: string;
  naming: string;
  color: string;
  cuvee: string;
  is_organic: number;
  img_path: string;
  county_id: number;

  constructor(wine: WineDTO, account_id: number) {
    this.account_id = account_id;
    this.id = wine.id;
    this.name = wine.name;
    this.naming = wine.naming;
    this.color = wine.color;
    this.cuvee = wine.cuvee;
    this.is_organic = wine.isOrganic
    this.img_path = wine.imgPath;
    this.county_id = wine.countyId;
  }

  static toDTO(wine: Wine): WineDTO {
    return {
      id: wine.id,
      name: wine.name,
      naming: wine.naming,
      color: wine.color,
      cuvee: wine.cuvee,
      isOrganic: wine.is_organic,
      imgPath: wine.img_path,
      countyId: wine.county_id,
    };
  }
}

export interface WineDTO {
  id: number;
  name: string;
  naming: string;
  color: string;
  cuvee: string;
  isOrganic: number;
  imgPath: string;
  countyId: number;
}
