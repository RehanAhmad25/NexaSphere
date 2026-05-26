import { activityEventsRepository } from '../repositories/activityEventsRepository.js';
import { coreTeamService } from './coreTeamService.js';
import { activityEventSchema } from '../validators/activityEventSchemas.js';

export const activityEventsService = {
  async listActivityEvents(activityKey, { page = 1, limit = 20 } = {}) {
    return activityEventsRepository.listByActivityKey(activityKey, { page, limit });
  },

  async assertCanManage(body) {
    await coreTeamService.assertCanManageActivityEvent(body);
  },

  async addActivityEvent(activityKey, input) {
    const parsed = activityEventSchema.parse(input);
    return activityEventsRepository.create(activityKey, parsed);
  },

  async deleteActivityEvent(activityKey, eventId) {
    return activityEventsRepository.delete(activityKey, eventId);
  },
};
