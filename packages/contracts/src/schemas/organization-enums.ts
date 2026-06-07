import { z } from 'zod';
import { OrganizationStatus } from '../enums/organization';
import { OrganizationType } from '../enums/organization';
import { MembershipStatus } from '../enums/organization';
import { MemberType } from '../enums/organization';

export const organizationStatusSchema = z.nativeEnum(OrganizationStatus);
export const organizationTypeSchema = z.nativeEnum(OrganizationType);
export const membershipStatusSchema = z.nativeEnum(MembershipStatus);
export const memberTypeSchema = z.nativeEnum(MemberType);
