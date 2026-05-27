import { formsService } from '../services/formsService.js';

function wrapAsync(fn) {
  return (req, res) => Promise.resolve(fn(req, res)).catch((e) => {
    if (e && e.message === 'Invalid form submission' && e.details) {
      return res.status(400).json({ error: e.message, issues: e.details });
    }
    return res.status(500).json({ error: e?.message || 'Internal server error' });
  });
}

export function makeHandleForm(formType) {
  return wrapAsync(async (req, res) => {
    const result = await formsService.handleForm(formType, req.body || {});
    return res.json(result);
  });
}

export const handleFormByParam = wrapAsync(async (req, res) => {
  const formType = req.params?.formType;
  const result = await formsService.handleForm(formType, req.body || {});
  return res.json(result);
});
