import jwt from 'jsonwebtoken';

// user authentication middleware
const authUser = async (req, res, next) => {
    try {

        const { token } = req.headers;
        if (!token) {
            return res.status(401).json({ success: false, message: 'Not Authorized Login Again' });
        }

        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        // ensure req.body exists (GET requests may not have a body parser result)
        if (!req.body) req.body = {};
        req.body.userId = token_decode && token_decode.id ? token_decode.id : null;
        next();

    } catch (error) {
        console.log('authUser error:', error && error.stack ? error.stack : error);
        res.status(401).json({ success: false, message: error.message });
    }
}

export default authUser;
