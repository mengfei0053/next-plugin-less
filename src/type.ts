import { NextConfig } from 'next/dist/next-server/server/config';

export type CssModuleTypes = 'local' | 'global' | 'pure';

export interface WithLessOptions extends Partial<NextConfig> {
    libsStyleRegExp?: RegExp;
    /**
     * { '@primary-color': '#04f' }
     */
    modifyVars?: {
        [K: string]: string | number;
    };
    lessVarsFilePath?: string;
    lessVarsFilePathAppendToEndOfContent?: boolean;
    cssLoaderOptions?: Partial<{
        esModule: boolean;
        import: boolean | ((url: string, media: string, resourcePath: string) => boolean);
        modules: Partial<{
            compileType: 'module' | 'icss';
            mode: CssModuleTypes | ((resourcePath: string) => CssModuleTypes),
            auto: boolean | RegExp | ((resourcePath: string) => boolean),
            exportGlobals: boolean,
            localIdentName: string;
            localIdentContext: string;
            localIdentHashPrefix: string
            namedExport: boolean,
            exportLocalsConvention: 'camelCase' | 'asIs' | 'camelCaseOnly' | 'dashes' | 'dashesOnly',
            exportOnlyLocals: boolean,

        }>;
        sourceMap: boolean;
        importLoaders: number;
        url: boolean | ((url: string, resourcePath: string) => boolean);
    }>;
    lessLoaderOptions?: Partial<{
        lessOptions: { [K: string]: any };
        additionalData: string | ((content: any, loaderContext: any) => string);
        sourceMap: boolean;
        webpackImporter: boolean;
        implementation: object | string;
    }>;
}
