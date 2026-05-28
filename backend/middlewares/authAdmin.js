import jwt from 'jsonwebtoken';

// admin authentication middleware
const authAdmin = async (req, res, next) => {
    try {

        // helpful debug: show if atoken header present
        const { atoken } = req.headers;
        // console.log for debug (not sensitive: only presence)
        console.log('authAdmin: atoken header present?', !!atoken);

        if (!atoken) {
            return res.status(401).json({ success: false, message: 'Not Authorized Login Again' });
        }

        let token_decode;
        try {
            token_decode = jwt.verify(atoken, process.env.JWT_SECRET);
        } catch (err) {
            console.log('authAdmin: jwt.verify failed', err.message);
            return res.status(401).json({ success: false, message: 'Invalid token' });
        }

        const expected = (process.env.ADMIN_EMAIL || '') + (process.env.ADMIN_PASSWORD || '');
        if (token_decode !== expected) {
            console.log('authAdmin: token mismatch');
            return res.status(403).json({ success: false, message: 'Not Authorized' });
        }

        next();

    } catch (error) {
        console.log('authAdmin: unexpected error', error);
        res.status(500).json({ success: false, message: error.message });
    }
}

export default authAdmin;
