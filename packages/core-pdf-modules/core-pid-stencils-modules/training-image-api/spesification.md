# Test data 

Given a set  of svg files with naming convention of {category}-{item-name}.svg 
When execute 
Then it should create a folder structure of {category}/{item-name} and place the svg file in the correct folder.
And it should create  set of svg files that is rotated by a given configuration angle, e.g angle 36 degrees should generate 10 svg files with the same name as the original file but with a suffix of the angle, e.g {item-name}-36.svg, {item-name}-72.svg, etc. in the same folder as the original file.   
This should be repeated for following file formats: svg, png, jpg, pdf. So for each original file it should generate 4 files with the same name but different formats in the same folder as the original file. 

Note:  The result will be a folder structure: 
- category1
  - item-name1
    - item-name1.svg
    - item-name1-36.svg
    - item-name1-72.svg
    - item-name1-108.svg
    - item-name1-144.svg
    - item-name1-180.svg
    - item-name1-216.svg
    - item-name1-252.svg
    - item-name1-288.svg
    - item-name1-324.svg
    - item-name1.png
    - item-name1-36.png
    - item-name1-72.png
    - item-name1-108.png    
    - item-name1-144.png
    - item-name1-180.png    
    - item-name1-216.png        
    - item-name1-252.png        
    - item-name1-288.png    
    - item-name1-324.png            
    - item-name1.pdf
    - item-name1-36.pdf
    ..

The application should be able to add noice into the svg or the raster graphics for simulating real world conditions and make the data more robust for training the AI. The noise can be added in different ways, such as adding random lines, shapes, or colors to the image, or by applying filters to the image to create a distorted version of the original image. This will help the AI to learn how to recognize the objects in different conditions and make it more robust for real-world applications.    

