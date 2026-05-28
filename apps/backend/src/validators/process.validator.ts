import { body, param } from 'express-validator';
import mongoose from 'mongoose';

const STATUS_TRANSITION_NOT_ALLOWED = 'Use the transition status endpoint to change status';
const NODES_NOT_EDITABLE_THROUGH_UPDATE = 'Nodes are managed through the template builder';
const EDGES_NOT_EDITABLE_THROUGH_UPDATE = 'Edges are managed through the template builder';

export const createProcessTemplateValidator = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Title must be between 2 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('processType')
    .notEmpty()
    .withMessage('Process type is required')
    .trim()
    .isLength({ max: 100 })
    .withMessage('Process type must not exceed 100 characters'),
  body('organizationScope')
    .optional({ nullable: true })
    .isString()
    .withMessage('Organization scope must be a string'),
  body('nodes')
    .optional()
    .isArray()
    .withMessage('Nodes must be an array'),
  body('nodes.*.id')
    .optional()
    .isString()
    .notEmpty()
    .withMessage('Node ID is required'),
  body('nodes.*.type')
    .optional()
    .isIn(['start', 'task', 'approval', 'document_requirement', 'comment_review', 'end'])
    .withMessage('Invalid node type'),
  body('edges')
    .optional()
    .isArray()
    .withMessage('Edges must be an array'),
  body('edges.*.id')
    .optional()
    .isString()
    .notEmpty()
    .withMessage('Edge ID is required'),
  body('edges.*.source')
    .optional()
    .isString()
    .notEmpty()
    .withMessage('Edge source is required'),
  body('edges.*.target')
    .optional()
    .isString()
    .notEmpty()
    .withMessage('Edge target is required'),
  body('nodeAssignments')
    .optional()
    .isArray()
    .withMessage('Node assignments must be an array'),
  body('nodeAssignments.*.nodeId')
    .optional()
    .isString()
    .notEmpty()
    .withMessage('Assignment nodeId is required'),
  body('nodeAssignments.*.assigneeType')
    .optional()
    .isIn(['user', 'role', 'organization'])
    .withMessage('Assignee type must be user, role, or organization'),
  body('nodeAssignments.*.assigneeId')
    .optional()
    .isString()
    .notEmpty()
    .withMessage('Assignee ID is required'),
];

