declare global {
    namespace NodeJS {
      interface ProcessEnv {
        port: string;
      }
    }
  }
  
  export {};