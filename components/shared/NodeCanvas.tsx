"use client";

import React, { useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Handle,
  Position,
  NodeProps,
  Node,
} from "reactflow";
import "reactflow/dist/style.css";
import { cn } from "@/lib/utils";
import { Database, Play, GitBranch, MessageSquare, Mail, Terminal, Cpu } from "lucide-react";

// Standard Database Column schema
export interface DbColumn {
  name: string;
  type: string;
  isKey?: boolean;
}

export interface DbNodeData {
  label: string;
  columns: DbColumn[];
}

export interface WorkflowNodeData {
  label: string;
  type: "trigger" | "condition" | "action";
  icon: string;
  description: string;
}

export type CanvasNodeData = DbNodeData | WorkflowNodeData;

// Database Table Node renderer
const TableNode = ({ data }: NodeProps<DbNodeData>) => {
  return (
    <div className="bg-surface border border-border/80 rounded-lg shadow-xl min-w-[200px] overflow-hidden text-scale-xs font-sans">
      {/* Target handle on left */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-2 h-2 !bg-signal border border-surface rounded-full"
      />
      
      {/* Header */}
      <div className="bg-void/60 border-b border-border/30 px-3 py-2 flex items-center gap-2">
        <Database className="w-3.5 h-3.5 text-signal" />
        <span className="font-display font-bold text-bone">{data.label}</span>
      </div>

      {/* Columns List */}
      <div className="p-2.5 space-y-1.5 font-mono text-[10px] bg-surface">
        {data.columns.map((col, idx) => (
          <div key={idx} className="flex justify-between items-center px-1">
            <span className={cn("text-bone", col.isKey && "text-signal font-semibold")}>
              {col.name} {col.isKey && "🔑"}
            </span>
            <span className="text-muted-foreground">{col.type}</span>
          </div>
        ))}
      </div>

      {/* Source handle on right */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-2 h-2 !bg-signal border border-surface rounded-full"
      />
    </div>
  );
};

// Automation Workflow Node renderer
const WorkflowNode = ({ data }: NodeProps<WorkflowNodeData>) => {
  const getIcon = (name: string) => {
    switch (name) {
      case "play":
        return <Play className="w-4 h-4" />;
      case "branch":
        return <GitBranch className="w-4 h-4" />;
      case "slack":
        return <MessageSquare className="w-4 h-4" />;
      case "email":
        return <Mail className="w-4 h-4" />;
      case "terminal":
        return <Terminal className="w-4 h-4" />;
      default:
        return <Cpu className="w-4 h-4" />;
    }
  };

  const getAccentClass = (nodeType: "trigger" | "condition" | "action") => {
    switch (nodeType) {
      case "trigger":
        return {
          border: "border-circuit hover:border-circuit/90",
          iconBg: "bg-circuit/15 text-circuit border-circuit/25",
          badge: "bg-circuit/10 text-circuit border-circuit/20",
        };
      case "condition":
        return {
          border: "border-pulse hover:border-pulse/90",
          iconBg: "bg-pulse/15 text-pulse border-pulse/25",
          badge: "bg-pulse/10 text-pulse border-pulse/20",
        };
      default:
        return {
          border: "border-signal hover:border-signal/90",
          iconBg: "bg-signal/15 text-signal border-signal/25",
          badge: "bg-signal/10 text-signal border-signal/20",
        };
    }
  };

  const style = getAccentClass(data.type);

  return (
    <div
      className={cn(
        "bg-surface border rounded-xl p-4 shadow-xl min-w-[220px] transition-colors font-sans text-scale-xs relative",
        style.border
      )}
    >
      {/* Target handle on left */}
      {data.type !== "trigger" && (
        <Handle
          type="target"
          position={Position.Left}
          className="w-2.5 h-2.5 !bg-circuit border border-surface rounded-full"
        />
      )}

      <div className="flex items-start gap-3">
        <div className={cn("w-8 h-8 rounded-lg border flex items-center justify-center shrink-0", style.iconBg)}>
          {getIcon(data.icon)}
        </div>
        
        <div className="space-y-1 pr-4">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-display font-bold text-bone text-scale-sm">{data.label}</span>
            <span className={cn("text-[9px] font-mono font-bold uppercase tracking-wider px-1 py-0.2 rounded border", style.badge)}>
              {data.type}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground leading-normal">{data.description}</p>
        </div>
      </div>

      {/* Source handle on right */}
      {data.type !== "action" && (
        <Handle
          type="source"
          position={Position.Right}
          className="w-2.5 h-2.5 !bg-circuit border border-surface rounded-full"
        />
      )}
    </div>
  );
};

// Map nodes
const nodeTypes = {
  dbTable: TableNode,
  workflowNode: WorkflowNode,
};

// Mock database initial elements
const initialDbNodes: Node<CanvasNodeData>[] = [
  {
    id: "t-users",
    type: "dbTable",
    position: { x: 50, y: 80 },
    data: {
      label: "users",
      columns: [
        { name: "id", type: "uuid", isKey: true },
        { name: "email", type: "varchar(255)" },
        { name: "password_hash", type: "varchar(255)" },
        { name: "created_at", type: "timestamp" },
      ],
    },
  },
  {
    id: "t-profiles",
    type: "dbTable",
    position: { x: 380, y: 150 },
    data: {
      label: "profiles",
      columns: [
        { name: "id", type: "uuid", isKey: true },
        { name: "user_id", type: "uuid" },
        { name: "first_name", type: "varchar(100)" },
        { name: "last_name", type: "varchar(100)" },
        { name: "avatar_url", type: "varchar(512)" },
      ],
    },
  },
];

const initialDbEdges = [
  {
    id: "e-users-profiles",
    source: "t-users",
    target: "t-profiles",
    animated: true,
    style: { stroke: "var(--signal)", strokeWidth: 1.5 },
  },
];

// Mock workflow initial elements
const initialWorkflowNodes: Node<CanvasNodeData>[] = [
  {
    id: "w-trigger",
    type: "workflowNode",
    position: { x: 50, y: 100 },
    data: {
      label: "Webhook Received",
      type: "trigger",
      icon: "play",
      description: "Trigger on POST payload requests to /v1/events",
    },
  },
  {
    id: "w-condition",
    type: "workflowNode",
    position: { x: 340, y: 100 },
    data: {
      label: "Type is Production",
      type: "condition",
      icon: "branch",
      description: "Condition checking if environment key equals 'prod'",
    },
  },
  {
    id: "w-action",
    type: "workflowNode",
    position: { x: 630, y: 100 },
    data: {
      label: "Send Slack Alert",
      type: "action",
      icon: "slack",
      description: "Send alert payload to operational workspace channel #telemetry",
    },
  },
];

const initialWorkflowEdges = [
  {
    id: "ew-1",
    source: "w-trigger",
    target: "w-condition",
    animated: true,
    style: { stroke: "var(--circuit)", strokeWidth: 1.5 },
  },
  {
    id: "ew-2",
    source: "w-condition",
    target: "w-action",
    animated: true,
    style: { stroke: "var(--circuit)", strokeWidth: 1.5 },
  },
];

interface NodeCanvasProps {
  mode: "database" | "workflow";
  className?: string;
}

export function NodeCanvas({ mode, className }: NodeCanvasProps) {
  const isDb = mode === "database";
  
  const [nodes, , onNodesChange] = useNodesState<CanvasNodeData>(
    isDb ? initialDbNodes : initialWorkflowNodes
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    isDb ? initialDbEdges : initialWorkflowEdges
  );

  const onConnect = useCallback(
    (params: Connection | Edge) => {
      const activeColor = isDb ? "var(--signal)" : "var(--circuit)";
      const newEdge = {
        ...params,
        animated: true,
        style: { stroke: activeColor, strokeWidth: 1.5 },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [isDb, setEdges]
  );

  return (
    <div className={cn("w-full h-full relative bg-void", className)}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background color="var(--bone)" style={{ opacity: 0.06 }} gap={20} size={1} />
        <Controls className="!bg-surface !border-border/60 !text-bone rounded-lg overflow-hidden [&_button]:!bg-surface [&_button]:!text-bone [&_button]:hover:!bg-void/50 [&_button]:!border-border/20" />
        <MiniMap
          nodeColor={() => "var(--surface)"}
          maskColor="rgba(11, 11, 16, 0.5)"
          className="!bg-surface !border-border/60 rounded-lg overflow-hidden hidden sm:block"
        />
      </ReactFlow>
    </div>
  );
}
