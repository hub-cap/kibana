<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [kibana-plugin-server](./kibana-plugin-server.md) &gt; [HttpServerSetup](./kibana-plugin-server.httpserversetup.md) &gt; [basePath](./kibana-plugin-server.httpserversetup.basepath.md)

## HttpServerSetup.basePath property

<b>Signature:</b>

```typescript
basePath: {
        get: (request: KibanaRequest | LegacyRequest) => string;
        set: (request: KibanaRequest | LegacyRequest, basePath: string) => void;
        prepend: (url: string) => string;
        remove: (url: string) => string;
    };
```