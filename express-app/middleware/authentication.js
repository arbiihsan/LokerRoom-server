const { User } = require('../models');
const { verifyToken } = require('../helpers/jwt');

async function authentication(req, res, next) {
  try {
    const { access_token } = req.headers;
    if (!access_token) throw { name: 'Unauthorized' };
    const decoded = verifyToken(access_token);
    if (!decoded.id || !decoded.name) throw { name: 'Unauthorized' };
    const user = await User.findOne({
      where: { id: decoded.id } 
    });
    if (!user) throw { name: 'Unauthorized' }
    req.user = user;
    console.log('Authenticated', req.url);
    next();
  } catch(err) {
    next(err);
  }
}

module.exports = authentication;