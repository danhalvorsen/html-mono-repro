export interface IActionHandler<TData> {
  execute(data: TData): void | Promise<void>;
}
