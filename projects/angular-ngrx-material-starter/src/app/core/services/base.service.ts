import {
  HttpClient,
  HttpParams,
  HttpHeaders,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { v4 as uuid } from 'uuid';

// mport { AuthenticationService } from '@easydevops/angular-auth-plugin';

import { ApiRequest, ApiResponse, QueryOperator } from './models/base-api';
import { AuthService } from '../auth/auth.service';
// import { MessagingService } from './messaging.service';

/**
 * Represents a base service for making API calls to the RESTful services.
 */
export class  BaseService {
  private readonly proxyPathPrefix: string = 'http://proxy/api/';
  protected baseUrl: URL;
  private serviceUuid: string;

  get headers(): HttpHeaders {
    // console.log('this.authService.accessToken: get Headers() ', this.authService.accessToken);


    // if (environment?.useAuth && this.authService.accessToken) {
    // if (this.authService.accessToken) {

    //   this.serviceUuid = uuid();
    //   // console.log('this.authService.accessToken: 9999', this.authService.accessToken);

    //   return new HttpHeaders({
    //     Accept: 'application/json',
    //     'X-Request-Id': this.serviceUuid || 'none',
    //     Authorization: this.authService.accessToken,
    //   })
    // }
    return new HttpHeaders({
      Accept: 'application/json',
      'X-Request-Id': this.serviceUuid || 'none',
      Authorization: []
    })
  }

  constructor(
    protected readonly basePath: string,
    protected readonly httpClient: HttpClient,
    protected readonly authService: AuthService,
    // protected readonly messagingService: MessagingService
  ) {
    this.baseUrl = new URL(basePath, this.proxyPathPrefix);
  }

  /***
   * Gets an Observable<TResponseType> from the specified API service
   * @param {ApiRequest} apiRequest - Object containing the request keys to use as the
   * QueryString.
   * @param {any[]} params - A list of parameters that will be appended to the
   * request's URL. They may also be additions to the path, ie ('customer', 8, 'details')
   * will produce: /customer/8/details?someParam=foo.
   */
  public query<TResponseType>(
    apiRequest: ApiRequest,
    ...path: []
  ): Observable<TResponseType> {
    console.log('path: 4898 ', path);

    const url = this.buildUrlFromArguments(path);
    const params = new HttpParams({
      fromString: this.getQueryString(apiRequest),
    });
    console.log('the headers2', this.headers);

    return this.httpClient
      .get<TResponseType>(url, { params, headers: this.headers })
      .pipe(
        catchError((error) => this.handleError('line 73 base.service.ts', error)));
  }

  public querySelect<TResponseType>(
    apiRequest: ApiRequest,
    fields: string[],
    ...path: []
  ): Observable<TResponseType>;
  public querySelect<TResponseType>(
    apiRequest: ApiRequest,
    fields: string[] | string
  ): Observable<TResponseType> {
    if (typeof fields === 'string') {
      apiRequest.useQuery('select', fields, QueryOperator.equals);
    } else {
      apiRequest.useQuery('select', fields.join(), QueryOperator.equals);
    }

    return this.query<TResponseType>(apiRequest);
  }

  /**
   * Gets an Observable<TResponseType> from the specified API service.
   * @param {any[]} params - A list of parameters that will be appended to the
   * request's URL. They may also be additions to the path, ie ('customer', 8, 'details')
   * will produce: /customer/8/details.
   */
  public get<TResponseType>(...params: []): Observable<TResponseType> {
    // console.log('theheaders 102', this.headers);
    // console.log('params 103', params);
   // if (params.length !== 0) {
      return this.httpClient
        .get<TResponseType>(this.buildUrlFromArguments(params), {
          headers: this.headers,
          withCredentials: true
        })
        .pipe(catchError((error) => this.handleError(
          'from line 108, base.service.ts',
          error)));
   // }

  }

  /**
   * Sends the specified entity to the API to be created.
   * Returns an Observable<TResponseType> based on the API's results. The object may
   * have been changed during the post so the full object is returned in it's updated
   * state.
   * @param {TEntityResponseType} entity - The entity to post with the API request.
   * @param {any[]} params - A list of parameters that will be appended to the
   * request's URL. They may also be additions to the path, ie ('customer', 8, 'details')
   * will produce: /customer/8/details.
   */
  public post<TModel, TResult = TModel>(
    entity: TModel,
    ...params: []
  ): Observable<ApiResponse<TResult>> {

    return this.httpClient
      .post<ApiResponse<TResult>>(this.buildUrlFromArguments(params), entity, {
        headers: this.headers,
      })
      .pipe(catchError((error) => this.handleError(
        'from line 131, base.service.ts',
        error)));
  }

  /**
   * Sends the specified entity to the API to be updated.
   * Returns an Observable<TResponseType> based on the API's results. The object may
   * have been changed during the post so the full object is returned in it's updated
   * state.
   * @param {TEntityResponseType} entity - The entity to post with the API request.
   * @param {any[]} params - A list of parameters that will be appended to the
   * request's URL. They may also be additions to the path, ie ('customer', 8, 'details')
   * will produce: /customer/8/details.
   */
  public put<TModel, TResult = TModel>(
    entity: TModel,
    ...params: []
  ): Observable<ApiResponse<TResult>> {
    console.log('params: 32322', params);
    console.log(' this.buildUrlFromArguments(params): 32322',  this.buildUrlFromArguments(params));
    return this.httpClient
      .put<ApiResponse<TResult>>(this.buildUrlFromArguments(params), entity, {
        headers: this.headers,
      })
      // .pipe(catchError((error) => this.handleError(
      //   'from line 154, base.service.ts',
      //   error)),
      //   finalize(() => console.log(params)))
  }

  /**
   * Sends part of the specified entity to the API to be updated.
   * Returns  an Observable<TResponseType> based on the API's results. The object may
   * have been changed during the post so the full object is returned in it's updated
   * state.
   * @param {TEntityResponseType} entity - The entity to post with the API request.
   * @param {any[]} params - A list of parameters that will be appended to the
   * request's URL. They may also be additions to the path, ie ('customer', 8, 'details')
   * will produce: /customer/8/details.
   */
  public patch<TModel, TResult = TModel>(
    entity: TModel,
    ...params: []
  ): Observable<ApiResponse<TResult>> {
    return this.httpClient
      .patch<ApiResponse<TResult>>(this.buildUrlFromArguments(params), entity, {
        headers: this.headers,
      })
      .pipe(catchError((error) => this.handleError(
        'from line 177, base.service.ts',
        error)));
  }

  /**
   *
   */
  public delete<TModel, TResult = TModel>(
    entity: TModel,
    ...params: []
  ): Observable<ApiResponse<TResult>> {
    return this.httpClient
      .delete<ApiResponse<TResult>>(this.buildUrlFromArguments(params), {
        headers: this.headers,
      })
      .pipe(catchError((error) => this.handleError(
        'from line 193, base.service.ts',
        error)));
  }

  protected buildUrlFromArguments(parameters: []): string {
    const urlParams = this.getArgumentsAsParameters(parameters);

    if (urlParams) {
      // NOTE! This uses PATHNAME so the relative pathing works with /api. Please DO NOT CHANGE!
      const pathName = new URL(urlParams, this.baseUrl.href.concat('/')).pathname;
      return pathName
    }

    // NOTE! This uses PATHNAME so the relative pathing works with /api. Please DO NOT CHANGE!
    return this.baseUrl.pathname;
  }

  public publicBuildUrlFromArguments(parameters: []): string {
    const urlParams = this.getArgumentsAsParameters(parameters);

    if (urlParams) {
      // NOTE! This uses PATHNAME so the relative pathing works with /api. Please DO NOT CHANGE!
      const pathName = new URL(urlParams, this.baseUrl.href.concat('/')).pathname;
      return pathName
    }

    // NOTE! This uses PATHNAME so the relative pathing works with /api. Please DO NOT CHANGE!
    return this.baseUrl.pathname;
  }

  protected getArgumentsAsParameters(parameters): string {
    if (!parameters || parameters?.length === 0) {
      return void 0;
    }
    const args = Array.from(parameters);
    return `${args.join('/')}`;
  }

  protected getQueryString(apiRequest: ApiRequest): string {
    let queryString = Object.keys(apiRequest)
      .filter((key) => apiRequest[key] && key !== 'query')
      .map((key) => {
        if (apiRequest[key]) {
          console.log('(apiRequest[key]: ', (apiRequest[key]))
          return `${key}=${apiRequest[key]}`;
        } else {
          return '';
        }
      })
      .join('&');
    console.log('apiRequest : 4898', apiRequest);
    console.log('apiRequest.query.length : 4898', apiRequest?.query?.length);
    console.log(' apiRequest.query 4898 ', apiRequest.query);



    if (apiRequest && apiRequest.query && apiRequest?.query?.length > 0) {
      if (queryString) {
        queryString += '&';
      }
      queryString += apiRequest.query
        .map(
          (apiQuery) =>
            `${apiQuery.name}${apiQuery.apiQueryOperator.value}${apiQuery.value}`
        )
        .join('&');
    } else {
      console.error('there were not apirequest query parameters');
    }

    return queryString;
  }

  protected handleError(from: string, error) {
    console.log('error: the', error);
    if (error.status === 401) {
      if (error.url.search('settings') !== -1) {
        // this.messagingService.showErrorMessage(
        //   'Your session has timed out, please reload your page'
        // );
      } else {
        // this.messagingService.showErrorMessage(
        //   'You do not have permission to perform this action'
        // );
      }
    } else if (error.status === 404) {
      // this.messagingService.showErrorMessage(
      //   'The item you are looking for cannot be found'
      // );
    } else if (error.status === 413) {
      // this.messagingService.showErrorMessage(
      //   'The file that you are uploading is too large.  Please keep files to under 1GB'
      // );
    } else if (error.status === 429) {
      // this.messagingService.showErrorMessage(
      //   'Our authentication service was overwhelmed, please wait 60 seconds and try again...'
      // );
    }

    else {

      // this.messagingService.showErrorMessage(
      //   'There was a system error processing your request ' + error.status
      // );
    }

    return throwError(error);
  }
}
