declare module "swagger-jsdoc" {
  export interface Options {
    definition: {
      openapi: string;
      info: {
        title: string;
        version: string;
        description?: string;
        [key: string]: any;
      };
      servers?: Array<{
        url: string;
        description?: string;
      }>;
      components?: any;
      security?: any[];
      [key: string]: any;
    };
    apis: string[];
  }

  export default function swaggerJsdoc(options: Options): any;
}

declare module "swagger-ui-express" {
  import { RequestHandler } from "express";

  export function serve(): RequestHandler[];
  export function setup(
    spec: any,
    options?: any,
    swaggerOptions?: any,
    customCss?: any
  ): RequestHandler;

  export default {
    serve,
    setup,
  };
}
