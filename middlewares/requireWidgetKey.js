const widgetrepository = require('../repositories/widget');
const { hashApiKey } = require('../utils/apiKeys');

const checkApiKey = async (req, res, next) => {
  const publicKey = req.params.publicKey || req.query.publicKey || req.headers['x-public-key'];
  if (!publicKey) return res.status(400).json({ error: 'publicKey is required' });

  const widget = await widgetrepository.getWidgetByKeyHash(hashApiKey(publicKey));
  if (!widget) return res.status(404).json({ error: 'Widget not found' });

  if (widget.active === false) return res.status(403).json({ error: 'Widget inactive' });
  if (widget.expire_at && new Date(widget.expire_at).getTime() < Date.now()) {
    return res.status(403).json({ error: 'Widget expired' });
  }

  req.widget = widget;
  next();
};

module.exports = { checkApiKey };
