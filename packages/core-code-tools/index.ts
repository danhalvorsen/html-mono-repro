export interface IPackageInfo {
    name: string;
    version: string;
    path: string;
    dependencies: Record<string, string>;
    devDependencies?: Record<string, string>;
    tsconfigPath?: string;
  }
  
  export interface IMonorepoTool {
    listPackages(): Promise<IPackageInfo[]>;
    getPackageByName(name: string): Promise<IPackageInfo | undefined>;
    validatePackages(): Promise<IMonorepoValidationResult[]>;
    findCircularDependencies(): Promise<string[][]>;
    updateDependencyVersion(pkgName: string, depName: string, version: string): Promise<void>;
  }

  export interface IMonorepoValidationResult {
    packageName: string;
    errors: string[];
    warnings?: string[];
  }