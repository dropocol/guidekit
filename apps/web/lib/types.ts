import { JsonValue, JsonObject } from "next-auth/adapters";

export type DomainVerificationStatusProps =
  | "Valid Configuration"
  | "Invalid Configuration"
  | "Pending Verification"
  | "Domain Not Found"
  | "Unknown Error";

// From https://vercel.com/docs/rest-api/endpoints#get-a-project-domain
export interface DomainResponse {
  name: string;
  apexName: string;
  projectId: string;
  redirect?: string | null;
  redirectStatusCode?: (307 | 301 | 302 | 308) | null;
  gitBranch?: string | null;
  updatedAt?: number;
  createdAt?: number;
  /** `true` if the domain is verified for use with the project. If `false` it will not be used as an alias on this project until the challenge in `verification` is completed. */
  verified: boolean;
  /** A list of verification challenges, one of which must be completed to verify the domain for use on the project. After the challenge is complete `POST /projects/:idOrName/domains/:domain/verify` to verify the domain. Possible challenges: - If `verification.type = TXT` the `verification.domain` will be checked for a TXT record matching `verification.value`. */
  verification: {
    type: string;
    domain: string;
    value: string;
    reason: string;
  }[];
}

// From https://vercel.com/docs/rest-api/endpoints#get-a-domain-s-configuration
export interface DomainConfigResponse {
  /** How we see the domain's configuration. - `CNAME`: Domain has a CNAME pointing to Vercel. - `A`: Domain's A record is resolving to Vercel. - `http`: Domain is resolving to Vercel but may be behind a Proxy. - `null`: Domain is not resolving to Vercel. */
  configuredBy?: ("CNAME" | "A" | "http") | null;
  /** Which challenge types the domain can use for issuing certs. */
  acceptedChallenges?: ("dns-01" | "http-01")[];
  /** Whether or not the domain is configured AND we can automatically generate a TLS certificate. */
  misconfigured: boolean;
}

// From https://vercel.com/docs/rest-api/endpoints#verify-project-domain
export interface DomainVerificationResponse {
  name: string;
  apexName: string;
  projectId: string;
  redirect?: string | null;
  redirectStatusCode?: (307 | 301 | 302 | 308) | null;
  gitBranch?: string | null;
  updatedAt?: number;
  createdAt?: number;
  /** `true` if the domain is verified for use with the project. If `false` it will not be used as an alias on this project until the challenge in `verification` is completed. */
  verified: boolean;
  /** A list of verification challenges, one of which must be completed to verify the domain for use on the project. After the challenge is complete `POST /projects/:idOrName/domains/:domain/verify` to verify the domain. Possible challenges: - If `verification.type = TXT` the `verification.domain` will be checked for a TXT record matching `verification.value`. */
  verification?: {
    type: string;
    domain: string;
    value: string;
    reason: string;
  }[];
}

// ----------------
// Prisma Types
// ----------------

export type Knowledgebase = {
  id: string;
  name: string;
  description: string;
  notionLink: string;
  userId: string;
  collections: Collection[];
  createdAt: Date;
  updatedAt: Date;
  articleCount: number;
  slug?: string;
  subdomain?: string | null;
  customDomain?: string | null;
  image?: string | null;
  logo?: string | null;
  imageBlurhash?: string | null;
  favicon?: string | null;
};

export interface Collection {
  id: string;
  slug: string;
  pageIcon?: string | null;
  name: string;
  description: string | null;
  knowledgebaseId: string;
  type: string;
  properties: JsonObject;
  subCollections: SubCollection[];
  articleCount: number;
}

export type SubCollection = {
  id: string;
  name: string;
  description: string;
  type: string;
  articles: Article[];
  articleCount: number;
  notion_view_ids: string[];
  notion_collection_id: string;
  slug: string;
};

export type Article = {
  id: string;
  title: string;
  properties: JsonObject;
  recordMap: JsonObject;
  description: string;
  subCollectionId: string;
  slug: string;
};

export type CollectionWithSubCollections = Collection & {
  subCollections: Array<
    SubCollection & {
      articles: Article[];
    }
  >;
};

export interface KnowledgebaseWithCollections extends Knowledgebase {
  collections: Collection[];
}

export type SubCollectionArticle = {
  title: string;
  description?: string;
  properties: Record<string, any>;
  recordMap: Record<string, any>;
};
