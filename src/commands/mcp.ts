import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import {
  toolProjectStatus,
  toolListFeatures,
  toolListStories,
  toolListEnablers,
} from "../mcp/tools";

// `fremi mcp` - runs a persistent MCP server over stdio. Claude Code
// spawns this as a subprocess (configured via ~/.claude/mcp/fremi.json)
// and calls tools via JSON-RPC. The tools expose read-only project
// introspection: list features / stories / enablers, plus a status
// check for the project's fremi state.

const FREMI_VERSION = "0.4.0";

const TOOL_DEFS = [
  {
    name: "project_status",
    description:
      "Returns whether fremi is installed and enabled in the current project. Reports the config path and whether skills should be considered active.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: "list_features",
    description:
      "Lists all features under docs/works/features/ with their slug, path, and quick presence flags for definition.md, decisions.md, plus counts of stories and enablers.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: "list_stories",
    description:
      "Lists user stories across features. Each story includes its slug, parent feature, path, current phase (FW-00..FW-10), and the list of FW-XX artifact files present.",
    inputSchema: {
      type: "object",
      properties: {
        feature: {
          type: "string",
          description: "Optional feature slug (e.g. 'FT-01_login') to filter stories to that feature only.",
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: "list_enablers",
    description:
      "Lists enablers - both global (docs/works/enablers/) and per-feature (docs/works/features/*/enablers/). Includes scope, parent feature (if any), and presence flags for the EN-01..EN-04 artifacts.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
] as const;

export async function runMcp(): Promise<void> {
  const server = new Server(
    { name: "fremi", version: FREMI_VERSION },
    { capabilities: { tools: {} } },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: TOOL_DEFS.map((t) => ({ ...t })),
  }));

  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    const cwd = process.env.FREMI_MCP_CWD ?? process.cwd();
    const name = req.params.name;
    const args = (req.params.arguments ?? {}) as Record<string, unknown>;

    try {
      const result = dispatch(name, args, cwd);
      return {
        content: [
          { type: "text", text: JSON.stringify(result, null, 2) },
        ],
      };
    } catch (err) {
      return {
        isError: true,
        content: [
          { type: "text", text: `Error running ${name}: ${(err as Error).message}` },
        ],
      };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

function dispatch(name: string, args: Record<string, unknown>, cwd: string): unknown {
  switch (name) {
    case "project_status":
      return toolProjectStatus(cwd);
    case "list_features":
      return toolListFeatures(cwd);
    case "list_stories":
      return toolListStories(cwd, typeof args.feature === "string" ? args.feature : undefined);
    case "list_enablers":
      return toolListEnablers(cwd);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
