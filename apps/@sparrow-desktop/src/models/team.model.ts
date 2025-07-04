import {
  toTypedRxJsonSchema,
  type ExtractDocumentTypeFromTypedRxJsonSchema,
  type RxJsonSchema,
} from "rxdb";

export const teamSchemaLiteral = {
  title: "team",
  primaryKey: "teamId",
  type: "object",
  version: 6,
  properties: {
    teamId: {
      type: "string",
      maxLength: 100,
    },
    name: {
      type: "string",
    },
    logo: {
      type: "object",
    },
    hubUrl: {
      type: "string",
    },
    githubUrl: {
      type: "string",
    },
    xUrl: {
      type: "string",
    },
    linkedinUrl: {
      type: "string",
    },
    workspaces: {
      type: "array",
      uniqueItems: true,
      items: {
        type: "object",
        properties: {
          workspaceId: {
            type: "string",
          },
          name: {
            type: "string",
          },
        },
      },
    },
    users: {
      type: "array",
      uniqueItems: true,
      items: {
        type: "object",
        properties: {
          id: {
            type: "string",
          },
          email: {
            type: "string",
          },
          name: {
            type: "string",
          },
          role: {
            type: "string",
          },
        },
      },
    },
    owner: {
      type: "string",
    },
    admins: {
      type: "array",
      items: {
        type: "string",
      },
    },
    isActiveTeam: {
      type: "boolean",
      default: false,
    },
    isOpen: {
      type: "boolean",
      default: false,
    },
    isNewInvite: {
      type: "boolean",
      default: false,
    },
    plan: {
      type: "object",
      properties: {
        id: {
          type: "string",
        },
        name: {
          type: "string",
        },
      },
      required: ["id", "name"],
    },
    createdAt: {
      type: "string",
    },
    createdBy: {
      type: "string",
    },
    updatedAt: {
      type: "string",
    },
    updatedBy: {
      type: "string",
    },
  },
  required: ["teamId", "name", "createdAt", "createdBy"],
} as const;

const schemaTyped = toTypedRxJsonSchema(teamSchemaLiteral);

export type TeamDocType = ExtractDocumentTypeFromTypedRxJsonSchema<
  typeof schemaTyped
>;

export const teamSchema: RxJsonSchema<TeamDocType> = teamSchemaLiteral;
