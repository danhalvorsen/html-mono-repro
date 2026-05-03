// src/index.ts

import { DbscanEpsilonApp } from "./DbscanEpsilonApp.js";
import { DbscanEpsilonEstimator } from "./DbscanEpsilonEstimator.js";
import { PdfFragmentFileReader } from "./PdfFragmentFileReader.js";
import { DbScanner } from "./DbScanner.js";
import { WritePdf } from "./WritePdf.js";
 
const app = 
  new DbscanEpsilonApp(
    new PdfFragmentFileReader(),
     
    new DbscanEpsilonEstimator(),
    new DbScanner(),
    new WritePdf("C:\\Users\\danha\\source\\repos\\HTML\\MonoRepro\\packages\\core-pdf-reader\\tests\\PID\\PID.pdf")
  );

await app.run();