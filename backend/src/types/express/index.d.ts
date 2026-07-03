// src/@types/express/index.d.ts

import type { JwtPayload } from '../../modules/auth/types/auth.types';

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}

export { };