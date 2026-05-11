import {
  BlaQuery,
  type BlaQueryError,
  type BlaQueryMessage,
  type BlaQueryResult,
  FooCommand,
  type FooCommandError,
  type FooCommandMessage,
  type FooCommandResult,
} from "@monorepo/core-ioc-inversify-sample-objects";
import type {
  Result,
} from "@monorepo/core-design-patterns";
import { CreateSampleIocCqrsServiceProvider } from "./CreateSampleIocCqrsServiceProvider.js";

export type SampleDispatchResult = Readonly<{
  readonly foo: Result<FooCommandResult, FooCommandError>;
  readonly bla: Result<BlaQueryResult, BlaQueryError>;
}>;

export async function RunSample(): Promise<SampleDispatchResult> {
  const ioc = CreateSampleIocCqrsServiceProvider();

  const foo = await ioc.DispatchCommand<
    FooCommandMessage,
    FooCommandResult,
    FooCommandError
  >(new FooCommand(41));

  const bla = await ioc.DispatchQuery<
    BlaQueryMessage,
    BlaQueryResult,
    BlaQueryError
  >(new BlaQuery("bla"));

  return Object.freeze({
    foo,
    bla,
  });
}