import type { AiRequestBaseInterface } from "./ai-request-base";
import type { FolderBaseInterface } from "./folder-base";
import type { GraphqlRequestBaseInterface } from "./graphql-request-base";
import type { HttpRequestBaseInterface } from "./http-request-base";
import type {
  HttpRequestMockBaseInterface,
  HttpRequestMockBodyBaseInterface,
  HttpRequestMockBodyModeBaseEnum,
  HttpRequestMockKeyValueCheckedBaseInterface,
  HttpResponseMockBodyModeBaseEnum,
} from "./http-request-mock-base";
import type { HttpRequestSavedBaseInterface } from "./http-request-saved-base";
import type { HttpResponseMockBaseInterface } from "./http-response-mock-base";
import type { SocketIORequestBaseInterface } from "./socket-io-request-base";
import type { WebsocketRequestBaseInterface } from "./websocket-request-base";

export enum CollectionItemTypeBaseEnum {
  FOLDER = "FOLDER",
  REQUEST = "REQUEST",
  WEBSOCKET = "WEBSOCKET",
  SOCKETIO = "SOCKETIO",
  GRAPHQL = "GRAPHQL",
  SAVED_REQUEST = "REQUEST_RESPONSE",
  MOCK_REQUEST = "MOCK_REQUEST",
  AI_REQUEST = "AI_REQUEST",
  MOCK_REQUEST_RESPONSE = "MOCK_REQUEST_RESPONSE",
}

export interface CollectionItemBaseInterface {
  id: string;
  name: string;
  description: string;
  type: CollectionItemTypeBaseEnum;
  source: string;
  isDeleted: boolean;
  request?: HttpRequestBaseInterface;
  websocket?: WebsocketRequestBaseInterface;
  socketio?: SocketIORequestBaseInterface;
  graphql?: GraphqlRequestBaseInterface;
  requestResponse?: HttpRequestSavedBaseInterface;
  mockRequest?: HttpRequestMockBaseInterface;
  mockRequestResponse?: HttpResponseMockBaseInterface;
  aiRequest?: AiRequestBaseInterface;
  folder?: FolderBaseInterface;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  items: CollectionItemBaseInterface[];
}

interface Branch {
  id: string;
  name: string;
}

export enum CollectionRequestAddToBaseEnum {
  HEADER = "Header",
  QUERY_PARAMETER = "Query Parameter",
  COOKIES = "Cookies",
}

export enum CollectionAuthTypeBaseEnum {
  NO_AUTH = "No Auth",
  API_KEY = "API Key",
  BEARER_TOKEN = "Bearer Token",
  BASIC_AUTH = "Basic Auth",
}

export enum CollectionTypeBaseEnum {
  MOCK = "MOCK",
  STANDARD = "STANDARD",
}

export interface CollectionAuthBaseInterface {
  bearerToken: string;
  basicAuth: {
    username: string;
    password: string;
  };
  apiKey: {
    authKey: string;
    authValue: string;
    addTo: CollectionRequestAddToBaseEnum;
  };
}

export interface MockRequestHistoryBaseInterface {
  id?: string;
  timestamp: string;
  name: string;
  url: string;
  method: string;
  responseStatus?: string;
  duration: number;
  requestHeaders?: HttpRequestMockKeyValueCheckedBaseInterface[];
  requestBody?: HttpRequestMockBodyBaseInterface[];
  selectedRequestBodyType?: HttpRequestMockBodyModeBaseEnum;
  selectedResponseBodyType?: HttpResponseMockBodyModeBaseEnum;
  responseHeaders?: HttpRequestMockKeyValueCheckedBaseInterface[];
  responseBody?: string;
}

export interface CollectionBaseInterface {
  collectionId?: string;
  id: string;
  name: string;
  totalRequests: number;
  description: string;
  collectionType?: CollectionTypeBaseEnum;
  mockCollectionUrl?: string;
  isMockCollectionRunning?: boolean;
  items: CollectionItemBaseInterface[];
  uuid?: string;
  activeSync?: boolean;
  activeSyncUrl?: string;
  localRepositoryPath?: string;
  workspaceId: string;
  auth?: CollectionAuthBaseInterface;
  selectedAuthType?: CollectionAuthTypeBaseEnum;
  branches?: Branch[];
  primaryBranch?: string;
  currentBranch?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  syncedAt?: string;
  mockRequestHistory?: MockRequestHistoryBaseInterface[];
}

export interface CollectionArgsBaseInterface {
  workspaceId: string;
  collection?: CollectionBaseInterface;
  folder?: CollectionItemBaseInterface;
  request?: CollectionItemBaseInterface;
  websocket?: CollectionItemBaseInterface;
  socketio?: CollectionItemBaseInterface;
  graphql?: CollectionItemBaseInterface;
  requestResponse?: CollectionItemBaseInterface;
  mockRequest?: CollectionItemBaseInterface;
  aiRequest?: CollectionItemBaseInterface;
  newName?: string;
  importCurl?: string;
  deletedIds?: string[];
  requestIds?: string[];
}
