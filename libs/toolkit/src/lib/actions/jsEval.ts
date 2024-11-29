type JsEvalOptions = {
    allowedGlobals?: Record<string, any>; // Allowed global functions or objects
    params?: Record<string, any>;        // Parameters to pass to the script
    timeoutMs?: number;                  // Maximum timeout for script execution
  };
  
class JsEval {
    private allowedGlobals: Record<string, any>; // List of allowed APIs
    private timeoutMs: number;
  
    constructor(allowedGlobals: Record<string, any> = {}, timeoutMs = 5000) {
      this.allowedGlobals = allowedGlobals;
      this.timeoutMs = timeoutMs;
    }
  
    // Method to update the whitelist
    updateWhitelist(newGlobals: Record<string, any>): void {
      this.allowedGlobals = { ...this.allowedGlobals, ...newGlobals };
    }
  
    // Method to create the sandbox with the current whitelist
    private createSandbox(): ProxyHandler<any> {
      return new Proxy(this.allowedGlobals, {
        has: () => false, // Nega l'accesso a variabili globali non autorizzate
        get: (target, key) => {
          if (!(key in target)) {
            throw new Error(`Accesso alla proprietà '${key.toString()}' non consentito`);
          }
          return target[key as string];
        },
      });
    }
  
    async executeAsync(script: string, params: Record<string, any> = {}): Promise<any> {
        const sandbox = this.createSandbox(); // Sandbox based on the current whitelist
  
        // Create the function that will execute the script
        // eslint-disable-next-line no-new-func
        const func = new Function(
          'sandbox',
          'params',
          `
          return new Promise((resolve, reject) => {
            with (sandbox) {
              try {
            const { ${Object.keys(params).join(', ')} } = params; // Decompose parameters
            const result = (async () => { ${script} })(); // Supports async code
            resolve(result);
              } catch (err) {
            reject(err);
              }
            }
          });
        `
        );
  
        // Execute the function with timeout
        return await this.runWithTimeout(() => func(sandbox, params), this.timeoutMs);
    }

    execute(script: string, params: Record<string, any> = {}): any {
      try {
        const sandbox = this.createSandbox(); // Sandbox based on the current whitelist
  
        // Create the function that will execute the script
        // eslint-disable-next-line no-new-func
        const func = new Function(
          'sandbox',
          'params',
          `          
            with (sandbox) {
              const { ${Object.keys(params).join(', ')} } = params; // Decomposizione parametri
              ${script}
            }
          `
        );
  
        // Execute the function with timeout
        return func(sandbox, params);
      } catch (err) {
        console.error("Error during script execution:", err);
        throw err; // Propagate the error for external handling
      }
    }
  
    private runWithTimeout<T>(fn: () => Promise<T>, timeoutMs: number): Promise<T> {
      return new Promise<T>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('Script timeout')), timeoutMs);
        fn()
          .then((result) => {
            clearTimeout(timer); // Clear the timeout if the function completes in time
            resolve(result);
          })
          .catch((err) => {
            clearTimeout(timer); // Clear the timeout in case of error
            reject(err);
          });
      });
    }
  }
  
  export { JsEval, JsEvalOptions };
