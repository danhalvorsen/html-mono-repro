export interface IHttpPostingClient {
  postCommand<TResponse>(message: unknown): Promise<TResponse>;
  postQuery<TResponse>(message: unknown): Promise<TResponse>;
}