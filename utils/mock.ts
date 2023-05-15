import type { IWizardGroup } from '../@types';

export const mockWizardData: IWizardGroup[] = [
  {
    name: 'Create New Augmented Reality Tag',
    avgScore: 100,
    avgTimespan: 113.955,
    completed: 2,
    notCompleted: 1,
    completedRatio: 0.6666666666666666,
    total: 3,
    wizards: [
      {
        component: 'wizard-168357091638068',
        name: 'Create New Augmented Reality Tag',
        events: [
          {
            time: '2023-05-08T18:35:16.414Z',
            path: '/Administration/AugmentedReality',
            action: 'Start',
          },
          {
            time: '2023-05-08T18:35:16.580Z',
            path: '/Administration/AugmentedReality',
            action: 'Activate Step cmf.core.augmentedreality.wizardCreateEditEntityTag.step.details',
          },
          {
            time: '2023-05-08T18:35:54.658Z',
            path: '/Administration/AugmentedReality',
            action: 'Success Step cmf.core.augmentedreality.wizardCreateEditEntityTag.step.details',
          },
          {
            time: '2023-05-08T18:35:54.851Z',
            path: '/Administration/AugmentedReality',
            action: 'Complete',
          },
        ],
        score: 100,
        timespan: 38.437,
        completed: true,
        errorCount: 0,
        backStepCount: 0,
      },
      {
        component: 'wizard-168373558363277',
        name: 'Create New Augmented Reality Tag',
        events: [
          {
            time: '2023-05-10T16:19:43.643Z',
            path: '/Administration/AugmentedReality',
            action: 'Start',
          },
          {
            time: '2023-05-10T16:19:43.784Z',
            path: '/Administration/AugmentedReality',
            action: 'Activate Step cmf.core.augmentedreality.wizardCreateEditEntityTag.step.details',
          },
          {
            time: '2023-05-10T16:21:13.642Z',
            path: '/Administration/AugmentedReality',
            action: 'Success Step cmf.core.augmentedreality.wizardCreateEditEntityTag.step.details',
          },
          {
            time: '2023-05-10T16:21:13.746Z',
            path: '/Administration/AugmentedReality',
            action: 'Complete',
          },
        ],
        score: 100,
        timespan: 90.103,
        completed: true,
        errorCount: 0,
        backStepCount: 0,
      },
      {
        component: 'wizard-1683735958646106',
        name: 'Create New Augmented Reality Tag',
        events: [
          {
            time: '2023-05-10T16:25:58.657Z',
            path: '/Administration/AugmentedReality',
            action: 'Start',
          },
          {
            time: '2023-05-10T16:25:58.789Z',
            path: '/Administration/AugmentedReality',
            action: 'Activate Step cmf.core.augmentedreality.wizardCreateEditEntityTag.step.details',
          },
          {
            time: '2023-05-10T16:29:31.982Z',
            path: '/Administration/AugmentedReality',
            action: 'Cancel',
          },
        ],
        score: 100,
        timespan: 213.325,
        completed: false,
        errorCount: 0,
        backStepCount: 0,
      },
    ],
  },
];
