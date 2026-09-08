import type { WeddingTrialWorkspace } from '../boda-trial/schema.ts';
export type AccessibilityNeed = 'wheelchair_space' | 'step_free_access' | 'highchair';
export type Person = {
    id: string;
    groupId: string;
    name: string;
    namePending: boolean;
    kind: 'adult' | 'child' | 'baby' | 'unknown';
    attendance: 'pending' | 'confirmed' | 'declined';
    seatRequired: boolean;
    menu: string;
    dietaryRestriction: string;
    shareDietaryRestriction: boolean;
    accessibilityNeeds: AccessibilityNeed[];
    note: string;
};
export type Group = {
    id: string;
    label: string;
    personIds: string[];
    invitationVersion: number;
};
export type TableGeometry = { shape:'round'|'rectangular'; x:number; y:number; width:number; height:number; rotation:number };
export type FloorFeature = { id:string; kind:'entrance'|'dancefloor'; label:string; x:number; y:number; width:number; height:number; rotation:number };
export type FloorPlan = { width:number; height:number; features:FloorFeature[] };
export type Table = TableGeometry & {
    id: string;
    name: string;
    capacity: number;
};
export type Business = {
    floorPlan:FloorPlan;
    draft: WeddingTrialWorkspace;
    photos: string[];
    rsvpClosed: boolean;
    published: {
        revision: number;
        at: string;
        workspace: WeddingTrialWorkspace;
        photos: string[];
    } | null;
    groups: Group[];
    people: Person[];
    tables: Table[];
    assignments: {
        personId: string;
        tableId: string;
    }[];
    review: 'draft' | 'needs_review' | 'ready';
};
export type Ledger = {
    id: string;
    kind: 'payment_verified' | 'time';
    amount?: number;
    currency?: string;
    minutes?: number;
    reference: string;
    at: string;
};
export type StoredEvent = Business & {
    acquisitionSource?: 'direct' | 'guest_attribution';
    schema: 1;
    id: string;
    revision: number;
    createdAt: string;
    updatedAt: string;
    passwordHash: string;
    recoveryKeyHash?: string;
    creationRequestHash?: string;
    activation?: {firstPublishedAt?:string;firstRsvpAt?:string};
    sessions: {
        hash: string;
        expiresAt: number;
    }[];
    invitations: Record<string, string>;
    assets: Record<string, string>;
    ledger: Ledger[];
    audit: {
        at: string;
        action: string;
        actor: string;
    }[];
    snapshots: {
        id: string;
        at: string;
        action: string;
        state: Business;
    }[];
};
export type EventView = {
    viewerRole?: 'operator' | 'couple';
} & Business & Pick<StoredEvent, 'id' | 'revision' | 'createdAt' | 'updatedAt' | 'ledger' | 'audit'> & {
    revisions: {
        id: string;
        at: string;
        action: string;
    }[];
};
export class ServiceError extends Error {
    readonly status: number;
    constructor(status: number, message: string) { super(message); this.status = status; this.name = 'ServiceError'; }
}
