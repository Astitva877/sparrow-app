import {
  toTypedRxJsonSchema,
  type ExtractDocumentTypeFromTypedRxJsonSchema,
  type RxJsonSchema,
} from "rxdb";

const keyValueTextLiteral = {
  type: "array",
  items: {
    type: "object",
    properties: {
      key: {
        type: "string",
      },
      value: {
        type: "string",
      },
      checked: {
        type: "boolean",
      },
    },
  },
};

const keyValueFileLiteral = {
  type: "array",
  items: {
    type: "object",
    properties: {
      key: {
        type: "string",
      },
      value: {
        type: "string",
      },
      base: {
        type: "string",
      },
      checked: {
        type: "boolean",
      },
    },
  },
};

const formdataLiteral = {
  type: "object",
  properties: {
    text: keyValueTextLiteral,
    file: keyValueFileLiteral,
  },
};

const bodyLiteral = {
  type: "object",
  properties: {
    raw: {
      type: "string",
    },
    urlencoded: {
      type: "string",
    },
    formdata: formdataLiteral,
  },
};

const responseLiteral = {
  type: "object",
  properties: {
    headers: {
      type: "string",
    },
    status: {
      type: "string",
    },
    body: {
      type: "string",
    },
    size: {
      type: "number",
    },
    time: {
      type: "number",
    },
  },
};
const stateLiteral = {
  type: "object",
  properties: {
    raw: {
      type: "string",
    },
    dataset: {
      type: "string",
    },
    auth: {
      type: "string",
    },
    section: {
      type: "string",
    },
    responseSection: {
      type: "string",
    },
    responseRaw: {
      type: "string",
    },
    responseFormatter: {
      type: "string",
    },
    additions: {
      type: "string",
    },
    isSaveDescription: {
      type: "boolean",
    },
  },
};
const basicAuthLiteral = {
  type: "object",
  properties: {
    username: {
      type: "string",
    },
    password: {
      type: "string",
    },
  },
};

const apiKeyLiteral = {
  type: "object",
  properties: {
    authKey: {
      type: "string",
    },
    authValue: {
      type: "string",
    },
    addTo: {
      type: "string",
    },
  },
};

const authLiteral = {
  type: "object",
  properties: {
    bearerToken: {
      type: "string",
    },
    basicAuth: basicAuthLiteral,
    apiKey: apiKeyLiteral,
  },
};

const saveLiteral = {
  type: "object",
  properties: {
    api: {
      type: "boolean",
    },
    description: {
      type: "boolean",
    },
  },
};

const requestLiteral = {
  type: "object",
  properties: {
    method: {
      type: "string",
    },
    body: bodyLiteral,
    url: {
      type: "string",
    },
    headers: keyValueTextLiteral,
    queryParams: keyValueTextLiteral,
    autoGeneratedHeaders: keyValueTextLiteral,
    response: responseLiteral,
    state: stateLiteral,
    auth: authLiteral,
    requestInProgress: {
      type: "boolean",
      default: false,
    },
    save: saveLiteral,
  },
};

const propertyLiteral = {
  type: "object",
  properties: {
    request: requestLiteral,
    folder: {
      type: "string",
    },
    collection: {
      type: "string",
    },
    workspace: {
      type: "string",
    },
  },
};

const pathLiteral = {
  type: "object",
  properties: {
    workspaceId: {
      type: "string",
    },
    collectionId: {
      type: "string",
    },
    folderId: {
      type: "string",
    },
    folderName: {
      type: "string",
    },
  },
};

export const tabSchemaLiteral = {
  title: "Opened tabs that will be shown on dashboard",
  primaryKey: {
    key: "tabId",
    fields: ["createdAt"],
    separator: "|",
  },
  type: "object",
  version: 3,
  properties: {
    tabId: {
      type: "string",
      maxLength: 100,
    },
    id: {
      type: "string",
      maxLength: 100,
    },
    name: {
      type: "string",
    },
    description: {
      type: "string",
    },
    isDeleted: {
      type: "boolean",
    },
    activeSync: {
      type: "boolean",
    },
    source: {
      type: "string",
    },
    type: {
      type: "string",
    },
    property: propertyLiteral,
    save: {
      type: "boolean",
    },
    isActive: {
      type: "boolean",
      default: true,
    },
    path: pathLiteral,
    saveInProgress: {
      type: "boolean",
    },
    createdAt: {
      type: "string",
      maxLength: 100,
    },
    index: {
      type: "number",
    },
  },
  required: ["id", "name"],
  indexes: ["createdAt"],
} as const;

const schemaTyped = toTypedRxJsonSchema(tabSchemaLiteral);

export type TabDocType = ExtractDocumentTypeFromTypedRxJsonSchema<
  typeof schemaTyped
>;

export const tabSchema: RxJsonSchema<TabDocType> = tabSchemaLiteral;
