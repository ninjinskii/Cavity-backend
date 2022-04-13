export default abstract class PersistableUserData {
  abstract tableName: string;
  abstract account_id: number;
  abstract toDTO(): any;
}
