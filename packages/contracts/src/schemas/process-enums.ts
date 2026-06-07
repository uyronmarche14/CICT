import { z } from 'zod';
import { ProcessNodeType } from '../enums/process';
import { ProcessInstanceStatus } from '../enums/process';

export const processNodeTypeSchema = z.nativeEnum(ProcessNodeType);
export const processInstanceStatusSchema = z.nativeEnum(ProcessInstanceStatus);