export const updateProcessTemplateValidator = [
  param('id').notEmpty().withMessage('Template ID is required'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Title must be between 2 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('processType')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Process type must not exceed 100 characters'),
  body('organizationScope')
    .optional({ nullable: true })
    .isString()
    .withMessage('Organization scope must be a string'),
  body('nodes')
    .optional()
    .isArray()
    .withMessage('Nodes must be an array'),
  body('edges')
    .optional()
    .isArray()
    .withMessage('Edges must be an array'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

export const createProcessInstanceValidator = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Title must be between 2 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('templateId')
    .optional()
    .isString()
    .withMessage('Template ID must be a string'),
  body('linkedContentType')
    .optional()
    .isIn(['news', 'announcement', 'event'])
    .withMessage('Linked content type must be news, announcement, or event'),
  body('linkedContentId')
    .optional()
    .isString()
    .withMessage('Linked content ID must be a string'),
  body('organizationId')
    .optional({ nullable: true })
    .isString()
    .withMessage('Organization ID must be a string'),
  body('assignedTo')
    .optional()
    .isArray()
    .withMessage('Assigned to must be an array'),
  body('assignedTo.*')
    .optional()
    .isString()
    .withMessage('Each assignee must be a string'),
  body('status')
    .not()
    .exists()
    .withMessage(STATUS_TRANSITION_NOT_ALLOWED),
  body('nodesSnapshot')
    .not()
    .exists()
    .withMessage(NODES_NOT_EDITABLE_THROUGH_UPDATE),
  body('edgesSnapshot')
    .not()
    .exists()
    .withMessage(EDGES_NOT_EDITABLE_THROUGH_UPDATE),
  body('currentNodeIds')
    .not()
    .exists()
    .withMessage('Current node IDs are managed by the workflow engine'),
  body('comments')
    .not()
    .exists()
    .withMessage('Comments are managed through the comment endpoint'),
  body('requirements')
    .not()
    .exists()
    .withMessage('Requirements are managed through the requirement endpoint'),
  body('approvalSteps')
    .not()
    .exists()
    .withMessage('Approval steps are managed through the approval endpoint'),
  body('startedAt')
    .not()
    .exists()
    .withMessage('startedAt is managed by the workflow engine'),
  body('completedAt')
    .not()
    .exists()
    .withMessage('completedAt is managed by the workflow engine'),
];

export const updateProcessInstanceValidator = [
  param('id').notEmpty().withMessage('Instance ID is required'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Title must be between 2 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('linkedContentType')
    .optional()
    .isIn(['news', 'announcement', 'event'])
    .withMessage('Linked content type must be news, announcement, or event'),
  body('linkedContentId')
    .optional()
    .isString()
    .withMessage('Linked content ID must be a string'),
  body('organizationId')
    .optional({ nullable: true })
    .isString()
    .withMessage('Organization ID must be a string'),
  body('assignedTo')
    .optional()
    .isArray()
    .withMessage('Assigned to must be an array'),
  body('status')
    .not()
    .exists()
    .withMessage(STATUS_TRANSITION_NOT_ALLOWED),
  body('nodesSnapshot')
    .not()
    .exists()
    .withMessage(NODES_NOT_EDITABLE_THROUGH_UPDATE),
  body('edgesSnapshot')
    .not()
    .exists()
    .withMessage(EDGES_NOT_EDITABLE_THROUGH_UPDATE),
  body('currentNodeIds')
    .not()
    .exists()
    .withMessage('Current node IDs are managed by the workflow engine'),
  body('comments')
    .not()
    .exists()
    .withMessage('Comments are managed through the comment endpoint'),
  body('requirements')
    .not()
    .exists()
    .withMessage('Requirements are managed through the requirement endpoint'),
  body('approvalSteps')
    .not()
    .exists()
    .withMessage('Approval steps are managed through the approval endpoint'),
  body('startedAt')
    .not()
    .exists()
    .withMessage('startedAt is managed by the workflow engine'),
  body('completedAt')
    .not()
    .exists()
    .withMessage('completedAt is managed by the workflow engine'),
];

export const processIdValidator = [
  param('id')
    .notEmpty().withMessage('ID is required')
    .custom((val) => mongoose.Types.ObjectId.isValid(val)).withMessage('ID must be a valid MongoDB ObjectId'),
];

export const transitionStatusValidator = [
  param('id').notEmpty().withMessage('Instance ID is required'),
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['draft', 'active', 'completed', 'archived'])
    .withMessage('Status must be one of: draft, active, completed, archived'),
];

export const addProcessCommentValidator = [
  param('id').notEmpty().withMessage('Instance ID is required'),
  body('body')
    .notEmpty()
    .withMessage('Comment body is required')
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Comment must not exceed 5000 characters'),
];

export const toggleProcessRequirementValidator = [
  param('id').notEmpty().withMessage('Instance ID is required'),
  param('reqId').notEmpty().withMessage('Requirement ID is required'),
  body('completed')
    .notEmpty()
    .withMessage('Completed flag is required')
    .isBoolean()
    .withMessage('Completed must be a boolean'),
];

export const approveProcessStepValidator = [
  param('id').notEmpty().withMessage('Instance ID is required'),
  body('nodeId')
    .notEmpty()
    .withMessage('Node ID is required'),
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['approved', 'rejected'])
    .withMessage('Status must be approved or rejected'),
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Reason must not exceed 1000 characters'),
];

export const advanceInstanceValidator = [
  param('id').notEmpty().withMessage('Instance ID is required'),
  body('completedNodeIds')
    .isArray({ min: 1 })
    .withMessage('completedNodeIds must be a non-empty array'),
  body('completedNodeIds.*')
    .isString()
    .notEmpty()
    .withMessage('Each completed node ID must be a non-empty string'),
];

export const updateChecklistItemValidator = [
  param('id').notEmpty().withMessage('Instance ID is required'),
  body('nodeId').notEmpty().withMessage('Node ID is required'),
  body('itemId').notEmpty().withMessage('Checklist item ID is required'),
  body('completed').isBoolean().withMessage('Completed must be a boolean'),
];
