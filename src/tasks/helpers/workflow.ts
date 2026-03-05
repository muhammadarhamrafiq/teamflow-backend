import { Role, TaskStatus } from 'src/generated/prisma/enums';

export type TASK_WORKFLOW_TYPE = Record<
  TaskStatus,
  { [K in TaskStatus]?: Role[] }
>;

export const TASK_WORKFLOW: TASK_WORKFLOW_TYPE = {
  BACKLOG: {
    TODO: ['OWNER', 'ADMIN'],
    BLOCKED: ['OWNER', 'ADMIN', 'MEMBER'],
    CANCELLED: ['OWNER', 'ADMIN'],
  },
  TODO: {
    BACKLOG: ['OWNER', 'ADMIN'],
    IN_PROGRESS: ['MEMBER'],
    BLOCKED: ['OWNER', 'ADMIN', 'MEMBER'],
    CANCELLED: ['OWNER', 'ADMIN'],
  },
  IN_PROGRESS: {
    IN_REVIEW: ['MEMBER'],
    BLOCKED: ['MEMBER', 'OWNER', 'ADMIN'],
    CANCELLED: ['OWNER', 'ADMIN'],
  },
  IN_REVIEW: {
    BACKLOG: ['OWNER', 'ADMIN'],
    TODO: ['OWNER', 'ADMIN'],
    IN_PROGRESS: ['OWNER', 'ADMIN'],
    BLOCKED: ['OWNER', 'ADMIN'],
    CANCELLED: ['OWNER', 'ADMIN'],
    DONE: ['OWNER', 'ADMIN'],
  },
  BLOCKED: {
    BACKLOG: ['ADMIN', 'OWNER'],
    TODO: ['ADMIN', 'OWNER', 'MEMBER'],
  },
  DONE: {},
  CANCELLED: {},
};
