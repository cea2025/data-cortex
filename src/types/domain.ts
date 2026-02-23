export type AssetType = "system" | "schema" | "table" | "column";
export type KnowledgeItemType =
  | "business_rule"
  | "warning"
  | "deprecation"
  | "calculation_logic";
export type KnowledgeStatus = "draft" | "review" | "approved" | "rejected";
export type UserRole = "admin" | "owner" | "contributor" | "viewer";

export interface Organization {
  id: string;
  slug: string;
  name: string;
  domainMappings: string[];
  createdAt: string;
}

export interface SourceProvenance {
  addedBy: string;
  source: string;
  generatedBy?: string;
  confidence?: number;
}

export interface DataAssetWithRelations {
  id: string;
  assetType: AssetType;
  systemName: string;
  schemaName: string | null;
  tableName: string | null;
  columnName: string | null;
  dataType: string | null;
  description: string | null;
  hebrewName: string | null;
  rawMetadata: Record<string, unknown> | null;
  parentId: string | null;
  ownerId: string | null;
  organizationId?: string | null;
  children?: DataAssetWithRelations[];
  knowledgeItems?: KnowledgeItemWithAuthor[];
  aiInsights?: AIInsightWithSources[];
  owner?: UserProfileBasic | null;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeItemWithAuthor {
  id: string;
  itemType: KnowledgeItemType;
  status: KnowledgeStatus;
  title: string;
  contentHebrew: string | null;
  contentEnglish: string | null;
  sourceProvenance: SourceProvenance | null;
  verifiedAt: string | null;
  dataAssetId: string;
  authorId: string;
  reviewerId: string | null;
  organizationId?: string | null;
  author: UserProfileBasic;
  reviewer?: UserProfileBasic | null;
  createdAt: string;
  updatedAt: string;
}

export interface AIInsightWithSources {
  id: string;
  synthesis: string;
  confidenceScore: number;
  modelVersion: string;
  dataAssetId: string;
  organizationId?: string | null;
  sourceReferences: {
    knowledgeItem: KnowledgeItemWithAuthor;
  }[];
  createdAt: string;
}

export interface UserProfileBasic {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  role: UserRole;
  isSuperAdmin: boolean;
  organizationId?: string | null;
}

export interface AuditLogEntry {
  id: string;
  entityId: string;
  entityType: string;
  action: string;
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  userId: string;
  organizationId?: string | null;
  user: UserProfileBasic;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  userId: string;
  createdAt: string;
}

export interface SearchResult {
  id: string;
  type: AssetType | "knowledge";
  title: string;
  subtitle: string;
  hebrewName?: string;
  knowledgeCount?: number;
}

export const KNOWLEDGE_TYPE_LABELS: Record<KnowledgeItemType, string> = {
  business_rule: "כלל עסקי",
  warning: "אזהרה",
  deprecation: "הוצא משימוש",
  calculation_logic: "לוגיקת חישוב",
};

export const KNOWLEDGE_STATUS_LABELS: Record<KnowledgeStatus, string> = {
  draft: "טיוטה",
  review: "בבדיקה",
  approved: "מאושר",
  rejected: "נדחה",
};

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  system: "מערכת",
  schema: "סכמה",
  table: "טבלה",
  column: "עמודה",
};
