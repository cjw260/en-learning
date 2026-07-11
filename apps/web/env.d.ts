/// <reference types="vite/client" />

interface IportMetaEnv {
  readonly VITE_MINIO_ENDPOINT: string;
  readonly VITE_SOCKET_URL: string;
  // 更多环境变量...
}

interface ImportMeta {
  readonly env: IportMetaEnv;
}
