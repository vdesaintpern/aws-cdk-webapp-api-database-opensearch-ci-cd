// envName provided at runtime in stacks
export enum EnvName {
    PreProd = "preprod",
    Prod = "prod"
}

// All elements will be suffixed with envName provided at runtime 
// Ex: usage : dbSecretName + EnvName.Prod

// name in secrets manager
export const dbSecretPrefix = "dbSecret";

// output in stack
export const dbSecretNamePrefix = "dbSecretName";

// name in secrets manager
export const osSecretPrefix = "osSecret";

// output in stack
export const osSecretNamePrefix = "osSecretName";

// output of ARN in stack
export const osSecretARNPrefix = "osSecretArn";

// prefix for output of domain URL
export const osURLPrefix = "osURL";

// name of vpc
export const vpcPrefix = "vpc";

// output in the stack
export const vpcNamePrefix = "vpcName";

// name of the database in the mysql instance
export const databaseNamePrefix = "myservice";

// output of stack to get URL for your browser
export const webappURLPrefix = "webappurl";

// output of stack to get URL for the webapp browser
export const apiURLPrefix = "apiurl";

// checks context parameters
export function enumFromStringValue<T> (enm: { [s: string]: T}, value: string): T | undefined {
    return (Object.values(enm) as unknown as string[]).includes(value)
      ? value as unknown as T
      : undefined;
}