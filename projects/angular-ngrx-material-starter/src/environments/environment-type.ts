export class Environment {
  public production!: boolean;
  public test!: boolean;
  public serviceDomain!: string;
  public serviceEndPoints!: { [key: string]: string };
  public discoveryUrl!: string;
  public redirect!: string;
  public clientId!: string;
  public useAuth!: boolean;
  public AUTH_API!: string;
  public AUTH_API_KAFKA!: string;

  public  i18nPrefix?: any;

  constructor(params?: { 
    production?: boolean, 
    test?: boolean,
    serviceDomain?: string, 
    serviceEndPoints?: {[key:string]: string}, 
    discoveryUrl?: string, 
    redirect?: string, 
    clientId?: string,
    useAuth?: boolean,
    AUTH_API?: string,
    AUTH_API_KAFKA?: string,
    i18nPrefix?: any;
  }) {
    if(params) {
      this.production = params.production;
      this.test = params.test;
      this.serviceDomain  = params.serviceDomain;
      this.serviceEndPoints = params.serviceEndPoints;
      this.redirect = params.redirect;
      this.clientId = params.clientId;
      this.useAuth = params.useAuth;
      this.AUTH_API = params.AUTH_API;
      this.AUTH_API_KAFKA = params.AUTH_API_KAFKA;
      this.i18nPrefix = params.i18nPrefix;
    }
  }
}
