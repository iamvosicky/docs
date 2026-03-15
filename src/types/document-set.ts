export interface DocumentSet {
  id: string;
  name: string;
  description?: string;
  /** IDs of templates belonging to this set */
  templateIds: string[];
  createdAt: string;
  updatedAt: string;
}
