import { enforcePat, extractPatRecord } from '../utils/pat.js';

export function requirePatFor({ action, scope }) {
  return (req, res, next) => {
    const pat = extractPatRecord(req);
    const verdict = enforcePat({ pat, action, scope });

    if (verdict.status !== 'ALLOW') {
      return res.status(428).json({
        status: verdict.status,
        reason: verdict.reason || 'PAT gate blocked'
      });
    }

    req.pat = verdict.normalized;
    return next();
  };
}