The application should support IRasterGraphicsNoice strategy pattern and the strategy loading should be a part of a json configuration file that can be easily modified to add new strategies or change the existing ones. The application should also support a command line interface for easy execution and integration into a larger pipeline. The configuration file should support:
- path to the source svg files. The files can be organized in a flat structure or in a nested structure, the application should be able to handle both cases and create the correct folder structure for the output files.  
- support for the different output formats and the ability to specify which formats to generate for each input file. (we starting with png only and then we can add support for other formats
- the angles for rotation and the number of rotated images to generate for each input file. 
- the paths to the noise strategies and the parameters for each strategy and name of the strategy to be used for each input file. The strategy should contain a mainifest file that describes the strategy and its parameters, and the application should be able to load the strategy and apply it to the images as specified in the configuration file.   

In addtion to create raster graphics, the application should generate different variance of resolution for the raster graphics, such as low resolution and high resolution images. This will help the AI to learn how to recognize the objects in different resolutions and make it more robust for real-world applications. The application should support a configuration option for specifying the different resolutions to generate for each input file, and the application should be able to generate the different resolution images based on the original svg file. (256x256, 512x512, 1024x1024, etc. Note: is note necessary that the ratio of the image is equal e.g 256x256, the application should be agnostic to that and should be able to generate different resolution images based on the original svg file, regardless of the aspect ratio of the original file. The application should also support a configuration option for specifying the different resolutions to generate for each input file, and the application should be able to generate the different resolution images based on the original svg file.           )
The application here will be a web api server that: 
- listen for command and queries using C:\Users\danha\source\repos\HTML\MonoRepro\packages\core-design-patterns-cqrs-no-json
- using express.js for the web server and routing   
- apis:
    - GET svgs: return a list of all the svg files in the source folder and their metdata (category, item-name, path, etc.)    
    - POST generate: trigger the generation of the rotated and noised images based on the configuration file. The request body should contain the configuration for the generation process, including the paths to the source files, the output formats, the angles for rotation, and the noise strategies to be applied. The response should indicate the status of the generation process and any errors that may have occurred.  
    - Get status: return the status of the generation process, including the number of files generated, the number of errors, and any other relevant information. This can be used to monitor the progress of the generation process and to troubleshoot any issues that may arise.

Note: The data will be use to train a AI for images recognition 

Modules: 
https://www.npmjs.com/package/dom-to-image

````md
# Image Dataset Generation Specification

## 1. Purpose

The application generates structured image datasets from source SVG files.

The generated dataset is intended for training image-recognition models. The output must be deterministic, configurable, extensible, and suitable for automated pipelines.

---

## 2. Input File Convention

### 2.1 Source file pattern

Each source SVG file must follow this naming convention:

```text
{category}-{itemName}.svg
````

Example:

```text
valves-ball-valve.svg
```

Parsed metadata:

```text
category = valves
itemName = ball-valve
```

The first `-` separates the category from the item name. Additional `-` characters belong to the item name.

---

## 3. Source Folder Structure

The source folder may be:

### Flat

```text
source/
  valves-ball-valve.svg
  pumps-centrifugal-pump.svg
```

### Nested

```text
source/
  valves/
    valves-ball-valve.svg
  pumps/
    pumps-centrifugal-pump.svg
```

The application must scan recursively and discover all `.svg` files.

The category must always be parsed from the file name, not from the folder name.

---

## 4. Output Folder Structure

For each source SVG, the application must create this output structure:

```text
{outputRoot}/{category}/{itemName}/
```

Example:

```text
output/
  valves/
    ball-valve/
```

---

## 5. Generic Output File Syntax

Generated files must use the following naming syntax:

```text
{itemName}{rotationSuffix}{resolutionSuffix}{noiseSuffix}.{format}
```

### 5.1 Rotation suffix

```text
rotationSuffix = ""                  when angle = 0
rotationSuffix = "-{angle}"          when angle > 0
```

Examples:

```text
ball-valve.svg
ball-valve-36.svg
ball-valve-72.svg
```

### 5.2 Resolution suffix

Resolution suffix applies only to raster formats.

```text
resolutionSuffix = ""                        when default resolution is used
resolutionSuffix = "-{width}x{height}"        when explicit resolution is used
```

Examples:

```text
ball-valve-512x512.png
ball-valve-36-1024x1024.png
```

### 5.3 Noise suffix

```text
noiseSuffix = ""                    when no noise is applied
noiseSuffix = "-{noiseName}"        when a noise strategy is applied
```

Examples:

```text
ball-valve-36-512x512-random-lines.png
ball-valve-36-512x512-color-jitter.png
```

---

## 6. Rotation Rules

The generator must support rotation by configuration.

Example:

```json
{
  "rotation": {
    "stepDegrees": 36,
    "includeOriginal": true
  }
}
```

For `stepDegrees = 36`, the generated angles are:

```text
0, 36, 72, 108, 144, 180, 216, 252, 288, 324
```

The application must not generate `360`, because it is equivalent to `0`.

Generic rule:

```text
angles = [0, stepDegrees, stepDegrees * 2, ... < 360]
```

---

## 7. Output Formats

The system must support multiple output formats through an extensible format exporter abstraction.

Initial supported format:

```text
png
```

Planned extension formats:

```text
svg
jpg
pdf
```

The configuration must allow selecting output formats per generation run.

Example:

```json
{
  "formats": ["png"]
}
```

Future example:

```json
{
  "formats": ["svg", "png", "jpg", "pdf"]
}
```

---

## 8. Raster Resolution Variants

The application must support multiple raster output resolutions.

Example:

```json
{
  "rasterResolutions": [
    { "width": 256, "height": 256 },
    { "width": 512, "height": 512 },
    { "width": 1024, "height": 1024 }
  ]
}
```

The renderer must not assume a square aspect ratio.

Valid examples:

```json
{ "width": 512, "height": 512 }
{ "width": 1024, "height": 768 }
{ "width": 640, "height": 480 }
```

The SVG source must remain the canonical input for all raster resolutions.

---

## 9. Noise Generation

The application must support configurable noise strategies to improve dataset robustness.

Noise may include:

```text
random lines
random shapes
color jitter
blur
distortion
opacity changes
background variation
filter effects
```

Noise strategies must be loaded from configuration.

The application must support a strategy interface:

```ts
export interface IRasterGraphicsNoiseStrategy {
  readonly name: string;

  apply(
    input: RasterGraphicsNoiseInput,
    parameters: Readonly<Record<string, unknown>>
  ): Promise<RasterGraphicsNoiseResult>;
}
```

Recommended spelling:

```text
Noise
```

Do not use:

```text
Noice
```

---

## 10. Noise Strategy Manifest

Each noise strategy must provide a manifest file.

Generic manifest syntax:

```json
{
  "name": "random-lines",
  "version": "1.0.0",
  "description": "Adds random lines to raster images.",
  "entryPoint": "./RandomLinesNoiseStrategy.js",
  "parameters": {
    "lineCount": {
      "type": "number",
      "required": true,
      "default": 10
    },
    "maxOpacity": {
      "type": "number",
      "required": false,
      "default": 0.35
    }
  }
}
```

---

## 11. Generation Configuration

Generic configuration syntax:

```json
{
  "sourceRoot": "./data/source",
  "outputRoot": "./data/generated",

  "formats": ["png"],

  "rotation": {
    "stepDegrees": 36,
    "includeOriginal": true
  },

  "rasterResolutions": [
    { "width": 256, "height": 256 },
    { "width": 512, "height": 512 },
    { "width": 1024, "height": 1024 }
  ],

  "noise": {
    "enabled": true,
    "strategies": [
      {
        "name": "random-lines",
        "manifestPath": "./noise/random-lines/manifest.json",
        "parameters": {
          "lineCount": 12,
          "maxOpacity": 0.25
        }
      }
    ]
  }
}
```

---

## 12. Example Output

Given source file:

```text
source/valves-ball-valve.svg
```

And configuration:

```json
{
  "formats": ["png"],
  "rotation": {
    "stepDegrees": 36,
    "includeOriginal": true
  },
  "rasterResolutions": [
    { "width": 512, "height": 512 }
  ]
}
```

Expected output:

```text
output/
  valves/
    ball-valve/
      ball-valve-512x512.png
      ball-valve-36-512x512.png
      ball-valve-72-512x512.png
      ball-valve-108-512x512.png
      ball-valve-144-512x512.png
      ball-valve-180-512x512.png
      ball-valve-216-512x512.png
      ball-valve-252-512x512.png
      ball-valve-288-512x512.png
      ball-valve-324-512x512.png
```

Future multi-format example:

```text
output/
  valves/
    ball-valve/
      ball-valve.svg
      ball-valve-36.svg
      ball-valve.png
      ball-valve-36.png
      ball-valve.jpg
      ball-valve-36.jpg
      ball-valve.pdf
      ball-valve-36.pdf
```

---

## 13. Web API Server

The application must expose an Express.js Web API.

The API must use the CQRS package:

```text
C:\Users\danha\source\repos\HTML\MonoRepro\packages\core-design-patterns-cqrs-no-json
```

The API must expose commands and queries through explicit request handlers.

---

## 14. API Endpoints

### 14.1 List SVG files

```http
GET /svgs
```

Returns discovered source SVG files and parsed metadata.

Response syntax:

```json
{
  "items": [
    {
      "category": "valves",
      "itemName": "ball-valve",
      "fileName": "valves-ball-valve.svg",
      "sourcePath": "./data/source/valves-ball-valve.svg"
    }
  ]
}
```

---

### 14.2 Generate dataset

```http
POST /generate
```

Triggers generation based on request configuration.

Request body:

```json
{
  "sourceRoot": "./data/source",
  "outputRoot": "./data/generated",
  "formats": ["png"],
  "rotation": {
    "stepDegrees": 36,
    "includeOriginal": true
  },
  "rasterResolutions": [
    { "width": 512, "height": 512 }
  ],
  "noise": {
    "enabled": false,
    "strategies": []
  }
}
```

Response:

```json
{
  "generationId": "2026-05-07T10-30-00Z",
  "status": "accepted"
}
```

---

### 14.3 Get generation status

```http
GET /status/{generationId}
```

Response:

```json
{
  "generationId": "2026-05-07T10-30-00Z",
  "status": "completed",
  "sourceFilesFound": 24,
  "filesGenerated": 240,
  "errors": []
}
```

Valid status values:

```text
accepted
running
completed
failed
partially-completed
```

---

## 15. CLI Support

The application must support command-line execution for pipeline integration.

Generic syntax:

```bash
image-dataset-generator generate --config ./generator.config.json
```

Optional syntax:

```bash
image-dataset-generator list --source ./data/source
image-dataset-generator status --generation-id 2026-05-07T10-30-00Z
```

---

## 16. Rendering Adapter

Image rendering must be abstracted behind an interface.

```ts
export interface IGraphicsRenderer {
  render(request: GraphicsRenderRequest): Promise<GraphicsRenderResult>;
}
```

The concrete renderer may use browser-based or server-side rendering.

`dom-to-image` may be used only behind this abstraction. The application core must not depend directly on `dom-to-image`.

---

## 17. Required Architecture

The application must be organized around explicit abstractions:

```text
ISvgSourceScanner
ISvgMetadataParser
IOutputPathFactory
IGraphicsRenderer
IOutputFormatExporter
IRasterGraphicsNoiseStrategy
INoiseStrategyLoader
IGenerationCommandHandler
IGenerationStatusQueryHandler
```

The application must support extension by adding new implementations, not by modifying core orchestration logic.

---

## 18. Validation Rules

The application must validate:

```text
sourceRoot exists
outputRoot is writable
source files match {category}-{itemName}.svg
rotation.stepDegrees > 0
rotation.stepDegrees < 360
360 % rotation.stepDegrees == 0
formats are supported
raster resolutions have width > 0 and height > 0
noise manifests exist when noise is enabled
noise strategy parameters match the manifest
```

Invalid input must produce structured errors.

Example:

```json
{
  "code": "InvalidSourceFileName",
  "message": "Source file does not match {category}-{itemName}.svg.",
  "path": "./data/source/invalid.svg"
}
```

---

## 19. Determinism

Dataset generation must be deterministic when the same configuration is used.

Noise strategies that use randomness must support an explicit seed.

Example:

```json
{
  "noise": {
    "enabled": true,
    "seed": 12345,
    "strategies": []
  }
}
```

---

## 20. Acceptance Criteria

### AC-001 — Source discovery

Given a source folder with flat or nested SVG files
When `/svgs` is called
Then all valid SVG files are returned with parsed metadata.

### AC-002 — Output folder structure

Given `valves-ball-valve.svg`
When generation runs
Then the output folder must be:

```text
{outputRoot}/valves/ball-valve/
```

### AC-003 — Rotation generation

Given `stepDegrees = 36`
When generation runs
Then the generated angles must be:

```text
0, 36, 72, 108, 144, 180, 216, 252, 288, 324
```

### AC-004 — Raster generation

Given format `png` and resolution `512x512`
When generation runs
Then one PNG must be generated for each configured rotation angle.

### AC-005 — Noise strategy loading

Given a configured noise strategy manifest
When generation runs
Then the strategy must be loaded and applied using its configured parameters.

### AC-006 — Status query

Given a running or completed generation
When `/status/{generationId}` is called
Then the response must contain status, generated file count, source file count, and errors.

---

## 21. Phase Scope

### Phase 1

```text
SVG source discovery
metadata parsing
folder generation
PNG export
rotation generation
resolution variants
Express API
CQRS command/query integration
basic status tracking
```

### Phase 2

```text
noise strategy loading
noise manifest validation
seeded deterministic noise
CLI integration
```

### Phase 3

```text
SVG output variants
JPG output
PDF output
advanced dataset metadata export
```

```
```
