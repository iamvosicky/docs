export interface DocumentSet {
  id: string;
  name: string;
  description?: string;
  /** IDs of templates belonging to this set */
  templateIds: string[];
  /** Whether this set is pinned to the dashboard */
  isStarred?: boolean;
  createdAt: string;
  updatedAt: string;
}
