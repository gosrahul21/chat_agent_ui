import { jwtDecode as jwt } from 'jwt-decode';
export const jwtDecode = (token: string) => {
    return jwt(token);
}