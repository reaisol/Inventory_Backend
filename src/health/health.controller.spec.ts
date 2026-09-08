import { HealthController } from './health.controller';

describe('HealthController', () => {
  it('returns a minimal liveness response', () => {
    expect(new HealthController().check()).toEqual({ status: 'ok' });
  });
});
