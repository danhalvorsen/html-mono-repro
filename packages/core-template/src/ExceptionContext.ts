
export interface ExceptionContext {
  message: string;
  stack?: string;
  source?: string;
  [key: string]: any;
}
