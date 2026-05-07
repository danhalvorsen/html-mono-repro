import { JsonMessageReferenceResolver } from "./config/JsonMessageReferenceResolver.js";
import { PostingConfigurationReader } from "./config/PostingConfigurationReader.js";
import {
  ConsoleWriter,
  PostingCliApplication,
} from "./cli/PostingCliApplication.js";
import { PostingCliArgumentsParser } from "./cli/PostingCliArguments.js";
import { FileJsonMessageReader } from "./cli/FileJsonMessageReader.js";

try {
  const argumentsModel = new PostingCliArgumentsParser()
    .parse(process.argv.slice(2));

  await new PostingCliApplication(
    new FileJsonMessageReader(),
    new PostingConfigurationReader(),
    new JsonMessageReferenceResolver(),
    new ConsoleWriter(),
  ).execute(argumentsModel);
}
catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}