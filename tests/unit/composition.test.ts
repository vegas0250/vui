import { beforeEach, describe, expect, it } from 'vitest';
import { commandPath, listInteractions, platformKeys } from '../../src/interaction/contract';
import '../../src/interaction/profiles';
import {
  checkCompositionHosts,
  checkDataScenario,
  checkFamilies,
  checkFormScenario,
  checkNavigationScenario,
  checkOverlayScenario,
} from '../../src/composition/scenarios';
import { clearOverlays } from '../../src/core/overlay';

describe('composition and families', () => {
  beforeEach(() => {
    clearOverlays();
    document.body.replaceChildren();
  });

  it('keeps interaction keys inside the platform set', () => {
    expect(commandPath).toEqual(['interaction', 'command', 'action']);
    for (const profile of listInteractions()) {
      expect(platformKeys).toEqual(expect.arrayContaining([...profile.keyboard]));
    }
  });

  it('checks composition hosts', () => {
    expect(checkCompositionHosts()).toEqual([]);
  });

  it('checks family members', () => {
    expect(checkFamilies()).toEqual([]);
  });

  it('checks the form scenario', async () => {
    expect(await checkFormScenario()).toEqual([]);
  });

  it('checks the navigation scenario', async () => {
    expect(await checkNavigationScenario()).toEqual([]);
  });

  it('checks the data scenario', async () => {
    expect(await checkDataScenario()).toEqual([]);
  });

  it('checks the overlay scenario', async () => {
    expect(await checkOverlayScenario()).toEqual([]);
  });
});
