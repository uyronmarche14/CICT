import { z } from 'zod';
import { ContentOwnerType } from '../enums/content';
import { NewsStatus } from '../enums/content';
import { AnnouncementPriority } from '../enums/content';
import { AnnouncementType } from '../enums/content';
import { EventStatus } from '../enums/content';

export const contentOwnerTypeSchema = z.nativeEnum(ContentOwnerType);
export const newsStatusSchema = z.nativeEnum(NewsStatus);
export const announcementPrioritySchema = z.nativeEnum(AnnouncementPriority);
export const announcementTypeSchema = z.nativeEnum(AnnouncementType);
export const eventStatusSchema = z.nativeEnum(EventStatus);
