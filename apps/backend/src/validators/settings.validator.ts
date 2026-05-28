import { body, param } from 'express-validator';
import { SETTINGS_GROUPS } from '../config/settings';

export const settingsGroupValidator = [
  param('group')
    .isIn(SETTINGS_GROUPS)
    .withMessage(`Group must be one of: ${SETTINGS_GROUPS.join(', ')}`),
];

export const updateSettingsValidator = [
  param('group')
    .isIn(SETTINGS_GROUPS)
    .withMessage(`Group must be one of: ${SETTINGS_GROUPS.join(', ')}`),
  body()
    .isObject()
    .withMessage('Request body must be an object'),
];
