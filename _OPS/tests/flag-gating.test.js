import { loadFeatureFlags } from '../../backend/src/utils/featureFlags.js';

loadFeatureFlags()
  .then((flags) => {
    if (!flags || flags.autonomy?.enabled !== false) {
      throw new Error('autonomy.enabled should default to false');
    }
    if (flags.admin?.expansion?.phase3?.enabled !== false) {
      throw new Error('admin.expansion.phase3.enabled should default to false');
    }
    console.log('ok');
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
